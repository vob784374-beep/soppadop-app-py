from src.api.models import db, User, Role
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


class UserRepository:
    @staticmethod
    def create(email, username, password, role_id):
        daily_logger.debug(
            f"UserRepository.create | email={email} | username={username} | role_id={role_id}"
        )
        user = User(email=email, username=username, role_id=role_id)
        user.set_password(password)
        db.session.add(user)
        daily_logger.debug(
            f"UserRepository.create | session.add done | user object created"
        )
        db.session.commit()
        daily_logger.debug(f"UserRepository.create | commit done | user_id={user.id}")
        return user

    @staticmethod
    def get_by_id(user_id):
        daily_logger.debug(f"UserRepository.get_by_id | user_id={user_id}")
        user = db.session.get(User, user_id)
        daily_logger.debug(
            f"UserRepository.get_by_id | result={'found user_id=' + str(user.id) if user else 'None'}"
        )
        return user

    @staticmethod
    def get_by_email(email):
        daily_logger.debug(f"UserRepository.get_by_email | email={email}")
        user = User.query.filter_by(email=email).first()
        daily_logger.debug(
            f"UserRepository.get_by_email | result={'found user_id=' + str(user.id) if user else 'None'}"
        )
        return user

    @staticmethod
    def get_by_username(username):
        daily_logger.debug(f"UserRepository.get_by_username | username={username}")
        user = User.query.filter_by(username=username).first()
        daily_logger.debug(
            f"UserRepository.get_by_username | result={'found user_id=' + str(user.id) if user else 'None'}"
        )
        return user

    @staticmethod
    def get_all(page=1, per_page=20):
        daily_logger.debug(
            f"UserRepository.get_all | page={page} | per_page={per_page}"
        )
        result = User.query.paginate(page=page, per_page=per_page, error_out=False)
        daily_logger.debug(
            f"UserRepository.get_all | result | total={result.total} | items={len(result.items)} | pages={result.pages}"
        )
        return result

    @staticmethod
    def update(user):
        daily_logger.debug(f"UserRepository.update | user_id={user.id}")
        db.session.commit()
        daily_logger.debug(f"UserRepository.update | commit done | user_id={user.id}")
        return user

    @staticmethod
    def delete(user):
        daily_logger.debug(
            f"UserRepository.delete | user_id={user.id} | email={user.email}"
        )
        db.session.delete(user)
        daily_logger.debug(
            f"UserRepository.delete | session.delete done | user_id={user.id}"
        )
        db.session.commit()
        daily_logger.debug(f"UserRepository.delete | commit done | user_id={user.id}")

    @staticmethod
    def get_by_role(role_id):
        daily_logger.debug(f"UserRepository.get_by_role | role_id={role_id}")
        users = User.query.filter_by(role_id=role_id).all()
        daily_logger.debug(f"UserRepository.get_by_role | role_id={role_id} | found={len(users)}")
        return users

    @staticmethod
    def email_exists(email):
        daily_logger.debug(f"UserRepository.email_exists | email={email}")
        exists = User.query.filter_by(email=email).first() is not None
        daily_logger.debug(
            f"UserRepository.email_exists | result={exists} | email={email}"
        )
        return exists

    @staticmethod
    def username_exists(username):
        daily_logger.debug(f"UserRepository.username_exists | username={username}")
        exists = User.query.filter_by(username=username).first() is not None
        daily_logger.debug(
            f"UserRepository.username_exists | result={exists} | username={username}"
        )
        return exists
