import requests

BASE_URL = "http://localhost:5000"
AUTH_TOKEN = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_password_reset_request_and_completion():
    # Step 1: Create a user to test with (unique email)
    import uuid
    email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "InitialPass123!"
    new_password = "NewPass456!"

    register_payload = {
        "email": email,
        "password": password,
        "fullName": "Test User",
        "phone": "1234567890"
    }

    try:
        # Register User
        resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"User registration failed: {resp.text}"

        # Step 2: Request password reset via email
        forgot_password_payload = {"email": email}
        resp = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json=forgot_password_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Forgot password request failed: {resp.text}"

        # Step 3: Retrieve the reset token - typically from email, but here,
        # since we can't actually get email, mock token retrieval by an API or test hook:
        # Let's assume there is an internal test API to get the reset token for test emails:
        token_resp = requests.get(
            f"{BASE_URL}/api/auth/test-reset-token",
            params={"email": email},
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert token_resp.status_code == 200, f"Failed to retrieve reset token: {token_resp.text}"
        token_json = token_resp.json()
        reset_token = token_json.get("resetToken") or token_json.get("token")
        assert reset_token, "Reset token not found in response"

        # Step 4: Complete the password reset request using the valid token
        reset_password_payload = {
            "token": reset_token,
            "password": new_password
        }
        resp = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json=reset_password_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Reset password failed: {resp.text}"
        reset_response_json = resp.json()
        assert reset_response_json.get("message"), "Reset password response missing message"

        # Step 5: Verify that login works with new password
        login_payload = {
            "email": email,
            "password": new_password
        }
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Login with new password failed: {resp.text}"
        login_json = resp.json()
        assert "token" in login_json, "JWT token not received on login"
        assert login_json["token"], "Empty JWT token on login"

    finally:
        # Cleanup: Delete the user if API supports deleting users by email or ID
        # Try to fetch user id first via a test endpoint or profile
        profile_resp = requests.get(
            f"{BASE_URL}/api/users/me",
            headers={**HEADERS, "Authorization": f"Bearer {AUTH_TOKEN}"},
            timeout=TIMEOUT
        )
        if profile_resp.status_code == 200:
            profile_json = profile_resp.json()
            user_id = profile_json.get("id") or profile_json.get("_id")
            if user_id:
                requests.delete(
                    f"{BASE_URL}/api/users/{user_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )

test_password_reset_request_and_completion()