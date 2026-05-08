class Msg:
    class Auth:
        LOGIN_SUCCESS = "Login successful"
        LOGOUT_SUCCESS = "Logout successful"
        REGISTER_SUCCESS = "User registered successfully"
        INVALID_CREDENTIALS = "Invalid email or password"
        ACCOUNT_LOCKED = "Account locked. Try again in {minutes}m {seconds}s"
        ACCOUNT_LOCKED_ATTEMPT = (
            "Too many failed attempts. Account locked for {minutes}m {seconds}s"
        )
        ACCOUNT_UNLOCKED = "Account {email} unlocked successfully"
        TOKEN_REFRESHED = "Token refreshed"
        TOKEN_REVOKED_USER = "Tokens revoked for user {user_id}"
        TOKEN_REVOKED_ALL_LOWER = "Tokens revoked for {count} users with lower roles"

    class User:
        NOT_FOUND = "User not found"
        EMAIL_EXISTS = "Email already exists"
        USERNAME_EXISTS = "Username already exists"
        EMAIL_UPDATED = "Email updated successfully"
        USERNAME_UPDATED = "Username updated successfully"
        USER_UPDATED = "User updated successfully"
        USER_DELETED = "User deleted successfully"
        INCORRECT_PASSWORD = "Incorrect password"

    class Password:
        RESET_SUCCESS = "Password reset successfully"
        RESET_CODE_SENT = "Verification code sent to your email"
        RESET_CODE_SENT_DEV = (
            "Verification code sent to your email (dev: code also in response)"
        )
        SMTP_NOT_CONFIGURED = "Verification code generated (SMTP not configured)"

    class Verification:
        CODE_REQUIRED = "verification_code is required"
        CODE_EXPIRED = "Verification code has expired"
        CODE_INVALID = "Invalid verification code"
        CODE_NOT_SENT = "No verification code sent for this email and purpose"
        PENDING_NOT_FOUND = "No pending {field} change request"
        EXPIRES_IN = "10 minutes"

    class Request:
        NO_DATA = "No data provided"
        INVALID_PURPOSE = "Invalid verification purpose"
        EMAIL_REQUIRED = "Email is required"
        FIELD_PASSWORD_REQUIRED = "{field} and password are required"
        FIELDS_REQUIRED = "{fields} are required"
        PASSWORD_MIN_LENGTH = "new_password must be at least 8 characters"

    class Role:
        NOT_FOUND = "Role not found"
        NAME_REQUIRED = "Role name is required"
        CREATED = "Role created"
        UPDATED = "Role updated"
        DELETED = "Role deleted"
        PERMISSION_IDS_REQUIRED = "permission_ids is required"
        PERMISSION_IDS_TYPE = "permission_ids must be a list of integers"

    class Permission:
        INSUFFICIENT = "Insufficient permissions"
        ADMIN_REQUIRED = "Admin access required"
        OWNER_REQUIRED = "Owner access required"
        FORBIDDEN = "Unauthorized"

    class General:
        INTERNAL_ERROR = "Internal server error"
        INVALID_TOKEN = "Invalid token"
        TOKEN_EXPIRED = "Token has been revoked"
        TOKEN_REVOKED = "Token has been revoked"
        AUTH_REQUIRED = "Authorization required"
        FRESH_TOKEN_REQUIRED = "Fresh token required"

    class Resource:
        NOT_FOUND = "Resource not found"
        UPLOAD_SUCCESS = "Resource uploaded successfully"
        DELETE_SUCCESS = "Resource deleted successfully"
        FILE_TYPE_NOT_ALLOWED = "File type not allowed"
        FILE_TOO_LARGE = "File size exceeds the maximum allowed"
        NO_FILE = "No file provided"

    class PageSection:
        NOT_FOUND = "Section not found"
        CREATED = "Section created"
        UPDATED = "Section updated"
        DELETED = "Section deleted"
        CONTENT_NOT_FOUND = "Content not found"
