import requests

def test_user_login_with_correct_credentials():
    base_url = "http://localhost:5000"
    login_endpoint = "/api/auth/login"
    url = base_url + login_endpoint

    import time
    timestamp = int(time.time())
    email = f"testuser_{timestamp}@example.com"
    password = "TestPassword123!"
    
    # Register user first
    register_payload = {
        "email": email,
        "password": password,
        "fullName": "Test User",
        "phone": "+12345678901"
    }
    requests.post(f"{base_url}/api/auth/register", json=register_payload)

    # Use a valid test email and password to login
    # These must exist in the system or be seeded data for testing
    payload = {
        "email": email,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()  # Raise an HTTPError if the HTTP request returned an unsuccessful status code

        json_response = response.json()
        # Assert the login was successful and a JWT token is returned
        assert "token" in json_response, "JWT token not present in response"
        assert isinstance(json_response["token"], str) and len(json_response["token"]) > 0, "JWT token is empty or not a string"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_user_login_with_correct_credentials()