import os
import json
from datetime import datetime

from backend.core.crypto import encrypt_data, decrypt_data 

# storage.py
#
# Handles all persistent data storage for the system.
# Uses crypto.py for encryption/decryption.
#
# Responsibilities:
# - Save and load day data (save_day, load_day)
# - Save and load settings data (save_settings, load_settings)
# - Handle file paths for days and settings
# - Check if files exist (day_exists, settings_exists)
# - Validate day name format (string format only, not content logic)
#
# Does NOT:
# - Validate question structure
# - Validate answers or data content
# - Apply business rules
# - Modify or interpret stored data
#
# Philosophy:
# - Dumb storage layer
# - Only I/O + encryption handling
# - Everything else handled above this layer

DATA_DIR = "data"
SETTINGS_PATH = os.path.join(DATA_DIR, "settings.enc")

def check_date_format(date_text):
    try:
        # %Y = 4-digit year, %m = month, %d = day
        datetime.strptime(date_text, '%Y-%m-%d')
        return True
    except ValueError:
        # This will trigger if the format is wrong OR the date is logically impossible
        return False

def get_day_path(date: str):
    if not check_date_format(date):
        return None
    return os.path.join(DATA_DIR, f"{date}.enc")
    
def save_day(date: str, data: dict, key: bytes):
    path = get_day_path(date)
    if path is None:
        raise ValueError("Invalid date format")

    json_data = json.dumps(data)

    encrypted_data = encrypt_data(json_data, key)

    os.makedirs(DATA_DIR, exist_ok=True)

    with open(path, "wb") as f:
        f.write(encrypted_data)

def day_exists(date: str) -> bool:
    path = get_day_path(date)
    return path is not None and os.path.exists(path)

def load_day(date: str, key: bytes) -> dict:
    path = get_day_path(date)

    if path is None or not os.path.exists(path):
        return None

    with open(path, "rb") as f:
        encrypted_data = f.read()
    
    try:
        json_data = decrypt_data(encrypted_data, key)
        data = json.loads(json_data)
        return data
    except Exception as e:
        print("Decryption failed:", e)
        return None

def save_settings(data: dict, key: bytes):
    json_data = json.dumps(data)

    encrypted_data = encrypt_data(json_data, key)

    os.makedirs(DATA_DIR, exist_ok=True)

    with open(SETTINGS_PATH, "wb") as f:
        f.write(encrypted_data)

def load_settings(key: bytes) -> dict:
    if not os.path.exists(SETTINGS_PATH):
        return None

    with open(SETTINGS_PATH, "rb") as f:
        encrypted_data = f.read()

    try:
        json_data = decrypt_data(encrypted_data, key)
        data = json.loads(json_data)
        return data
    except Exception as e:
        print("Settings decryption failed:", e)
        return None