from datetime import datetime, timezone

# schemas.py
#
# Defines the base data structures (factories) used across the system.
#
# Responsibilities:
# - Create empty day objects (create_empty_day)
# - Create question definitions (create_empty_question_def)
# - Create question answers (create_empty_question_answer)
#
# Characteristics:
# - No validation logic
# - No storage logic
# - No type rules
# - Only default structure generation
#
# Philosophy:
# - “Pure structure, no behavior”

def create_empty_day(date: str):
    now = datetime.now(timezone.utc).isoformat()

    return {
        "date": date,

        "data": {
            "questions": {}
        },

        "meta": {
            "created_at": now,
            "updated_at": now,
            "version": 1
        }
    }

def create_empty_question_def():
    return {
        "id": "0",                  # incremental, stable
        "name": "",               # internal / short name
        "text": "",               # what user sees
        "type": "basic",          # basic / weight / journal / etc

        "meta": {}
    }

def create_default_question_def():
    return {
        "id": "1",
        "name": "good_day",
        "text": "Was today a good day?",
        "type": "basic",
        "meta": {}
    }

def create_empty_question_answer():
    return {
        "id": "0",                  # link to question_def
        "name": "",               # redundant but useful (debug/UI)
        "type": "",               # redundant but useful (frontend architecture)

        "answer": {
            "value": None,        # raw answer (bool/int/list/etc)
            "text": [],           # required -> children blocks
            "meta": {}
        }
    }

def create_settings_file():
    return {
        "questions":{}, #id -> question_def
        "meta": {
            "version": 1
        }
    }