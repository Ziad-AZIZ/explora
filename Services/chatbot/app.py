from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'chatbot',
        'version': '1.0.0'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message vide'}), 400
        
        # Réponse simple du chatbot
        bot_reply = generer_reponse(user_message)
        
        return jsonify({
            'reply': bot_reply,
            'timestamp': datetime.now().isoformat(),
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generer_reponse(message):
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['hotel', 'hôtel', 'chambre']):
        return "Je peux vous aider à trouver un hôtel ! Dans quelle ville ?"
    
    elif any(word in message_lower for word in ['restaurant', 'table']):
        return "Je peux réserver une table ! Combien de personnes ?"
    
    elif any(word in message_lower for word in ['bonjour', 'salut']):
        return "Bonjour ! Comment puis-je vous aider avec votre réservation ?"
    
    else:
        return "Je peux vous aider avec les réservations d'hôtels et restaurants. Que souhaitez-vous ?"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
