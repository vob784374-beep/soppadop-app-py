import secrets
import time
import hashlib
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()

_codes = {}
_pending = {}

PURPOSES = ("reset_password", "update_email", "update_username")


def _make_key(email, purpose):
    raw = f"{email}:{purpose}"
    return hashlib.sha256(raw.encode()).hexdigest()


class VerificationService:
    CODE_EXPIRES_SECONDS = 600

    @classmethod
    def send_code(cls, email, purpose, extra=None):
        if purpose not in PURPOSES:
            return None, "Invalid verification purpose"

        code = secrets.token_hex(3).upper()
        key = _make_key(email, purpose)
        _codes[key] = {
            "code": code,
            "email": email,
            "purpose": purpose,
            "extra": extra or {},
            "expires_at": time.time() + cls.CODE_EXPIRES_SECONDS,
        }

        from src.api.services.email_service import EmailService

        EmailService.send_verification_code(email, code, purpose)

        daily_logger.info(
            f"VerificationService.send_code | code generated | email={email} | purpose={purpose}"
        )
        return code, None

    @classmethod
    def verify_code(cls, email, purpose, code):
        key = _make_key(email, purpose)
        entry = _codes.get(key)

        if not entry:
            return False, "No verification code sent for this email and purpose", None

        if time.time() > entry["expires_at"]:
            del _codes[key]
            return False, "Verification code has expired", None

        if entry["code"] != code.upper().strip():
            return False, "Invalid verification code", None

        extra = entry.get("extra", {})
        del _codes[key]
        daily_logger.info(
            f"VerificationService.verify_code | verified | email={email} | purpose={purpose}"
        )
        return True, None, extra

    @classmethod
    def store_pending(cls, email, purpose, data):
        key = _make_key(email, purpose)
        _pending[key] = {
            "data": data,
            "expires_at": time.time() + cls.CODE_EXPIRES_SECONDS,
        }
        daily_logger.debug(
            f"VerificationService.store_pending | stored | key={key[:16]}... | purpose={purpose}"
        )

    @classmethod
    def get_pending(cls, email, purpose):
        key = _make_key(email, purpose)
        daily_logger.debug(
            f"VerificationService.get_pending | key={key[:16]}... | purpose={purpose} | pending_count={len(_pending)} | keys={[k[:16] + '...' for k in _pending.keys()]}"
        )
        entry = _pending.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del _pending[key]
            return None
        return entry["data"]

    @classmethod
    def clear_pending(cls, email, purpose):
        key = _make_key(email, purpose)
        _pending.pop(key, None)
