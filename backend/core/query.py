import os
from backend.core.crypto import test_key
from backend.core.storage import load_day, save_day, load_settings, save_settings, check_date_format
from backend.models.schemas import create_settings_file, create_default_question_def
from datetime import datetime, timezone
# query.py
#
# Core runtime state manager for the application.
# Acts as the authenticated in-memory context after login.
#
# Responsibilities:
# - Initialize system using derived encryption key
# - Validate password once at startup (via crypto/test layer)
# - Load and cache decrypted settings into memory
# - Maintain in-memory state for:
#     - settings
#     - questions definitions
#     - day data (optional cache)
# - Provide fast access and mutation methods for data
# - Persist changes back to storage when explicitly requested
#
# Security model:
# - Query is initialized ONLY after successful authentication
# - Assumes all callers (routes) are already authorized
# - Does NOT perform authentication checks per request
#
# Access control:
# - Only route layer should call Query methods
# - Query must never be exposed to unauthenticated contexts
#
# Characteristics:
# - In-memory (heap) cache of decrypted data
# - Single-session trusted runtime object
# - Reduces repeated encryption/decryption operations
#
# Does NOT:
# - Handle login / authentication logic
# - Validate request tokens
# - Enforce user permissions
# - Implement storage or crypto operations directly (uses storage.py / crypto.py)
#
# Philosophy:
# - “Authenticated state kernel”
# - Fast, trusted, persistent runtime context

DATA_DIR = "data"

def list_day_names():
    return [
        f[:-4]
        for f in os.listdir(DATA_DIR)
        if f.endswith(".enc") and f != "settings.enc" and f != ".check.enc"
    ]

class Query:
    def __init__(self, key):
        
        if not test_key(key):
            raise ValueError("Invalid password / authentication failed when starting Query")

        self.key = key

        self.load_settings()

        self.days_cache = self.load_days()

        if self.get_next_question_index() == "1":
            self.set_question("1", create_default_question_def())
        self.save_settings()

    def save_settings(self):
        self.settings["questions"] = self.questions
        save_settings(self.settings, self.key)

    def load_settings(self):
        self.settings = load_settings(self.key)
        #auto init settings if not existent
        if not self.settings:
            self.settings = create_settings_file()
            self.questions = self.settings.get("questions", {})
            self.save_settings()
        else:
            self.questions = self.settings.get("questions", {})

    def get_next_question_index(self):
        if not self.questions:
            return str(1)
        
        return str(max(map(int, self.questions.keys())) + 1)

    def load_days(self):
        day_f = {}
        print("Loading days, list of day names:")
        print(list_day_names())
        for f in list_day_names():
            day = load_day(f, self.key)
            if day is None:
                raise ValueError("Day is None inside load_day")
            day_f[f] = day
        return day_f
    
    def get_question(self, qid):
        return self.questions.get(qid, None)

    def get_questions(self):
        """Returns a full dict following the structure q_id: q"""
        return dict(self.questions)

    def set_question(self, qid, question):
        self.questions[qid] = question
        self.save_settings()
    
    def remove_question(self, qid):
        if qid in self.questions:
            del self.questions[qid]
        self.save_settings()

        self._purge_question_from_days(qid)

    def _purge_question_from_days(self, qid):
        for date, day in self.days_cache.items():
            if qid in day["data"]["questions"]:
                del day["data"]["questions"][qid]
                day["meta"]["updated_at"] = datetime.now(timezone.utc).isoformat()
                self.save_day(date, day)

    def load_day(self, date):
        return self.days_cache.get(date, None)
    
    def save_day(self, date, data):
        if not check_date_format(date):
            raise ValueError("Day format invalid in save_day, Query")
        save_day(date, data, self.key)
        self.days_cache[date] = data
        
    def get_settings(self):
        return dict(self.settings)
    
    def get_day_indexes(self):
        return list_day_names()
    