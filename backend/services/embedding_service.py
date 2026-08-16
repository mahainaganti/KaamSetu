import hashlib
import math

from config import Config

EMBEDDING_DIM = 384


def _fake_embed(text: str) -> list[float]:
    """Deterministic pseudo-embedding: hash the text into a seed, then
    generate a reproducible unit vector from it. Same text always maps
    to the same vector, and lexically similar text does NOT map to
    similar vectors (unlike a real embedding model) — this exists to
    exercise the pgvector plumbing and ranking logic without an ML
    dependency, not to demonstrate real semantic matching quality.
    """
    seed = int(hashlib.sha256(text.strip().lower().encode()).hexdigest(), 16)
    vec = []
    x = seed
    for _ in range(EMBEDDING_DIM):
        x = (x * 6364136223846793005 + 1442695040888963407) % (2**64)
        vec.append((x / 2**64) * 2 - 1)
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def embed(text: str) -> list[float]:
    provider = Config.EMBEDDING_PROVIDER
    if provider == "fake":
        return _fake_embed(text)
    raise NotImplementedError(
        f"EMBEDDING_PROVIDER={provider!r} is not wired up. "
        "Only 'fake' is implemented; add a real provider (e.g. an "
        "embeddings API call) here before selecting it."
    )


def to_pgvector_literal(vec: list[float]) -> str:
    """Format a python vector as a pgvector input literal, e.g. '[0.1,0.2]'."""
    return "[" + ",".join(f"{v:.8f}" for v in vec) + "]"
