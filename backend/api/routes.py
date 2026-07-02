from backend.core.query import Query
from backend.core.auth import AuthManager
from backend.core.logic import validate_day, validate_question_ans, validate_question_def
from datetime import datetime, timezone
from backend.core.storage import check_date_format
#
# STANDARD RESPONSE FORMAT (WebSocket)
#
# Every response MUST follow this structure:
#
# {
#     "status": "ok" | "error",
#     "action": "<string>",          # optional: what was executed
#     "data": {},                    # main payload (only on success)
#     "error": {                    # only on error
#         "code": "<string>",
#         "message": "<string>"
#     },
#     "meta": {                     # optional debugging / info
#         "timestamp": "<iso8601>",
#         "version": 1
#     }
# }
#
# RULES:
# - NEVER return raw data directly
# - ALWAYS wrap inside this structure
# - "data" must always exist on success (even if empty {})
# - "error" must always exist on failure
# - "status" is the ONLY required decision field for frontend
#

def get_meta():
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": 1
    }

ERRORS = {
    "MISSING_PASSWORD": {
        "http": 400,
        "message": "Missing password."
    },
    "WRONG_PASSWORD": {
        "http": 401,
        "message": "Incorrect password."
    },
    "UNAUTHORIZED_TOKEN": {
        "http": 401,
        "message": "Unauthorized token."
    },
    "BAD_REQUEST_DAY_NON_EXISTENT_OR_WRONG_TYPE": {
        "http": 400,
        "message": "Day is missing or invalid type."
    },
    "BAD_REQUEST_WRONG_DATE_FORMAT": {
        "http": 400,
        "message": "Wrong date format."
    },
    "BAD_REQUEST_WRONG_DAY_FORMAT": {
        "http": 400,
        "message": "Wrong day format."
    },
    "RESOURCE_NOT_FOUND_OR_UNKNOWN_ERROR": {
        "http": 404,
        "message": "Resource not found."
    },
    "BAD_REQUEST_WRONG_DAY_DEFINITION": {
        "http": 400,
        "message": "Invalid day definition."
    },
    "BAD_REQUEST_WRONG_QUESTION_DEFINITION": {
        "http": 400,
        "message": "Invalid question definition."
    },
    "BAD_REQUEST_WRONG_ANSWER_DEFINITION": {
        "http": 400,
        "message": "Invalid answer definition."
    },
    "BAD_REQUEST_WRONG_QUESTION_ID":{
        "http": 400,
        "message": "Invalid question id."
    },
    "BAD_REQUEST_MISSING_TOKEN": {
        "http": 400,
        "message": "Missing token."
    }
}

def call_err(code, action="unknown"):
    err = ERRORS.get(code)

    if err is None:
        err = {
            "http": 500,
            "message": "Unknown error."
        }

    return {
        "status": "error",
        "action": action,
        "error": {
            "code": code,
            "http": err["http"],
            "message": err["message"]
        },
        "meta": get_meta()
    }

class Routes:
    def __init__(self):
        self.auth = AuthManager()
        self.query = None
        print("Starting routes")
    
    def test(self, data):
        return {
            "status":"ok",
            "action":"system:test",
            "data":{
                "received_message": data,
                "reply_message":"Yo, this shit is working, shit good :like_emoji:",
            },
            "meta":get_meta()
        }
    
    def token_check(self, data, action="auth:check"):
        token = data.get("token")

        if not isinstance(token, str):
            return call_err("BAD_REQUEST_MISSING_TOKEN", action=action)

        if not self.auth.check_token(token):
            return call_err("UNAUTHORIZED_TOKEN", action=action)

        return {
            "status": "ok",
            "action": action,
            "data": {
                "message": "Token is valid."
            },
            "meta": get_meta()
        }
    
    def login(self, data):
        if not isinstance(data["password"], str):
            return call_err("MISSING_PASSWORD", action="auth:login")
        result = self.auth.login(data["password"])

        if isinstance(result, dict): 

            if self.query == None:
                self.query = Query(result["key"])
                print("Initialized the query with the key.")
            else:
                print("Query already initialized, skipping initialization.")

            return {
                "status":"ok",
                "action":"auth:login",
                "data":{
                    "token": result["token"],
                },
                "meta":get_meta()
            }
        else:
            print("Result of login was not a dict or failed login.")
            print("Result is:",result)
            return call_err("WRONG_PASSWORD", action="auth:login")
    
    def logout(self, data):

        err = self.token_check(data, "auth:logout")
        if err["status"] != "ok":
            return err

        self.auth.logout(data["token"])

        return {
            "status": "ok",
            "action": "auth:logout",
            "data": {
                "message": "Logged out successfully."
            },
            "meta": get_meta()
        }

    def get_day(self, data):
        err = self.token_check(data, "day:get")
        if err["status"] != "ok":
            return err
        
        if not isinstance(data["date"], str):
            return call_err("BAD_REQUEST_DAY_NON_EXISTENT_OR_WRONG_TYPE", action="day:get")

        if not check_date_format(data["date"]):
            return call_err("BAD_REQUEST_WRONG_DATE_FORMAT", action="day:get")
        
        d = self.query.load_day(data["date"])
        
        if d != None:
            return {
                "status":"ok",
                "action":"day:get",
                "data":{
                    "day":d
                },
                "meta":get_meta()
            }
        else:
            return call_err("RESOURCE_NOT_FOUND_OR_UNKNOWN_ERROR", action="day:get")
        
    def set_day(self, data):
        err = self.token_check(data, "day:set")
        if err["status"] != "ok":
            return err
        
        if not isinstance(data["day"], dict):
            return call_err("BAD_REQUEST_WRONG_DAY_FORMAT", action="day:set")

        q = self.query.get_questions()

        if validate_day(data["day"], q) == False:
            return call_err("BAD_REQUEST_WRONG_DAY_FORMAT", action="day:set")
        
        self.query.save_day(data["day"]["date"], data["day"])

        return {
            "status":"ok",
            "action":"day:set",
            "data":{
                "message":f"Saved day {data['day']['date']} succesfully.",
            },
            "meta": get_meta()
        }

    def add_question(self, data):
        err = self.token_check(data, "question:add")
        if err["status"] != "ok":
            return err
        
        if not isinstance(data.get("question"), dict):
            return call_err(
                "BAD_REQUEST_WRONG_QUESTION_DEFINITION",
                action="question:add"
            )

        qid = self.query.get_next_question_index()

        data["question"]["id"] = qid

        if not validate_question_def(data["question"]):
            return call_err(
                "BAD_REQUEST_WRONG_QUESTION_DEFINITION",
                action="question:add"
            )

        self.query.set_question(qid, data["question"])

        return {
            "status": "ok",
            "action": "question:add",

            "data": {
                "qid": qid,
                "question": data["question"]
            },
            "meta": get_meta()
        }


    def remove_question(self, data):
        err = self.token_check(data, "question:remove")
        if err["status"] != "ok":
            return err
        
        if not isinstance(data.get("qid"), str):
            return call_err(
                "BAD_REQUEST_WRONG_QUESTION_ID",
                action="remove_question"
            )

        if self.query.get_question(data["qid"]) is None:
            return call_err(
                "RESOURCE_NOT_FOUND_OR_UNKNOWN_ERROR",
                action="remove_question"
            )

        self.query.remove_question(data["qid"])

        return {
            "status": "ok",
            "action": "question:remove",

            "data": {
                "qid": data["qid"]
            },
            "meta": get_meta()

        }


    def get_questions(self, data):
        err = self.token_check(data, "question:get")
        if err["status"] != "ok":
            return err
        
        return {
            "status": "ok",
            "action": "question:get",

            "data": {
                "questions": self.query.get_questions()
            },
            "meta": get_meta()

        }
    
    def get_settings(self, data):
        err = self.token_check(data, "settings:get")
        if err["status"] != "ok":
            return err
        
        return {
            "status": "ok",
            "action": "settings:get",

            "data": {
                "questions": self.query.get_settings()
            },
            "meta": get_meta()

        }
    
    def get_day_indexes(self, data):

        err = self.token_check(data, "day:get_indexes")
        if err["status"] != "ok":
            return err
        
        return {
            "status": "ok",
            "action": "day:get_indexes",

            "data": {
                self.query.get_day_indexes()
            },
            "meta": get_meta()

        }
