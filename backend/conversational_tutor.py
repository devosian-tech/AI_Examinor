"""
Conversational Tutor Module
Handles conversational learning sessions with context and progress tracking
"""

from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# Store active sessions (in production, use Redis or database)
active_sessions = {}

class TutorSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.conversation_history = []
        self.current_topic = None
        self.questions_asked = 0
        self.correct_answers = 0
    
    def to_dict(self):
        return {
            "session_id": self.session_id,
            "current_topic": self.current_topic,
            "questions_asked": self.questions_asked,
            "correct_answers": self.correct_answers,
            "accuracy": (self.correct_answers / self.questions_asked * 100) if self.questions_asked > 0 else 0
        }

def get_or_create_session(session_id: str) -> TutorSession:
    """Get existing session or create new one"""
    if session_id not in active_sessions:
        active_sessions[session_id] = TutorSession(session_id)
    return active_sessions[session_id]

async def get_tutor_response(session_id: str, user_input: str, mode: str = "conversation") -> dict:
    """Get conversational response from tutor"""
    session = get_or_create_session(session_id)
    
    try:
        # Build context-aware messages
        messages = [
            {"role": "system", "content": """You are a friendly, enthusiastic AI tutor having a natural conversation with a student. 

Your personality:
- Talk like a real person, not a robot
- Use casual, warm language
- Show genuine interest in helping the student learn
- Be encouraging and supportive
- Use examples and analogies from everyday life
- Ask follow-up questions naturally
- Share your excitement about topics
- Admit when something is tricky and work through it together

Conversation style:
- Keep responses short and conversational (2-3 sentences)
- Use contractions (I'm, you're, let's, etc.)
- Vary your sentence structure
- Use expressions like "Great question!", "I love that you asked about this!", "Let me explain..."
- Don't be overly formal or academic
- React naturally to what the student says

Teaching approach:
- Explain concepts simply, like you're chatting with a friend
- Use real-world examples
- Check understanding by asking questions naturally
- Celebrate progress and effort
- Make learning feel like a conversation, not a lecture

Remember: You're not just answering questions - you're having a genuine conversation about learning!"""}
        ]
        
        # Add conversation history for context (last 6 messages)
        messages.extend(session.conversation_history[-6:])
        
        # Add current user input
        messages.append({"role": "user", "content": user_input})
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=250,
            temperature=0.9  # Higher temperature for more natural, varied responses
        )
        
        response = completion.choices[0].message.content
        
        # Update conversation history
        session.conversation_history.append({"role": "user", "content": user_input})
        session.conversation_history.append({"role": "assistant", "content": response})
        
        # Check if this is setting a topic
        if any(word in user_input.lower() for word in ["explain", "what is", "tell me about", "teach me"]):
            # Extract topic (simple extraction)
            for phrase in ["explain", "what is", "tell me about", "teach me about"]:
                if phrase in user_input.lower():
                    session.current_topic = user_input.lower().replace(phrase, "").strip()
                    break
        
        return {
            "response": response,
            "session_info": session.to_dict()
        }
        
    except Exception as e:
        print(f"Tutor response error: {e}")
        return {
            "response": "Hmm, I'm having a bit of trouble right now. Could you say that again?",
            "session_info": session.to_dict()
        }

async def evaluate_student_answer(session_id: str, question: str, user_answer: str) -> dict:
    """Evaluate student's answer and provide feedback"""
    session = get_or_create_session(session_id)
    
    try:
        messages = [
            {"role": "system", "content": """You're a supportive tutor giving feedback on a student's answer. Talk naturally and warmly!

Your feedback style:
- Start with something positive and encouraging
- Be conversational, not formal
- Use phrases like "I can see you're thinking about this!", "Nice try!", "You're on the right track!"
- Point out what they got right first
- Gently guide them on what to improve
- End with encouragement
- Keep it brief (2-3 sentences total)
- Sound like a real person having a conversation

Remember: You're not grading a test - you're helping a friend learn!"""},
            {"role": "user", "content": f"Question: {question}\nStudent's Answer: {user_answer}\n\nGive friendly, conversational feedback."}
        ]
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=180,
            temperature=0.9
        )
        
        feedback = completion.choices[0].message.content
        
        # Update session stats
        session.questions_asked += 1
        
        # Simple scoring based on keywords in feedback
        if any(word in feedback.lower() for word in ["correct", "right", "good", "excellent", "well done", "great", "perfect", "nice", "exactly"]):
            session.correct_answers += 1
            is_correct = True
        else:
            is_correct = False
        
        # Add to conversation history
        session.conversation_history.append({"role": "user", "content": user_answer})
        session.conversation_history.append({"role": "assistant", "content": feedback})
        
        return {
            "feedback": feedback,
            "is_correct": is_correct,
            "session_info": session.to_dict()
        }
        
    except Exception as e:
        print(f"Evaluation error: {e}")
        return {
            "feedback": "Hey, I couldn't quite process that. Let's keep going though!",
            "is_correct": False,
            "session_info": session.to_dict()
        }

async def generate_practice_question(session_id: str, topic: str = None) -> dict:
    """Generate a practice question"""
    session = get_or_create_session(session_id)
    
    # Use provided topic or session's current topic
    question_topic = topic or session.current_topic or "general knowledge"
    
    try:
        messages = [
            {"role": "system", "content": """You're a tutor creating a practice question. Make it conversational and engaging!

Style:
- Ask the question naturally, like you're chatting
- Use phrases like "Alright, here's one for you:", "Let me ask you this:", "Quick question:"
- Keep it clear and specific
- Make it interesting and relevant
- Don't be too formal

Create ONE question that tests understanding. Keep it conversational!"""},
            {"role": "user", "content": f"Create a practice question about: {question_topic}"}
        ]
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=120,
            temperature=0.9
        )
        
        question = completion.choices[0].message.content
        
        # Add to conversation history
        session.conversation_history.append({"role": "assistant", "content": question})
        
        return {
            "question": question,
            "topic": question_topic,
            "session_info": session.to_dict()
        }
        
    except Exception as e:
        print(f"Question generation error: {e}")
        return {
            "question": f"Hey, so tell me - what do you think are the main ideas behind {question_topic}?",
            "topic": question_topic,
            "session_info": session.to_dict()
        }

def reset_session(session_id: str) -> dict:
    """Reset a session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
    
    return {
        "success": True,
        "message": "Session reset successfully"
    }

def get_session_progress(session_id: str) -> dict:
    """Get session progress"""
    session = get_or_create_session(session_id)
    return session.to_dict()
