from config import Config


class NoVirtualNumberAvailable(Exception):
    pass


def virtual_number_pool() -> list[str]:
    pool = Config.VIRTUAL_NUMBER_POOL
    if not pool:
        raise NoVirtualNumberAvailable("VIRTUAL_NUMBER_POOL is empty in config")
    return pool


def place_bridge_call(virtual_number: str, worker_phone: str):
    """Ring the worker from the virtual number, so the worker's caller ID
    shows the masked number rather than the customer's real one. Only
    used when TELEPHONY_PROVIDER=twilio; the fake provider never dials
    out, it only books the session (see call_service.py).
    """
    provider = Config.TELEPHONY_PROVIDER
    if provider == "fake":
        return {"status": "simulated", "virtual_number": virtual_number, "to": worker_phone}

    if provider == "twilio":
        if not Config.TWILIO_BRIDGE_TWIML_URL:
            raise RuntimeError(
                "TELEPHONY_PROVIDER=twilio but TWILIO_BRIDGE_TWIML_URL is not set. "
                "Twilio needs a publicly reachable URL to fetch bridge instructions "
                "from (e.g. an ngrok tunnel to /calls/twiml during dev, or your "
                "deployed URL) — set it in .env and in the Twilio console."
            )
        from twilio.rest import Client

        client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
        call = client.calls.create(
            to=worker_phone,
            from_=virtual_number,
            url=Config.TWILIO_BRIDGE_TWIML_URL,
        )
        return {"status": "queued", "call_sid": call.sid}

    raise NotImplementedError(f"TELEPHONY_PROVIDER={provider!r} is not wired up.")


def bridge_twiml(to_customer: bool, counterpart_phone: str) -> str:
    """TwiML instructing Twilio to dial the other party. Used by the
    /calls/twiml webhook — the URL that must be registered as
    TWILIO_BRIDGE_TWIML_URL and, if you want inbound dial-in on the
    virtual number, as that number's Voice webhook in the Twilio console.
    """
    from twilio.twiml.voice_response import Dial, VoiceResponse

    response = VoiceResponse()
    response.append(Dial(counterpart_phone))
    return str(response)
