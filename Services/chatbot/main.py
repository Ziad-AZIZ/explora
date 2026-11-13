from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from chatbot import *

app = FastAPI(title="Morocco Hotels API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def health():
    return {"status": "ok", "message": "Morocco Hotels API is running"}

@app.post("/chat")
def chat(req: ChatRequest):
    user_input  = req.message
    nlu         = understand(user_input)
    season_info = get_season_info(user_input)
    saison      = season_info.get("season") or "moyenne"
    intent      = nlu.get("intent")
    city        = nlu.get("city")
    min_stars   = nlu.get("min_stars")
    max_stars   = nlu.get("max_stars")
    max_price   = nlu.get("max_price")
    lang        = nlu.get("language", "fr")

    if intent == "search":
        results = search_hotels(
            city=city, min_stars=min_stars, max_stars=max_stars,
            max_price=max_price,
            want_pool=nlu.get("want_pool", False),
            want_spa=nlu.get("want_spa", False),
            want_restaurant=nlu.get("want_restaurant", False),
            want_wifi=nlu.get("want_wifi", False),
            want_gym=nlu.get("want_gym", False),
            near_beach=nlu.get("near_beach", False),
            near_medina=nlu.get("near_medina", False),
            top_n=5
        )
        if results.empty:
            return {"intent": "search", "hotels": [], "message": "Aucun hôtel trouvé."}
        hotels = []
        for _, row in results.iterrows():
            stars = int(row["rating_num"]) if pd.notna(row["rating_num"]) else 0
            hotels.append({
                "name":          row["HotelName"],
                "city":          row["cityName"],
                "stars":         stars,
                "price":         get_price(stars, saison),
                "saison":        saison,
                "address":       str(row.get("Address", "N/A")),
                "phone":         str(row.get("PhoneNumber", "N/A")),
                "website":       str(row.get("HotelWebsiteUrl", "N/A")),
                "facilities":    str(row["HotelFacilities"])[:200] if pd.notna(row["HotelFacilities"]) else "N/A",
                "ml_stars":      int(row["predicted_stars"]) if "predicted_stars" in row.index else stars,
                "ml_confidence": float(row["ml_confidence"]) if "ml_confidence" in row.index else 0.0,
            })
        return {"intent": "search", "hotels": hotels, "message": format_results(results, user_input, lang)}

    elif intent == "details":
        hotel_name = nlu.get("hotel_name")
        hotel_row  = find_hotel_by_name(hotel_name) if hotel_name else None
        if hotel_row is not None:
            stars = int(hotel_row["rating_num"]) if pd.notna(hotel_row["rating_num"]) else 0
            return {"intent": "details", "hotel": {
                "name":        hotel_row["HotelName"],
                "city":        hotel_row["cityName"],
                "stars":       stars,
                "price":       get_price(stars, saison),
                "address":     str(hotel_row.get("Address", "N/A")),
                "phone":       str(hotel_row.get("PhoneNumber", "N/A")),
                "website":     str(hotel_row.get("HotelWebsiteUrl", "N/A")),
                "facilities":  str(hotel_row["HotelFacilities"])[:300],
                "description": str(hotel_row["Description"])[:500],
            }}
        return {"intent": "details", "hotel": None, "message": "Hôtel non trouvé."}

    elif intent == "plan":
        plan = generate_plan(user_input, lang)
        return {"intent": "plan", "message": plan}

    elif intent == "cities":
        cities = df["cityName"].value_counts().head(15)
        return {"intent": "cities", "cities": [
            {"name": c, "count": int(n)} for c, n in cities.items()
        ]}

    else:
        answer = groq_free_answer(user_input, lang)
        return {"intent": intent, "message": answer}
