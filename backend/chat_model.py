"""
Chat Model Module
Handles chat-related GPT interactions via Groq API
"""

import os
from typing import List
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client for Groq
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def generate_chat_response(user_message: str, context: str) -> str:
    """Generate a chat response using document context"""
    prompt = f"""You are a helpful tutor explaining concepts from a document. Answer the user's question in a clear, conversational way using simple language. Avoid technical formatting, markdown, or complex symbols.

Document Content:
{context}

User Question: {user_message}

Please explain this in simple, easy-to-understand language as if you're talking to a student:"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on provided document content."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chat API error: {e}")
        return f"Error generating response: {str(e)}"

def is_greeting_message(message: str) -> bool:
    """Check if the message is a greeting or casual response"""
    greeting_words = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
    casual_words = ["thanks", "thank you", "ok", "okay", "cool", "nice", "great"]
    
    message_lower = message.lower().strip()
    
    # Check for greetings
    if any(greeting in message_lower for greeting in greeting_words):
        return True
    
    # Check for casual responses (short ones)
    if any(casual in message_lower for casual in casual_words) and len(message_lower.split()) <= 3:
        return True
    
    # Check for very short messages that aren't questions
    if len(message_lower.split()) <= 2 and "?" not in message_lower:
        return True
    
    return False

def get_greeting_response(message: str) -> str:
    """Get appropriate response for greetings and casual messages"""
    greeting_words = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
    casual_words = ["thanks", "thank you", "ok", "okay", "cool", "nice", "great"]
    
    message_lower = message.lower().strip()
    
    # Handle greetings
    if any(greeting in message_lower for greeting in greeting_words):
        return "Hello! I'm here to help you understand the document you've uploaded. Feel free to ask me any questions about its content!"
    
    # Handle casual responses
    if any(casual in message_lower for casual in casual_words) and len(message_lower.split()) <= 3:
        return "You're welcome! Do you have any other questions about the document?"
    
    # Handle very short messages that aren't questions
    if len(message_lower.split()) <= 2 and "?" not in message_lower:
        return "I'm here to help you with questions about the document. What would you like to know?"
    
    return "I'm here to help you with questions about the document. What would you like to know?"
