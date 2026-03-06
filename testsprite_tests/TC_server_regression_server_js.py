import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 10


def test_base_route_returns_running_message():
    resp = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
    assert resp.status_code == 200, f"Unexpected status code: {resp.status_code} -> {resp.text}"
    assert "Ride Sharing API is running" in resp.text, f"Unexpected body: {resp.text}"


def test_chat_endpoints_require_auth():
    # Use a made-up ride id; middleware checks auth before DB lookup
    fake_ride_id = "000000000000000000000000"

    # GET chat history without token -> should be 401
    get_resp = requests.get(f"{BASE_URL}/api/chats/{fake_ride_id}", timeout=TIMEOUT)
    assert get_resp.status_code == 401, f"Expected 401 for GET without auth, got {get_resp.status_code}"

    # POST message without token -> should be 401
    post_resp = requests.post(f"{BASE_URL}/api/chats/{fake_ride_id}", json={"message": "hi"}, timeout=TIMEOUT)
    assert post_resp.status_code == 401, f"Expected 401 for POST without auth, got {post_resp.status_code}"


def run_all():
    test_base_route_returns_running_message()
    test_chat_endpoints_require_auth()


if __name__ == "__main__":
    run_all()
