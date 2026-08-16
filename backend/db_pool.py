from contextlib import contextmanager

from psycopg2 import pool
from psycopg2.extras import RealDictCursor

from config import Config

_pool = pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    host=Config.DB_HOST,
    port=Config.DB_PORT,
    database=Config.DB_NAME,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
)


@contextmanager
def transaction():
    """Yields a RealDictCursor inside a single transaction.
    Commits on clean exit, rolls back and re-raises on exception.
    Used by the new dispatch/call/matching code, which needs real
    locking and atomicity that the legacy per-call connect/close
    routes in services/ don't provide.
    """
    conn = _pool.getconn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        _pool.putconn(conn)
