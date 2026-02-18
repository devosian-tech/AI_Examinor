"""
Embeddings Module
Handles text embeddings generation using sentence-transformers
"""

from typing import List
from sentence_transformers import SentenceTransformer

# Initialize the embedding model (lightweight and fast)
# This model will be downloaded on first use (~80MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings using sentence-transformers
    
    Uses the 'all-MiniLM-L6-v2' model which:
    - Creates 384-dimensional embeddings
    - Is fast and lightweight (~80MB)
    - Provides good semantic similarity
    - Works offline after first download
    """
    try:
        # Generate embeddings using sentence-transformers
        embeddings = model.encode(texts, convert_to_numpy=True)
        # Convert numpy arrays to lists for ChromaDB
        return embeddings.tolist()
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        # Fallback: return zero vectors if model fails
        return [[0.0 for _ in range(384)] for _ in texts]

