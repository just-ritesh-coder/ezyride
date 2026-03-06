import requests
import socketio
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 10


def register_temp_user():
    email = f"testsock_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "fullName": "Socket Test User",
        "email": email,
        "password": "TestPass123!",
        "phone": "0000000000"
    }
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=TIMEOUT)
    if resp.status_code not in (200, 201):
        raise AssertionError(f"Failed to register temp user: {resp.status_code} {resp.text}")
    data = resp.json()
    token = data.get("token") or data.get("token")
    if not token:
        # Try login fallback
        login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": payload["password"]}, timeout=TIMEOUT)
        if login.status_code != 200:
            raise AssertionError(f"Failed to login temp user: {login.status_code} {login.text}")
        token = login.json().get("token")
    return token


def test_socketio_rejects_without_token():
    sio = socketio.Client()
    try:
        sio.connect(BASE_URL, wait_timeout=5)
        # If connect succeeded without token, that's a failure
        sio.disconnect()
        raise AssertionError("Socket.IO connection succeeded without token")
    except Exception as e:
        # Expect some kind of connection error caused by middleware
        msg = str(e)
        assert "Unauthorized" in msg or "401" in msg or "Connection refused" in msg or "ConnectionError" in msg


def test_socketio_allows_with_token():
    token = register_temp_user()
    sio = socketio.Client()
    connected = False

    def on_connect():
        nonlocal connected
        connected = True

    sio.on('connect', on_connect)
    try:
        sio.connect(BASE_URL, auth={"token": token}, wait_timeout=5)
        assert connected is True, "Client did not receive connect event"
    finally:
        try:
            sio.disconnect()
        except Exception:
            pass


def run_all():
    test_socketio_rejects_without_token()
    test_socketio_allows_with_token()


if __name__ == "__main__":
    run_all()
