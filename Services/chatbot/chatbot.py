import pandas as pd
import numpy as np
import pickle
import json
import os
import re
from groq import Groq
from sklearn.preprocessing import LabelEncoder

with open("model/hotel_model.pkl", "rb") as f:
    saved      = pickle.load(f)
    model      = saved["model"]
    le         = saved["label_encoder"]
    FEATURES   = saved["features"]
    rating_map = saved["rating_map"]
    top_cities = saved["top_cities"]

df = pd.read_csv("data/MoroccoHotels2.csv")
df.columns = df.columns.str.strip()

rating_map_num = {
    "OneStar": 1, "TwoStar": 2, "ThreeStar": 3,
    "FourStar": 4, "FiveStar": 5, "All": 3
}
df["rating_num"] = df["HotelRating"].map(rating_map_num)
df = df.dropna(subset=["rating_num"])
df["rating_num"] = df["rating_num"].astype(int)

df["facilities_count"] = df["HotelFacilities"].fillna("").apply(
    lambda x: len([f for f in x.split(",") if f.strip()])
)
df["desc_length"]     = df["Description"].fillna("").apply(len)
df["has_website"]     = df["HotelWebsiteUrl"].notna().astype(int)
df["has_phone"]       = df["PhoneNumber"].notna().astype(int)
df["has_fax"]         = df["FaxNumber"].notna().astype(int)
df["has_attractions"] = df["Attractions"].notna().astype(int)
df["has_pincode"]     = df["PinCode"].notna().astype(int)

fac = df["HotelFacilities"].fillna("").str.lower()
df["has_pool"]       = fac.str.contains("pool").astype(int)
df["has_spa"]        = fac.str.contains("spa").astype(int)
df["has_restaurant"] = fac.str.contains("restaurant").astype(int)
df["has_gym"]        = fac.str.contains("gym|fitness").astype(int)
df["has_wifi"]       = fac.str.contains("wifi|wi-fi|internet").astype(int)
df["has_parking"]    = fac.str.contains("parking").astype(int)
df["has_bar"]        = fac.str.contains("bar|lounge").astype(int)
df["has_ac"]         = fac.str.contains("air.condition|air-condition").astype(int)

att = df["Attractions"].fillna("").str.lower()
df["near_beach"]    = att.str.contains("beach|sea|ocean").astype(int)
df["near_airport"]  = att.str.contains("airport").astype(int)
df["near_medina"]   = att.str.contains("medina|old city|souk").astype(int)
df["near_mountain"] = att.str.contains("mountain|atlas").astype(int)

top_cities_series = df["cityName"].value_counts().nlargest(20).index
df["cityName_enc"] = df["cityName"].apply(
    lambda x: x if x in top_cities_series else "Other"
)
df["city_encoded"] = le.transform(df["cityName_enc"])

REAL_PRICES = {
    1: {"basse": 150,  "moyenne": 200,  "haute": 280},
    2: {"basse": 300,  "moyenne": 400,  "haute": 550},
    3: {"basse": 500,  "moyenne": 700,  "haute": 950},
    4: {"basse": 900,  "moyenne": 1300, "haute": 1800},
    5: {"basse": 1800, "moyenne": 2800, "haute": 4500},
}

df["price_per_night"] = df["rating_num"].map(
    lambda x: REAL_PRICES.get(x, {}).get("moyenne", 500)
)

CITY_ALIASES = {
    "marrakech":  "Marrakesch",
    "marrakesh":  "Marrakesch",
    "fez":        "Fes",
    "fès":        "Fes",
    "rabat":      "Rabat",
    "tabat":      "Rabat",
    "tanger":     "Tanger",
    "tangier":    "Tanger",
    "casablanca": "Casablanca",
    "agadir":     "Agadir",
    "marrakesch": "Marrakesch",
}

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_price(stars, saison="moyenne"):
    return int(REAL_PRICES.get(stars, {}).get(saison, 500))

def find_hotel_by_name(query):
    if not query or len(query.split()) > 6:
        return None
    query_lower = query.lower()
    match = df[df["HotelName"].str.lower().str.contains(query_lower, na=False)]
    if not match.empty:
        return match.iloc[0]
    return None

def search_hotels(city=None, min_stars=None, max_stars=None,
                  max_price=None,
                  want_pool=False, want_spa=False, want_restaurant=False,
                  want_wifi=False, want_gym=False, near_beach=False,
                  near_medina=False, top_n=5):
    results = df.copy()
    if city:
        city_normalized = CITY_ALIASES.get(city.lower(), city)
        results = results[results["cityName"].str.lower() == city_normalized.lower()]
    if min_stars:
        results = results[results["rating_num"] >= min_stars]
    if max_stars:
        results = results[results["rating_num"] <= max_stars]
    if max_price:
        results = results[results["price_per_night"] <= max_price]
    fac = results["HotelFacilities"].fillna("").str.lower()
    att = results["Attractions"].fillna("").str.lower()
    if want_pool:       results = results[fac.str.contains("pool")]
    if want_spa:        results = results[fac.str.contains("spa")]
    if want_restaurant: results = results[fac.str.contains("restaurant")]
    if want_wifi:       results = results[fac.str.contains("wifi|wi-fi|internet")]
    if want_gym:        results = results[fac.str.contains("gym|fitness")]
    if near_beach:      results = results[att.str.contains("beach|sea|ocean")]
    if near_medina:     results = results[att.str.contains("medina|old city|souk")]
    if not results.empty:
        try:
            predicted  = model.predict(results[FEATURES])
            confidence = model.predict_proba(results[FEATURES]).max(axis=1) * 100
            results    = results.copy()
            results["predicted_stars"] = predicted
            results["ml_confidence"]   = confidence.round(1)
            results = results.sort_values("ml_confidence", ascending=False)
        except:
            pass
    return results.head(top_n)

def understand(user_input):
    prompt = f"""You are a hotel assistant for Morocco.
Analyze this user message and return ONLY a valid JSON object, nothing else.
User message: "{user_input}"
Return this exact JSON structure:
{{
  "intent": "search" or "details" or "cities" or "star_info" or "how_many" or "greeting" or "goodbye" or "help" or "general" or "plan" or "unknown",
  "city": city name in Morocco or null,
  "hotel_name": exact hotel name if user asks about a specific hotel or null,
  "quantity": number if user says how many hotels they want or null,
  "max_price": number in MAD if user mentions a price limit or null,
  "min_stars": number 1-5 or null,
  "max_stars": number 1-5 or null,
  "want_pool": true or false,
  "want_spa": true or false,
  "want_restaurant": true or false,
  "want_wifi": true or false,
  "want_gym": true or false,
  "near_beach": true or false,
  "near_medina": true or false,
  "near_mountain": true or false,
  "hotel_number": number if user selects a hotel by number or null,
  "language": "en" or "fr" or "ar",
  "natural_reply": a SHORT confirmation in the user language NO questions
}}
CRITICAL intent rules:
- "search" ONLY when user wants to FIND or LIST hotels
- "details" when user asks about a SPECIFIC hotel by name
- "general" for history, culture, food, weather, activities questions
- "plan" ONLY when user asks for a day-by-day itinerary or match schedule
- luxury = min_stars 4
- cheap = max_stars 2
- natural_reply must NEVER contain a question mark
- Return ONLY the JSON no markdown no explanation
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.1
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        print(f"[Groq NLU error] {e}")
        return {"intent": "unknown", "language": "fr"}

def get_season_info(user_input):
    prompt = f"""Analyze this message: "{user_input}"
Return ONLY a JSON:
{{
  "month": number 1-12 or null,
  "season": "haute" or "moyenne" or "basse" or null,
  "want_price": true or false
}}
Rules:
- summer/juillet/aout/July/August = haute saison
- winter/hiver/decembre/December  = haute saison
- spring/printemps/mars/April     = moyenne saison
- low season/basse saison/janvier = basse saison
Return ONLY JSON."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.1
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except:
        return {"month": None, "season": "moyenne", "want_price": False}

def format_results(results_df, user_input, lang):
    hotels_text = ""
    for i, (_, row) in enumerate(results_df.iterrows(), 1):
        stars = int(row["rating_num"]) if pd.notna(row["rating_num"]) else 0
        hotels_text += f"{i}. {row['HotelName']} — {stars} stars — {row['cityName']}\n"
    prompt = f"""The user asked: "{user_input}"
We found these hotels:
{hotels_text}
Write ONE short friendly sentence in language "{lang}" to introduce these results.
No questions no suggestions. Max 15 words. Return only the sentence."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except:
        return f"Voici {len(results_df)} hotels trouvés."

def groq_free_answer(user_input, lang):
    prompt = f"""You are a helpful Morocco travel assistant.
The user asks: "{user_input}"
Answer in the same language as the user.
If they ask about activities things to do or recommendations give a clear organized list grouped by category.
Be specific to Morocco and the season mentioned.
Do NOT generate a hour-by-hour plan unless explicitly asked.
Reply in language: {lang}. Be friendly and specific. No questions at the end."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Désolé je n'ai pas pu répondre. ({e})"

def generate_plan(user_input, lang):
    prompt = f"""You are an expert travel planner for Morocco.
The user asks: "{user_input}"
IMPORTANT rules:
- If the user mentions a stadium or a match at a specific time plan ALL activities geographically close to that stadium.
- Respect timing: activities BEFORE the match must end 1 hour before kick-off.
- When user writes 20h 16h etc treat it as 24h format NOT duration.
- Start the plan from morning 9h-10h and build up to the match time.
Known Moroccan stadiums:
- Stade de Marrakech       → Palmeraie Route de Casablanca
- Stade Moulay Abdallah    → Hay Riad Agdal Rabat
- Stade Adrar              → Nouveau Talborjt Marina Agadir
- Stade Mohammed V         → Maarif Casablanca
- Stade de Fes             → Narjiss Route Imouzzer
Create a detailed hour-by-hour plan. Reply in language: {lang}. No questions at the end."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Désolé je n'ai pas pu générer le plan. ({e})"
