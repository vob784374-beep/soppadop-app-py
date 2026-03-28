from typing import Any
import re


class BaseSchema:
    @classmethod
    def validate(cls, data: dict[str, Any]) -> tuple[bool, list[str]]:
        errors = []
        for field, rules in cls.fields.items():
            value = data.get(field)
            if rules.get("required", False) and not value:
                errors.append(f"{field} is required")
            if value and "choices" in rules and value not in rules["choices"]:
                errors.append(f"{field} must be one of {rules['choices']}")
            if value and "type" in rules and not isinstance(value, rules["type"]):
                errors.append(f"{field} must be of type {rules['type'].__name__}")
            if (
                value
                and "min_length" in rules
                and isinstance(value, str)
                and len(value) < rules["min_length"]
            ):
                errors.append(
                    f"{field} must be at least {rules['min_length']} characters"
                )
            if (
                value
                and "max_length" in rules
                and isinstance(value, str)
                and len(value) > rules["max_length"]
            ):
                errors.append(
                    f"{field} must be at most {rules['max_length']} characters"
                )
            if (
                value
                and "pattern" in rules
                and isinstance(value, str)
                and not re.match(rules["pattern"], value)
            ):
                errors.append(f"{field} has invalid format")
        return len(errors) == 0, errors


class RegisterSchema(BaseSchema):
    fields = {
        "email": {
            "required": True,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
        "username": {
            "required": True,
            "type": str,
            "min_length": 3,
            "max_length": 100,
            "pattern": r"^[a-zA-Z0-9_-]+$",
        },
        "password": {"required": True, "type": str, "min_length": 8},
    }


class LoginSchema(BaseSchema):
    fields = {
        "email": {"required": True, "type": str},
        "password": {"required": True, "type": str},
    }


class UserUpdateSchema(BaseSchema):
    fields = {
        "email": {
            "required": False,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
        "username": {
            "required": False,
            "type": str,
            "min_length": 3,
            "max_length": 100,
            "pattern": r"^[a-zA-Z0-9_-]+$",
        },
        "role_id": {"required": False, "type": int},
        "is_active": {"required": False, "type": bool},
    }


class ForgotPasswordSchema(BaseSchema):
    fields = {
        "email": {
            "required": True,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
    }


class ResetPasswordSchema(BaseSchema):
    fields = {
        "email": {
            "required": True,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
        "verification_code": {"required": True, "type": str, "min_length": 1},
        "new_password": {"required": True, "type": str, "min_length": 8},
    }


class UpdateEmailSchema(BaseSchema):
    fields = {
        "email": {
            "required": True,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
        "password": {"required": True, "type": str},
        "verification_code": {"required": True, "type": str, "min_length": 1},
    }


class UpdateUsernameSchema(BaseSchema):
    fields = {
        "username": {
            "required": True,
            "type": str,
            "min_length": 3,
            "max_length": 100,
            "pattern": r"^[a-zA-Z0-9_-]+$",
        },
        "password": {"required": True, "type": str},
        "verification_code": {"required": True, "type": str, "min_length": 1},
    }


class SendVerificationSchema(BaseSchema):
    fields = {
        "email": {
            "required": True,
            "type": str,
            "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        },
        "purpose": {
            "required": True,
            "type": str,
            "choices": ["reset_password", "update_email", "update_username"],
        },
    }
