import requests

BASE_URL = "http://localhost:5000"
HEADERS = {
    "Content-Type": "application/json"
}

def get_auth_token():
    login_url = f"{BASE_URL}/api/auth/login"
    # Assuming these are valid test user credentials
    login_data = {
        "email": "testuser@example.com",
        "password": "TestPassword123"
    }
    response = requests.post(login_url, json=login_data, headers=HEADERS, timeout=30)
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json().get("token")
    assert token, "No token received from login"
    return token

def test_search_rides_by_origin_and_destination():
    token = get_auth_token()
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    ride_post_url = f"{BASE_URL}/api/rides"
    ride_search_url = f"{BASE_URL}/api/rides/search"

    ride_data = {
        "from": "New York",
        "to": "Boston",
        "date": "2024-07-01T10:00:00Z",
        "seatsAvailable": 3,
        "pricePerSeat": 50.0
    }

    created_ride_id = None

    try:
        # Create a ride to ensure there is at least one matching ride
        response_post = requests.post(ride_post_url, json=ride_data, headers=auth_headers, timeout=30)
        assert response_post.status_code == 201, f"Failed to create ride: {response_post.text}"
        ride_response = response_post.json()
        created_ride_id = ride_response.get("id")
        assert created_ride_id, "Created ride has no id"

        # Now search for rides by origin and destination
        params = {
            "from": ride_data["from"],
            "to": ride_data["to"]
        }
        response_search = requests.get(ride_search_url, headers=auth_headers, params=params, timeout=30)
        assert response_search.status_code == 200, f"Search request failed: {response_search.text}"
        rides = response_search.json()
        assert isinstance(rides, list), "Search response is not a list"

        # Validate at least one ride matches criteria and has available seats and price
        matching_rides = [ride for ride in rides if ride.get("from") == ride_data["from"]
                          and ride.get("to") == ride_data["to"]
                          and ride.get("seatsAvailable", 0) > 0
                          and "pricePerSeat" in ride]
        assert len(matching_rides) > 0, "No matching rides found with available seats and price"

    finally:
        # Cleanup - delete the created ride if it exists
        if created_ride_id:
            delete_url = f"{ride_post_url}/{created_ride_id}"
            requests.delete(delete_url, headers=auth_headers, timeout=30)


test_search_rides_by_origin_and_destination()