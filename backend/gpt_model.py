"""
GPT Model Integration Module
Handles all GPT-OSS-20B model interactions via Groq API
"""

import os
import random
import re
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

async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings using OpenAI API via Groq"""
    try:
        # For now, we'll use a simple fallback since Groq might not have embeddings
        # You can replace this with actual embedding calls if available
        return [[random.random() for _ in range(384)] for _ in texts]
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        # Fallback to simple random embeddings for demo
        return [[random.random() for _ in range(384)] for _ in texts]

async def generate_text_with_gpt(prompt: str, max_tokens: int = 500) -> str:
    """Generate text using the gpt-oss-20b model via Groq"""
    try:
        # Try responses API first (preferred for gpt-oss models)
        response = client.responses.create(
            input=prompt,
            model="openai/gpt-oss-20b",
        )
        return response.output_text.strip()
    except Exception as e:
        print(f"Responses API error: {e}")
        try:
            # Fallback to chat completions API
            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on provided document content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e2:
            print(f"Chat API error: {e2}")
            return f"Error generating response: {str(e2)}"

async def generate_chat_response(user_message: str, context: str) -> str:
    """Generate a chat response using document context"""
    prompt = f"""You are a helpful tutor explaining concepts from a document. Answer the user's question in a clear, conversational way using simple language. Avoid technical formatting, markdown, or complex symbols.

Document Content:
{context}

User Question: {user_message}

Please explain this in simple, easy-to-understand language as if you're talking to a student:"""
    
    return await generate_text_with_gpt(prompt, max_tokens=300)

async def generate_tutor_question(chunk_text: str) -> str:
    """Generate a short tutor question from document content"""
    prompt = f"""Based on this document section, create a SHORT question that can be answered in 1-2 sentences. Make it simple and specific.

Document excerpt:
{chunk_text}

Create a brief, focused question that asks for a specific fact or concept. The answer should only need 1-2 sentences:"""
    
    question = await generate_text_with_gpt(prompt, max_tokens=100)
    return question if question else "What are the main concepts discussed in this document section?"

async def evaluate_tutor_answer(question: str, user_answer: str, context: str) -> dict:
    """Evaluate a student's answer and return structured feedback"""
    prompt = f"""You are a friendly tutor evaluating a student's answer. Be encouraging and helpful. Give feedback in simple, clear language without technical formatting.

Question: {question}
Student's Answer: {user_answer}
Reference Material: {context}

Instructions:
- If the student says "I don't know" or similar, don't provide an improved answer - just encourage them to try
- Give a score from 1 to 10
- Be encouraging about what they did well
- Suggest what could be improved
- Only provide a better explanation if they attempted an answer

Keep your response conversational and easy to read:"""
    
    evaluation_text = await generate_text_with_gpt(prompt, max_tokens=300)
    
    # Check if user said "I don't know" or similar
    dont_know_phrases = ["i don't know", "don't know", "no idea", "not sure", "idk", "dunno"]
    user_said_dont_know = any(phrase in user_answer.lower() for phrase in dont_know_phrases)
    
    # Parse the response (more flexible parsing for conversational format)
    try:
        # Look for score in the text
        score = 1 if user_said_dont_know else 5  # Lower score for "don't know"
        score_patterns = [
            r'score[:\s]*(\d+)',
            r'(\d+)\s*out of 10',
            r'(\d+)/10',
            r'rate[:\s]*(\d+)',
            r'give[:\s]*(\d+)'
        ]
        
        for pattern in score_patterns:
            match = re.search(pattern, evaluation_text.lower())
            if match:
                try:
                    score = int(match.group(1))
                    break
                except:
                    continue
        
        # Extract feedback sections more flexibly
        lines = evaluation_text.split('\n')
        correct_points = []
        missing_points = []
        improved_answer = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for positive feedback
            if any(word in line.lower() for word in ['good', 'correct', 'well', 'right', 'nice', 'excellent']):
                if len(line) > 20:  # Avoid short phrases
                    correct_points.append(line)
            
            # Look for improvement suggestions
            elif any(word in line.lower() for word in ['improve', 'better', 'missing', 'could', 'should', 'try']):
                if len(line) > 20:
                    missing_points.append(line)
            
            # Look for improved answer (only if they didn't say "don't know")
            elif not user_said_dont_know and any(word in line.lower() for word in ['better way', 'improved', 'explanation', 'answer']):
                if len(line) > 30:
                    improved_answer = line
        
        # Fallback values
        if not correct_points:
            if user_said_dont_know:
                correct_points = ["It's okay to not know something - that's how we learn!"]
            else:
                correct_points = ["You showed understanding of the topic."]
                
        if not missing_points:
            if user_said_dont_know:
                missing_points = ["Try reading the document section again and give it your best guess."]
            else:
                missing_points = ["Try to include more details from the document."]
                
        if not improved_answer and not user_said_dont_know:
            improved_answer = f"Here's what the document says: {context[:150]}..."
        elif user_said_dont_know:
            improved_answer = "Try reading the relevant section again and attempt an answer!"
        
        return {
            "score": max(1, min(10, score)),
            "correct_points": correct_points[:2],  # Limit to 2 points
            "missing_points": missing_points[:2],   # Limit to 2 points
            "improved_answer": improved_answer[:300] if improved_answer else ""  # Empty if don't know
        }
        
    except Exception as e:
        # Fallback evaluation
        return {
            "score": 1 if user_said_dont_know else 5,
            "correct_points": ["Answer received"],
            "missing_points": ["Could not evaluate properly"],
            "improved_answer": f"Based on the document: {context[:200]}..." if not user_said_dont_know else ""
        }

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