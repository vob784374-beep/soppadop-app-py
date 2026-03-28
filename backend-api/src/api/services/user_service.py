from src.api.repositories.user_repository import UserRepository
from src.api.repositories.role_repository import RoleRepository
from src.api.models import User
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


class UserService:
    @staticmethod
    def register(email, username, password, role_name="client"):
        daily_logger.debug(
            f"UserService.register | checking email_exists | email={email}"
        )
        if UserRepository.email_exists(email):
            daily_logger.warning(
                f"UserService.register | email already exists | email={email}"
            )
            return None, "Email already exists"
        daily_logger.debug(f"UserService.register | email check passed | email={email}")

        daily_logger.debug(
            f"UserService.register | checking username_exists | username={username}"
        )
        if UserRepository.username_exists(username):
            daily_logger.warning(
                f"UserService.register | username already exists | username={username}"
            )
            return None, "Username already exists"
        daily_logger.debug(
            f"UserService.register | username check passed | username={username}"
        )

        if role_name == "super_admin":
            daily_logger.warning(
                f"UserService.register | rejected super_admin registration | email={email}"
            )
            return None, "Cannot register as super_admin"

        daily_logger.debug(
            f"UserService.register | looking up role | role_name={role_name}"
        )
        role = RoleRepository.get_by_name(role_name)
        if not role:
            daily_logger.error(
                f"UserService.register | role not found | role_name={role_name}"
            )
            return None, f"Role '{role_name}' not found"
        daily_logger.debug(
            f"UserService.register | role found | role_id={role.id} | role_name={role.name}"
        )

        daily_logger.debug(
            f"UserService.register | creating user | email={email} | username={username} | role_id={role.id}"
        )
        user = UserRepository.create(email, username, password, role.id)
        daily_logger.debug(f"UserService.register | user created | user_id={user.id}")
        return user, None

    @staticmethod
    def login(email_or_username, password):
        daily_logger.debug(f"UserService.login | querying | input={email_or_username}")
        user = UserRepository.get_by_email(email_or_username)

        if not user:
            user = UserRepository.get_by_username(email_or_username)

        if not user:
            daily_logger.warning(
                f"UserService.login | user not found | input={email_or_username}"
            )
            return None, "Invalid email or password"
        daily_logger.debug(
            f"UserService.login | user found | user_id={user.id} | is_active={user.is_active}"
        )

        daily_logger.debug(
            f"UserService.login | verifying password | user_id={user.id}"
        )
        if not user.check_password(password):
            daily_logger.warning(
                f"UserService.login | password mismatch | user_id={user.id}"
            )
            return None, "Invalid email or password"
        daily_logger.debug(f"UserService.login | password verified | user_id={user.id}")

        if not user.is_active:
            daily_logger.warning(
                f"UserService.login | account inactive | user_id={user.id} | email={email}"
            )
            return None, "Account is inactive"

        daily_logger.debug(
            f"UserService.login | login passed all checks | user_id={user.id}"
        )
        return user, None

    @staticmethod
    def get_by_id(user_id):
        daily_logger.debug(f"UserService.get_by_id | user_id={user_id}")
        user = UserRepository.get_by_id(user_id)
        if user:
            daily_logger.debug(
                f"UserService.get_by_id | found | user_id={user.id} | email={user.email}"
            )
        else:
            daily_logger.debug(f"UserService.get_by_id | not found | user_id={user_id}")
        return user

    @staticmethod
    def get_all(page=1, per_page=20):
        daily_logger.debug(f"UserService.get_all | page={page} | per_page={per_page}")
        return UserRepository.get_all(page, per_page)

    @staticmethod
    def update_user(user_id, **kwargs):
        daily_logger.debug(
            f"UserService.update_user | user_id={user_id} | fields={list(kwargs.keys())}"
        )

        user = UserRepository.get_by_id(user_id)
        if not user:
            daily_logger.warning(
                f"UserService.update_user | user not found | user_id={user_id}"
            )
            return None, "User not found"
        daily_logger.debug(
            f"UserService.update_user | user found | user_id={user.id} | is_owner={user.is_owner}"
        )

        if user.is_owner:
            daily_logger.debug(
                f"UserService.update_user | owner protection checks | user_id={user_id}"
            )
            if "role_id" in kwargs and kwargs["role_id"] != user.role_id:
                daily_logger.warning(
                    f"UserService.update_user | rejected: cannot change owner role | user_id={user_id}"
                )
                return None, "Cannot change owner's role"
            if "is_active" in kwargs and not kwargs["is_active"]:
                daily_logger.warning(
                    f"UserService.update_user | rejected: cannot deactivate owner | user_id={user_id}"
                )
                return None, "Cannot deactivate owner"
            if "email" in kwargs and kwargs["email"] != user.email:
                existing = User.query.filter_by(is_owner=True).first()
                if existing and existing.id == user.id:
                    daily_logger.warning(
                        f"UserService.update_user | rejected: cannot change owner email | user_id={user_id}"
                    )
                    return None, "Cannot change owner's email"

        if "email" in kwargs and kwargs["email"] != user.email:
            daily_logger.debug(
                f"UserService.update_user | checking email uniqueness | new_email={kwargs['email']}"
            )
            if UserRepository.email_exists(kwargs["email"]):
                daily_logger.warning(
                    f"UserService.update_user | email already exists | email={kwargs['email']}"
                )
                return None, "Email already exists"

        if "username" in kwargs and kwargs["username"] != user.username:
            daily_logger.debug(
                f"UserService.update_user | checking username uniqueness | new_username={kwargs['username']}"
            )
            if UserRepository.username_exists(kwargs["username"]):
                daily_logger.warning(
                    f"UserService.update_user | username already exists | username={kwargs['username']}"
                )
                return None, "Username already exists"

        if "role_id" in kwargs:
            daily_logger.debug(
                f"UserService.update_user | validating role | role_id={kwargs['role_id']}"
            )
            target_role = RoleRepository.get_by_id(kwargs["role_id"])
            if not target_role:
                daily_logger.error(
                    f"UserService.update_user | role not found | role_id={kwargs['role_id']}"
                )
                return None, "Role not found"
            if target_role.is_super_admin:
                daily_logger.warning(
                    f"UserService.update_user | rejected: cannot assign super_admin role"
                )
                return None, "Cannot assign super_admin role"
            user.role_id = kwargs["role_id"]
            del kwargs["role_id"]
            daily_logger.debug(
                f"UserService.update_user | role updated | new_role_id={user.role_id}"
            )

        for key, value in kwargs.items():
            if hasattr(user, key) and key not in ("id", "password_hash", "role_id"):
                setattr(user, key, value)
                daily_logger.debug(
                    f"UserService.update_user | field updated | {key}={value}"
                )

        result = UserRepository.update(user)
        daily_logger.debug(
            f"UserService.update_user | save completed | user_id={user_id}"
        )
        return result, None

    @staticmethod
    def delete_user(user_id):
        daily_logger.debug(f"UserService.delete_user | user_id={user_id}")
        user = UserRepository.get_by_id(user_id)
        if not user:
            daily_logger.warning(
                f"UserService.delete_user | user not found | user_id={user_id}"
            )
            return False, "User not found"

        if user.is_owner:
            daily_logger.warning(
                f"UserService.delete_user | rejected: cannot delete owner | user_id={user_id}"
            )
            return False, "Cannot delete owner account"

        if user.role and user.role.is_super_admin:
            daily_logger.warning(
                f"UserService.delete_user | rejected: cannot delete super_admin | user_id={user_id}"
            )
            return False, "Cannot delete super_admin account"

        daily_logger.debug(
            f"UserService.delete_user | deleting user | user_id={user_id} | email={user.email}"
        )
        UserRepository.delete(user)
        daily_logger.debug(
            f"UserService.delete_user | deleted successfully | user_id={user_id}"
        )
        return True, None

    @staticmethod
    def reset_password(email, new_password):
        daily_logger.debug(f"UserService.reset_password | email={email}")
        user = UserRepository.get_by_email(email)
        if not user:
            daily_logger.warning(
                f"UserService.reset_password | user not found | email={email}"
            )
            return None, "User not found"

        user.set_password(new_password)
        UserRepository.update(user)
        daily_logger.info(f"UserService.reset_password | success | user_id={user.id}")
        return user, None

    @staticmethod
    def update_email(user_id, new_email, password):
        daily_logger.debug(
            f"UserService.update_email | user_id={user_id} | new_email={new_email}"
        )
        user = UserRepository.get_by_id(user_id)
        if not user:
            daily_logger.warning(
                f"UserService.update_email | user not found | user_id={user_id}"
            )
            return None, "User not found"

        if not user.check_password(password):
            daily_logger.warning(
                f"UserService.update_email | wrong password | user_id={user_id}"
            )
            return None, "Incorrect password"

        if UserRepository.email_exists(new_email):
            daily_logger.warning(
                f"UserService.update_email | email exists | email={new_email}"
            )
            return None, "Email already exists"

        user.email = new_email
        UserRepository.update(user)
        daily_logger.info(
            f"UserService.update_email | success | user_id={user_id} | email={new_email}"
        )
        return user, None

    @staticmethod
    def update_username(user_id, new_username, password):
        daily_logger.debug(
            f"UserService.update_username | user_id={user_id} | new_username={new_username}"
        )
        user = UserRepository.get_by_id(user_id)
        if not user:
            daily_logger.warning(
                f"UserService.update_username | user not found | user_id={user_id}"
            )
            return None, "User not found"

        if not user.check_password(password):
            daily_logger.warning(
                f"UserService.update_username | wrong password | user_id={user_id}"
            )
            return None, "Incorrect password"

        if UserRepository.username_exists(new_username):
            daily_logger.warning(
                f"UserService.update_username | username exists | username={new_username}"
            )
            return None, "Username already exists"

        user.username = new_username
        UserRepository.update(user)
        daily_logger.info(
            f"UserService.update_username | success | user_id={user_id} | username={new_username}"
        )
        return user, None

    @staticmethod
    def email_exists(email, exclude_user_id=None):
        user = UserRepository.get_by_email(email)
        if user and user.id != exclude_user_id:
            return True
        return False

    @staticmethod
    def username_exists(username, exclude_user_id=None):
        user = UserRepository.get_by_username(username)
        if user and user.id != exclude_user_id:
            return True
        return False
