"""
SOURCIFY - Flask Web Application
Healthcare AI Chatbot with Web Interface
"""

from flask import Flask, render_template_string, request, jsonify
import re
from datetime import datetime

app = Flask(__name__)

class HealthcareAIChatbot:
    """Healthcare AI Chatbot"""
    
    def __init__(self):
        # Medical Knowledge Base
        self.knowledge_base = {
            'back_pain': {
                'name': 'Back Pain',
                'keywords': ['back pain', 'lower back', 'spine pain', 'backache', 'lumbar', 'sciatica'],
                'therapies': [
                    'Physical therapy 3 times per week focusing on core strengthening',
                    'Stretching exercises: Cat-cow, child\'s pose, knee-to-chest stretches',
                    'Heat therapy for 15-20 minutes, 2-3 times daily',
                    'Ergonomic assessment of workplace and sleeping position',
                    'NSAIDs for pain management (consult doctor for dosage)',
                    'Avoid prolonged sitting - take breaks every 30 minutes'
                ],
                'exercises': ['Pelvic tilts', 'Bird dog', 'Bridges', 'Wall planks'],
                'duration': '8-12 weeks for noticeable improvement'
            },
            'anxiety': {
                'name': 'Anxiety Disorder',
                'keywords': ['anxiety', 'panic', 'stress', 'worried', 'nervous', 'tension', 'anxious'],
                'therapies': [
                    'Cognitive Behavioral Therapy (CBT) with licensed therapist',
                    'Mindfulness meditation 15-20 minutes daily',
                    'Progressive muscle relaxation techniques',
                    'Regular aerobic exercise (30 min, 5x/week)',
                    'Deep breathing exercises: 4-7-8 technique',
                    'Limit caffeine and alcohol intake'
                ],
                'exercises': ['Box breathing', 'Body scan meditation', 'Grounding techniques', 'Yoga'],
                'duration': '3-6 months with consistent therapy'
            },
            'diabetes': {
                'name': 'Diabetes Management',
                'keywords': ['diabetes', 'blood sugar', 'insulin', 'diabetic', 'glucose', 'a1c'],
                'therapies': [
                    'Monitor blood glucose levels 3-4 times daily',
                    'Balanced meal plan with carb counting (consult dietitian)',
                    'Regular physical activity: 150 min/week moderate exercise',
                    'Medication adherence as prescribed',
                    'HbA1c testing every 3 months',
                    'Daily foot inspection and proper foot care'
                ],
                'exercises': ['Brisk walking', 'Cycling', 'Swimming', 'Resistance training'],
                'duration': 'Lifelong management with quartetly reviews'
            },
            'knee_pain': {
                'name': 'Knee Problems',
                'keywords': ['knee pain', 'knee injury', 'knee swelling', 'acl', 'meniscus', 'patella'],
                'therapies': [
                    'RICE protocol: Rest, Ice (20 min), Compression, Elevation',
                    'Physical therapy for quadriceps and hamstring strengthening',
                    'Low-impact exercises: swimming, cycling, elliptical',
                    'Proper footwear with good arch support',
                    'Weight management to reduce joint stress'
                ],
                'exercises': ['Straight leg raises', 'Wall squats', 'Hamstring curls'],
                'duration': '6-8 weeks for minor injuries'
            },
            'depression': {
                'name': 'Depression',
                'keywords': ['depression', 'sad', 'hopeless', 'depressed', 'low mood', 'fatigue'],
                'therapies': [
                    'Consult mental health professional immediately',
                    'Psychotherapy: CBT or interpersonal therapy',
                    'Regular physical exercise (proven mood booster)',
                    'Maintain social connections - avoid isolation',
                    'Sleep hygiene: consistent bedtime, dark room',
                    'Balanced nutrition with omega-3 fatty acids'
                ],
                'exercises': ['Daily walks outdoors', 'Yoga', 'Group fitness classes'],
                'duration': '6-12 months of therapy, ongoing management'
            },
            
            'headache': {
                'name': 'Headache/Migraine',
                'keywords': ['headache', 'migraine', 'head pain', 'tension headache'],
                'therapies': [
                    'Keep headache diary to identify triggers',
                    'Stress management: meditation, yoga, biofeedback',
                    'Regular sleep schedule (same time daily)',
                    'Stay hydrated: 8-10 glasses water per day',
                    'Avoid trigger foods (caffeine, alcohol, processed foods)',
                    'Cold compress on forehead for 15 minutes'
                ],
                'exercises': ['Neck stretches', 'Shoulder rolls', 'Gentle yoga'],
                'duration': 'Variable; preventive approach ongoing'
            }
        }
        
        self.conversation_history = []
    
    def analyze_input(self, user_input):
        """
        ML Algorithm: Pattern Matching with Confidence Scoring
        """
        user_input = user_input.lower()
        best_match = None
        highest_confidence = 0
        
        for condition_id, condition_data in self.knowledge_base.items():
            match_count = sum(1 for kw in condition_data['keywords'] if kw in user_input)
            confidence = (match_count / len(condition_data['keywords'])) * 100
            
            if confidence > highest_confidence:
                highest_confidence = confidence
                best_match = {
                    'condition': condition_data['name'],
                    'confidence': confidence,
                    'therapies': condition_data['therapies'],
                    'exercises': condition_data['exercises'],
                    'duration': condition_data['duration']
                }
        
        return best_match, highest_confidence
    
    def chat(self, user_input):
        match, confidence = self.analyze_input(user_input)
        
        if confidence == 0 or match is None:
            return {
                'type': 'no_match',
                'message': "I couldn't identify a specific condition. Please provide more details about symptoms."
            }
        
        return {
            'type': 'match',
            'condition': match['condition'],
            'confidence': round(confidence, 1),
            'therapies': match['therapies'],
            'exercises': match['exercises'],
            'duration': match['duration']
        }

# Initialize chatbot
chatbot = HealthcareAIChatbot()

# HTML Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>SOURCIFY - Healthcare AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
        }
        .chatbox {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            height: 500px;
            display: flex;
            flex-direction: column;
        }
        .messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        .message {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 10px;
            max-width: 80%;
        }
        .user-message {
            background: #667eea;
            color: white;
            margin-left: auto;
        }
        .bot-message {
            background: #f0f0f0;
            color: #333;
        }
        .result-box {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .confidence {
            background: #667eea;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            display: inline-block;
            margin: 5px 0;
        }
        .therapy-list {
            list-style: none;
            padding-left: 0;
        }
        .therapy-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .therapy-list li:before {
            content: "✓ ";
            color: #4caf50;
            font-weight: bold;
        }
        .input-area {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        .input-area input {
            flex: 1;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
        }
        .input-area input:focus {
            border-color: #667eea;
        }
        .input-area button {
            padding: 15px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        .input-area button:hover {
            background: #5568d3;
        }
        .quick-buttons {
            padding: 10px 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            border-top: 1px solid #e0e0e0;
        }
        .quick-btn {
            padding: 8px 15px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 20px;
            cursor: pointer;
            font-size: 13px;
        }
        .quick-btn:hover {
            background: #667eea;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 SOURCIFY Healthcare AI</h1>
            <p>Intelligent Medical Therapy Assistant | Team CodeX</p>
        </div>
        
        <div class="chatbox">
            <div class="messages" id="messages">
                <div class="message bot-message">
                    👋 Hello! I'm your AI healthcare assistant. Tell me about symptoms or conditions, and I'll provide evidence-based therapy recommendations.
                </div>
            </div>
            
            <div class="quick-buttons">
                <button class="quick-btn" onclick="quickMessage('I have chronic back pain')">Back Pain</button>
                <button class="quick-btn" onclick="quickMessage('What exercises help with anxiety?')">Anxiety</button>
                <button class="quick-btn" onclick="quickMessage('Diabetes management tips')">Diabetes</button>
            </div>
            
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Describe symptoms or ask a question..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script>
        function addMessage(text, isUser) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + (isUser ? 'user-message' : 'bot-message');
            messageDiv.innerHTML = text;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function formatBotResponse(data) {
            if (data.type === 'no_match') {
                return data.message;
            }

            let html = '<div class="result-box">';
            html += '<h3>🔍 ' + data.condition + '</h3>';
            html += '<span class="confidence">Confidence: ' + data.confidence + '%</span>';
            html += '<h4 style="margin-top: 15px;">📋 Treatment Plan:</h4>';
            html += '<ul class="therapy-list">';
            data.therapies.forEach(therapy => {
                html += '<li>' + therapy + '</li>';
            });
            html += '</ul>';
            html += '<h4 style="margin-top: 15px;">💪 Exercises:</h4>';
            html += '<p>' + data.exercises.join(', ') + '</p>';
            html += '<p style="margin-top: 10px;"><strong>⏱️ Duration:</strong> ' + data.duration + '</p>';
            html += '</div>';
            return html;
        }

        async function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            addMessage(message, true);
            input.value = '';
            
            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message: message})
                });
                
                const data = await response.json();
                addMessage(formatBotResponse(data), false);
            } catch (error) {
                addMessage('Error: Could not connect to server', false);
            }
        }

        function quickMessage(text) {
            document.getElementById('userInput').value = text;
            sendMessage();
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    response = chatbot.chat(user_message)
    return jsonify(response)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 SOURCIFY Web App Starting...")
    print("="*60)
    print("📍 Open: http://localhost:5000")
    print("💡 Press Ctrl+C to stop")
    print("="*60 + "\n")
    app.run(debug=True, port=5000)