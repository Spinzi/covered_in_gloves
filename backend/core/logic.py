from backend.core.storage import check_date_format

# ============================================================
# validation.py
# ============================================================
#
# Core validation layer for the system.
#
# Responsibilities:
# - Validate question definitions (structure + type safety)
# - Validate question answers against their definitions
# - Validate full day objects (date, metadata, answers)
#
# Design principles:
# - Strict validation (fail fast, return False on invalid data)
# - No mutation of input data
# - No storage or persistence logic
# - No authentication or session awareness
#
# Assumptions:
# - Question definitions are trusted if they pass validate_question_def
# - Question IDs are unique and consistent across the system
# - Answer validation depends on external question registry (questions dict)
#
# Extension strategy:
# - New question types must be added to SUPPORTED_TYPES
# - New answer block types must be added to SUPPORTED_ANSWER_TEXT_TYPES
# - Future validation logic should be type-driven per question type
#
# Notes:
# - This module is intentionally independent of Query/Auth layers
# - It is safe to reuse in both API and internal logic
#
# ============================================================

SUPPORTED_TYPES = {
    "basic"
}

SUPPORTED_ANSWER_TEXT_TYPES = {
    "p", "h"
}

def is_supported_type(qtype):
    return qtype in SUPPORTED_TYPES

def validate_question_def(q: dict) -> bool:
    if not isinstance(q, dict):
        return False
    
    if not isinstance(q["id"], str):
        return False
    
    if not isinstance(q["name"], str):
        return False
    
    if not isinstance(q["text"], str):
        return False
    
    if not isinstance(q["type"], str):
        return False
    if not is_supported_type(q["type"]):
        return False
    
    if not isinstance(q["meta"], dict):
        return False
    
    if q["type"] == "basic":
        return True
    raise TypeError("Wrong type of question that isnt adressed in verify question def.")
    #later check for other types of questions

def validate_question_ans(q: dict, a: dict) -> bool:
    if not isinstance(q, dict):
        return False
    if not isinstance(a, dict):
        return False
    
    if not isinstance(a["id"], str):
        return False
    if not a["id"] == q["id"]:
        return False
    
    if not isinstance(a["name"], str):
        return False
    if not a["name"] == q["name"]:
        return False
    
    if not isinstance(a["type"], str):
        return False
    if not a["type"] == q["type"]:
        return False
    
    if not isinstance(a["answer"], dict):
        return False
    
    if a["answer"]["value"] == None:
        return False
    
    if not isinstance(a["answer"]["text"], list):
        return False

    for e in a["answer"]["text"]:
        if not e["type"] in SUPPORTED_ANSWER_TEXT_TYPES:
            return False
    
    if not isinstance(a["answer"]["meta"], dict):
        return False
    
    if q["type"] == "basic":
        return True

    raise TypeError("Wrong type of question that isnt adressed in verify question def.")
    #later check for other types of questions

def validate_day(d: dict, questions: dict) -> bool:
    """
    Validates the day, requiring the questions image(cuz we have no way of getting them inside this, as logic.py being a lower section of the core).
    \nquestions dict should be like\n
    q_id: q(full question standard as defined inside schemas.py)
    """
    if not isinstance(d, dict):
        return False

    if not isinstance(d["date"], str):
        return False
    if not check_date_format(d["date"]):
        return False
    
    if not isinstance(d["data"], dict):
        return False
    if not isinstance(d["data"]["questions"], dict):
        return False
    
    for answer in d["data"]["questions"].values():
        if not isinstance(answer["id"], str):
            return False
        if not validate_question_ans(questions[answer["id"]], answer):
            return False

    if not isinstance(d["meta"], dict):
        return False
    
    if not isinstance(d["meta"]["created_at"], str):
        return False
    
    if not isinstance(d["meta"]["updated_at"], str):
        return False
    
    if not isinstance(d["meta"]["version"], int):
        return False

    return True