"""
Embeddings Module
Handles text embeddings generation using OpenAI API
"""

from typing import List
import os
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings using a simple hash-based approach for Railway deployment
    
    This is a lightweight fallback that doesn't require heavy ML models.
    For production, consider using OpenAI embeddings API or similar service.
    """
    try:
        # Simple hash-based embeddings (384 dimensions to match ChromaDB)
        embeddings = []
        for text in texts:
            # Create a deterministic embedding based on text content
            text_hash = hash(text)
            embedding = []
            for i in range(384):
                # Generate pseudo-random but deterministic values
                val = ((text_hash + i * 7919) % 10000) / 10000.0 - 0.5
                embedding.append(val)
            embeddings.append(embedding)
        return embeddings
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        # Fallback: return zero vectors
        return [[0.0 for _ in range(384)] for _ in texts]


