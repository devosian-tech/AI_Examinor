"""
Embeddings Module
Handles text embeddings generation using sentence-transformers
"""

from typing import List
from sentence_transformers import SentenceTransformer

# Initialize the embedding model (lightweight and fast)
model = SentenceTransformer('all-MiniLM-L6-v2')

async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings using sentence-transformers"""
    try:
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        return [[0.0 for _ in range(384)] for _ in texts]


