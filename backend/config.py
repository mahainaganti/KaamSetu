import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    # Instant dispatch / matching / calling
    EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "fake")
    TELEPHONY_PROVIDER = os.getenv("TELEPHONY_PROVIDER", "fake")
    OTP_DEV_MODE = os.getenv("OTP_DEV_MODE", "1") == "1"
    ADMIN_PASSCODE = os.getenv("ADMIN_PASSCODE", "")
    VIRTUAL_NUMBER_POOL = [
        n.strip() for n in os.getenv("VIRTUAL_NUMBER_POOL", "").split(",") if n.strip()
    ]

    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_BRIDGE_TWIML_URL = os.getenv("TWILIO_BRIDGE_TWIML_URL", "")
