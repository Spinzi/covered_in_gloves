import os
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import base64

# crypto.py
#
# Handles all cryptographic operations for the system.
#
# Responsibilities:
# - Load and manage encryption salt (load_salt)
# - Derive encryption key from password (derive_key)
# - Encrypt data using Fernet (encrypt_data)
# - Decrypt data using Fernet (decrypt_data)
# - Initialize system integrity check file (init_check_file)
# - Validate password correctness via encrypted check file (test_password)
#
# Characteristics:
# - Stateless utility layer (no business logic)
# - Uses PBKDF2HMAC for key derivation
# - Uses Fernet symmetric encryption for data safety
# - Relies on persistent salt + check file for authentication
#
# Does NOT:
# - Manage application data (days, settings, questions)
# - Perform validation of user data structures
# - Handle file organization beyond crypto-related files
#
# Philosophy:
# - Pure cryptographic utility layer
# - Deterministic, reusable, and system-agnostic

DATA_DIR = "data"
SALT_FILE = os.path.join(DATA_DIR, ".salt")
CHECK_FILE = os.path.join(DATA_DIR, ".check.enc")


def load_salt() -> bytes:
    with open(SALT_FILE, "rb") as f:
        return f.read()


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=390000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))


def encrypt_data(data: str, key: bytes) -> bytes:
    f = Fernet(key)
    return f.encrypt(data.encode())


def decrypt_data(token: bytes, key: bytes) -> str:
    f = Fernet(key)
    return f.decrypt(token).decode()


def init_check_file(key: bytes):
    data = json.dumps({"status": "ok"})
    encrypted = encrypt_data(data, key)

    with open(CHECK_FILE, "wb") as f:
        f.write(encrypted)

def test_key(key: str) -> bool:
    try:
        # FIRST RUN: initialize system
        if not os.path.exists(CHECK_FILE):
            init_check_file(key)
            return True

        # NORMAL LOGIN: verify password
        with open(CHECK_FILE, "rb") as f:
            encrypted_check = f.read()

        decrypted = decrypt_data(encrypted_check, key)
        data = json.loads(decrypted)

        return data.get("status") == "ok"

    except Exception:
        return False

def test_password(password: str):
    """
    Returns false if not right, else returns the derived key.
    """
    try:
        salt = load_salt()
        key = derive_key(password, salt)

        # FIRST RUN: initialize system
        if not os.path.exists(CHECK_FILE):
            init_check_file(key)
            return True

        # NORMAL LOGIN: verify password
        with open(CHECK_FILE, "rb") as f:
            encrypted_check = f.read()

        decrypted = decrypt_data(encrypted_check, key)
        data = json.loads(decrypted)

        if data.get("status") == "ok":
            return key
        else:
            return False

    except Exception:
        return False