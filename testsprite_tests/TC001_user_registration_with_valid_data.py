import requests

def test_user_registration_with_valid_data():
    base_url = "http://localhost:5000"
    endpoint = "/api/auth/register"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": "testuser@example.com",
        "password": "StrongPassw0rd!",
        "fullName": "Test User",
        "phone": "+12345678901"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201 or response.status_code == 200, f"Unexpected status code: {response.status_code}"
        data = response.json()
        # Check for user ID in 'id', 'userId' or inside 'user' object
        user_id_exists = ('id' in data) or ('userId' in data) or ('user' in data and ('id' in data['user'] or 'userId' in data['user']))
        assert user_id_exists, "Response JSON does not contain user ID"
        # Verify email if present
        returned_email = ""
        if 'email' in data:
            returned_email = data.get('email', "").lower()
        elif 'user' in data:
            returned_email = data['user'].get('email', "").lower()
        if returned_email:
            assert returned_email == payload["email"].lower(), "Returned email does not match"
        # Ensure password is not returned
        assert "password" not in data and ("password" not in data.get('user', {})), "Password should not be returned in response"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_user_registration_with_valid_data()