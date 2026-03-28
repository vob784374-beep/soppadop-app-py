from marshmallow import Schema, fields


class PermissionSchema(Schema):
    id = fields.Int(dump_only=True, metadata={"description": "Permission ID"})
    name = fields.Str(
        required=True, metadata={"description": "Permission name (e.g. users.create)"}
    )
    resource = fields.Str(
        required=True, metadata={"description": "Resource name (e.g. users)"}
    )
    action = fields.Str(
        required=True, metadata={"description": "Action name (e.g. create)"}
    )
    description = fields.Str(metadata={"description": "Permission description"})


class RoleSchema(Schema):
    id = fields.Int(dump_only=True, metadata={"description": "Role ID"})
    name = fields.Str(required=True, metadata={"description": "Role name"})
    description = fields.Str(metadata={"description": "Role description"})
    is_system = fields.Bool(
        dump_only=True, metadata={"description": "System role (cannot be deleted)"}
    )
    is_super_admin = fields.Bool(
        dump_only=True, metadata={"description": "Super admin role (owner only)"}
    )
    permissions = fields.List(
        fields.Nested(PermissionSchema),
        dump_only=True,
        metadata={"description": "Assigned permissions"},
    )
    created_at = fields.DateTime(
        dump_only=True, metadata={"description": "Creation time"}
    )
    updated_at = fields.DateTime(
        dump_only=True, metadata={"description": "Last update time"}
    )


class RoleCreateSchema(Schema):
    name = fields.Str(
        required=True, metadata={"description": "Role name", "example": "editor"}
    )
    description = fields.Str(
        metadata={"description": "Role description", "example": "Can edit content"}
    )


class RoleUpdateSchema(Schema):
    name = fields.Str(metadata={"description": "New role name"})
    description = fields.Str(metadata={"description": "New description"})


class UserSchema(Schema):
    id = fields.Int(dump_only=True, metadata={"description": "User ID"})
    email = fields.Str(required=True, metadata={"description": "User email"})
    username = fields.Str(required=True, metadata={"description": "Username"})
    role = fields.Nested(
        RoleSchema,
        dump_only=True,
        metadata={"description": "User role with permissions"},
    )
    is_active = fields.Bool(metadata={"description": "Account active status"})
    is_owner = fields.Bool(
        dump_only=True, metadata={"description": "Owner account (super admin)"}
    )
    created_at = fields.DateTime(
        dump_only=True, metadata={"description": "Account creation time"}
    )
    updated_at = fields.DateTime(
        dump_only=True, metadata={"description": "Last update time"}
    )


class RegisterRequestSchema(Schema):
    email = fields.Str(
        required=True,
        metadata={"description": "User email", "example": "user@example.com"},
    )
    username = fields.Str(
        required=True, metadata={"description": "Username", "example": "johndoe"}
    )
    password = fields.Str(
        required=True, metadata={"description": "User password", "example": "secret123"}
    )
    role = fields.Str(
        load_default="client",
        metadata={
            "description": "Role name (admin, manager, client)",
            "example": "client",
        },
    )


class LoginRequestSchema(Schema):
    email = fields.Str(
        required=True,
        metadata={"description": "User email", "example": "user@example.com"},
    )
    password = fields.Str(
        required=True, metadata={"description": "User password", "example": "secret123"}
    )


class UserUpdateRequestSchema(Schema):
    email = fields.Str(metadata={"description": "New email"})
    username = fields.Str(metadata={"description": "New username"})
    role_id = fields.Int(metadata={"description": "New role ID"})
    is_active = fields.Bool(metadata={"description": "Active status"})


class TokenResponseSchema(Schema):
    access_token = fields.Str(metadata={"description": "JWT access token"})
    refresh_token = fields.Str(metadata={"description": "JWT refresh token"})


class LoginResponseSchema(Schema):
    message = fields.Str(metadata={"description": "Success message"})
    access_token = fields.Str(metadata={"description": "JWT access token"})
    refresh_token = fields.Str(metadata={"description": "JWT refresh token"})
    user = fields.Nested(UserSchema, metadata={"description": "User info with role"})


class RegisterResponseSchema(Schema):
    message = fields.Str(metadata={"description": "Success message"})
    user = fields.Nested(UserSchema, metadata={"description": "Created user info"})


class RefreshResponseSchema(Schema):
    access_token = fields.Str(metadata={"description": "New JWT access token"})


class MessageResponseSchema(Schema):
    message = fields.Str(metadata={"description": "Response message"})


class ErrorResponseSchema(Schema):
    error = fields.Str(metadata={"description": "Error message"})


class HealthResponseSchema(Schema):
    status = fields.Str(metadata={"description": "Service status"})
    service = fields.Str(metadata={"description": "Service name"})
