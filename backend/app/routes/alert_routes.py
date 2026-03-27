from fastapi import APIRouter
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

class SMSAlertRequest(BaseModel):
    to_phone: str          # e.g. "+919876543210"
    device_name: str
    current_watts: float
    threshold_watts: float
    monthly_cost: float

@router.post("/sms")
async def send_sms_alert(payload: SMSAlertRequest):
    """
    Sends an SMS alert via Twilio when standby consumption exceeds threshold.
    Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM in .env
    """
    try:
        from twilio.rest import Client

        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token  = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_FROM", "+15005550006")  # Twilio test number fallback

        if not account_sid or not auth_token:
            # Simulate success in demo/dev mode when Twilio not configured
            return {
                "status":  "simulated",
                "message": f"[DEMO] SMS would be sent to {payload.to_phone}: "
                           f"⚡ WattSense Alert! '{payload.device_name}' is drawing "
                           f"{payload.current_watts:.1f}W — above your {payload.threshold_watts}W limit. "
                           f"Monthly cost impact: ₹{payload.monthly_cost:.0f}. Turn it off now!"
            }

        client = Client(account_sid, auth_token)
        msg_body = (
            f"⚡ WattSense Energy Alert!\n"
            f"Device: {payload.device_name}\n"
            f"Current draw: {payload.current_watts:.1f}W "
            f"(limit: {payload.threshold_watts}W)\n"
            f"Monthly phantom cost: ₹{payload.monthly_cost:.0f}\n"
            f"👉 Please switch it off at the wall to save energy!"
        )

        message = client.messages.create(
            body=msg_body,
            from_=from_number,
            to=payload.to_phone
        )

        return {
            "status": "sent",
            "sid":    message.sid,
            "message": msg_body
        }

    except ImportError:
        # twilio package not installed — simulate gracefully
        return {
            "status":  "simulated",
            "message": (
                f"[DEMO — install twilio] SMS to {payload.to_phone}: "
                f"⚡ '{payload.device_name}' drawing {payload.current_watts:.1f}W "
                f"exceeds your {payload.threshold_watts}W limit! "
                f"Monthly cost: ₹{payload.monthly_cost:.0f}. Switch it off!"
            )
        }

    except Exception as e:
        return {"status": "error", "detail": str(e)}
