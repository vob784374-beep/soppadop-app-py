import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()

PURPOSE_LABELS = {
    "reset_password": "Reset Password",
    "update_email": "Change Email",
    "update_username": "Change Username",
}

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates", "email")


def _load_template(name, **kwargs):
    path = os.path.join(TEMPLATES_DIR, name)
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    for key, value in kwargs.items():
        html = html.replace("{" + key + "}", str(value))
    return html


class EmailService:
    @classmethod
    def _get_config(cls):
        return {
            "host": current_app.config.get("SMTP_HOST", ""),
            "port": current_app.config.get("SMTP_PORT", 587),
            "user": current_app.config.get("SMTP_USER", ""),
            "password": current_app.config.get("SMTP_PASSWORD", ""),
            "from": current_app.config.get("SMTP_FROM", ""),
            "use_tls": current_app.config.get("SMTP_USE_TLS", True),
        }

    @classmethod
    def send_verification_code(cls, to_email, code, purpose):
        cfg = cls._get_config()

        if not cfg["user"] or not cfg["password"]:
            daily_logger.warning(
                f"EmailService | SMTP not configured | skipping email to={to_email}"
            )
            return False

        purpose_label = PURPOSE_LABELS.get(purpose, purpose)
        subject = f"[Soppadop] Verification Code - {purpose_label}"

        try:
            html = _load_template(
                "verification.html", code=code, purpose_label=purpose_label
            )

            msg = MIMEMultipart("alternative")
            msg["From"] = cfg["from"]
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html, "html", "utf-8"))

            with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
                if cfg["use_tls"]:
                    server.starttls()
                server.login(cfg["user"], cfg["password"])
                server.sendmail(cfg["from"], to_email, msg.as_string())

            daily_logger.info(
                f"EmailService | email sent | to={to_email} | purpose={purpose}"
            )
            return True
        except Exception as e:
            daily_logger.error(
                f"EmailService | send failed | to={to_email} | exception={type(e).__name__}: {e}"
            )
            return False
