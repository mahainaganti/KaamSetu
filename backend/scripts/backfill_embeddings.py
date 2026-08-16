"""One-off backfill: populate worker_profiles.embedding for existing
rows whose embedding is still NULL (course-project seed data predates
the pgvector column). Run with: python scripts/backfill_embeddings.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db_pool import transaction
from services.embedding_service import embed, to_pgvector_literal


def main():
    with transaction() as cur:
        cur.execute(
            "SELECT profile_id, raw_description FROM worker_profiles WHERE embedding IS NULL AND raw_description IS NOT NULL"
        )
        rows = cur.fetchall()
        print(f"Backfilling {len(rows)} worker profiles...")
        for row in rows:
            vec = to_pgvector_literal(embed(row["raw_description"]))
            cur.execute(
                "UPDATE worker_profiles SET embedding = %s::vector WHERE profile_id = %s",
                (vec, row["profile_id"]),
            )
    print("Done.")


if __name__ == "__main__":
    main()
