"""
Tutor Model Module
Handles tutor-related GPT interactions via Groq API
"""

import os
import re
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client for Groq
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def generate_tutor_question(chunk_text: str) -> str:
    """Generate a short tutor question from document content"""
    prompt = f"""Based on this document section, create a SHORT question that can be answered in 1-2 sentences. Make it simple and specific.

Document excerpt:
{chunk_text}

Create a brief, focused question that asks for a specific fact or concept. The answer should only need 1-2 sentences:"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful tutor creating questions from document content."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )
        question = response.choices[0].message.content.strip()
        return question if question else "What are the main concepts discussed in this document section?"
    except Exception as e:
        print(f"Question generation error: {e}")
        return "What are the main concepts discussed in this document section?"

async def evaluate_tutor_answer(question: str, user_answer: str, context: str) -> dict:
    """Evaluate a student's answer and return structured feedback"""
    
    # Check if user said "I don't know" or similar
    dont_know_phrases = ["i don't know", "don't know", "no idea", "not sure", "idk", "dunno"]
    user_said_dont_know = any(phrase in user_answer.lower() for phrase in dont_know_phrases)
    
    if user_said_dont_know:
        return {
            "score": 1,
            "correct_points": ["It's okay to not know something - that's how we learn!"],
            "missing_points": ["Try reading the document section again and give it your best guess."],
            "improved_answer": "Take a moment to review the relevant section in the document, then try answering in your own words!"
        }
    
    prompt = f"""You are a friendly tutor evaluating a student's answer. Provide structured feedback.

Question: {question}
Student's Answer: {user_answer}
Reference Material: {context}

Provide your evaluation in this EXACT format:

SCORE: [number from 1-10]

CORRECT POINTS:
- [what the student got right]
- [another correct point if applicable]

MISSING POINTS:
- [what could be improved]
- [what was missing]

IMPROVED ANSWER:
[A complete, well-explained answer that the student can learn from. Include all key points from the reference material. Make it comprehensive and educational.]

Be encouraging and constructive in your feedback."""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a friendly tutor providing structured feedback to students."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        evaluation_text = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Evaluation error: {e}")
        return {
            "score": 5,
            "correct_points": ["Answer received"],
            "missing_points": ["Unable to evaluate at this time"],
            "improved_answer": f"Based on the document: {context[:500]}"
        }
    
    # Parse the structured response
    try:
        score = 5
        correct_points = []
        missing_points = []
        improved_answer = ""
        
        # Extract score
        score_match = re.search(r'SCORE:\s*(\d+)', evaluation_text, re.IGNORECASE)
        if score_match:
            score = int(score_match.group(1))
        
        # Extract correct points
        correct_section = re.search(r'CORRECT POINTS:(.*?)(?=MISSING POINTS:|$)', evaluation_text, re.DOTALL | re.IGNORECASE)
        if correct_section:
            points = re.findall(r'-\s*(.+)', correct_section.group(1))
            correct_points = [p.strip() for p in points if p.strip()]
        
        # Extract missing points
        missing_section = re.search(r'MISSING POINTS:(.*?)(?=IMPROVED ANSWER:|$)', evaluation_text, re.DOTALL | re.IGNORECASE)
        if missing_section:
            points = re.findall(r'-\s*(.+)', missing_section.group(1))
            missing_points = [p.strip() for p in points if p.strip()]
        
        # Extract improved answer
        improved_section = re.search(r'IMPROVED ANSWER:(.*?)$', evaluation_text, re.DOTALL | re.IGNORECASE)
        if improved_section:
            improved_answer = improved_section.group(1).strip()
        
        # Fallback values
        if not correct_points:
            correct_points = ["You showed understanding of the topic."]
        if not missing_points:
            missing_points = ["Try to include more specific details from the document."]
        if not improved_answer:
            improved_answer = f"Here's what the document says: {context[:500]}"
        
        return {
            "score": max(1, min(10, score)),
            "correct_points": correct_points[:3],
            "missing_points": missing_points[:3],
            "improved_answer": improved_answer
        }
        
    except Exception as e:
        print(f"Parsing error: {e}")
        return {
            "score": 5,
            "correct_points": ["Answer received"],
            "missing_points": ["Could not parse evaluation properly"],
            "improved_answer": f"Based on the document: {context[:500]}"
        }

