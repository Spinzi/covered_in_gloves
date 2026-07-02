import secrets
from backend.core.crypto import test_password
from datetime import datetime, timedelta, timezone

TOKEN_EXPIRATION_TIME_MINUTES = 30

class AuthManager:
    def __init__(self):
        self.sessions = {}
    
    def login(self, password: str) -> str:
        """
        Return false if not working, else returns a dict with the key and token.
        """
        result = test_password(password)
        if result == False:
            return False
        token = secrets.token_hex(32)

        expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_TIME_MINUTES)

        session = {
            "key": result,
            "expires_at": expires_at
        }
        self.sessions[token] = session
        return {
            "token": token,
            "key": result
        }

    def refresh_session(self, token):
        if token in self.sessions:
            self.sessions[token]["expires_at"] = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_TIME_MINUTES)

    def update_sessions(self):
        now = datetime.now(timezone.utc)

        expired_tokens = [
            token for token, session in self.sessions.items()
            if session["expires_at"] < now
        ]

        for token in expired_tokens:
            del self.sessions[token]

    def check_token(self, token: str):
        session = self.sessions.get(token)

        if not session:
            return None
        
        if session["expires_at"] < datetime.now(timezone.utc):
            del self.sessions[token]
            return None
        
        return True
    
    def get_session(self, token):
        session = self.sessions.get(token)

        if not session:
            return None

        if session["expires_at"] < datetime.now(timezone.utc):
            del self.sessions[token]
            raise ValueError("Expired")

        return session
    
    def logout(self, token):
        if token in self.sessions:
            del self.sessions[token]