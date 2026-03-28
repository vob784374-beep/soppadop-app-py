import time
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()

_attempts = {}

MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 300


class LoginAttemptService:
    @classmethod
    def is_locked(cls, email):
        entry = _attempts.get(email)
        if not entry:
            return False, 0

        if entry["count"] < MAX_ATTEMPTS:
            return False, 0

        elapsed = time.time() - entry["first_attempt"]
        if elapsed >= LOCKOUT_SECONDS:
            del _attempts[email]
            return False, 0

        remaining = int(LOCKOUT_SECONDS - elapsed)
        daily_logger.warning(
            f"LoginAttemptService.is_locked | locked | email={email} | remaining={remaining}s"
        )
        return True, remaining

    @classmethod
    def record_failure(cls, email):
        now = time.time()
        entry = _attempts.get(email)

        if not entry or (now - entry["first_attempt"]) >= LOCKOUT_SECONDS:
            _attempts[email] = {"count": 1, "first_attempt": now}
            daily_logger.debug(
                f"LoginAttemptService.record_failure | first attempt | email={email}"
            )
        else:
            entry["count"] += 1
            daily_logger.debug(
                f"LoginAttemptService.record_failure | attempt #{entry['count']} | email={email}"
            )
            if entry["count"] >= MAX_ATTEMPTS:
                daily_logger.warning(
                    f"LoginAttemptService.record_failure | account locked | email={email} | attempts={entry['count']}"
                )

    @classmethod
    def clear(cls, email):
        if email in _attempts:
            del _attempts[email]
            daily_logger.debug(f"LoginAttemptService.clear | cleared | email={email}")
