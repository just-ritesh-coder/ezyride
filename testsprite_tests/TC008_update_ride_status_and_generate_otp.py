import requests

BASE_URL = "http://localhost:5000"
TOKEN = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_update_ride_status_and_generate_otp():
    ride_data = {
        "from": "CityA",
        "to": "CityB",
        "date": "2024-07-01T10:00:00Z",
        "seatsAvailable": 3,
        "pricePerSeat": 100,
        "notes": "Test ride for OTP and status update"
    }

    ride_id = None
    try:
        # Create a new ride
        create_resp = requests.post(
            f"{BASE_URL}/api/rides",
            headers=HEADERS,
            json=ride_data,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Ride creation failed: {create_resp.text}"
        ride = create_resp.json()
        ride_id = ride.get("_id") or ride.get("id")
        assert ride_id is not None, "Ride ID not returned after creation"

        # Update ride status to 'ongoing'
        status_update = {"status": "ongoing"}
        update_resp = requests.put(
            f"{BASE_URL}/api/rides/{ride_id}/status",
            headers=HEADERS,
            json=status_update,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Ride status update failed: {update_resp.text}"
        update_resp_json = update_resp.json()
        assert update_resp_json.get("status") == "ongoing", "Ride status not updated to ongoing"

        # Generate OTP for ride start
        otp_generate_resp = requests.post(
            f"{BASE_URL}/api/rides/{ride_id}/otp",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert otp_generate_resp.status_code == 200, f"OTP generation failed: {otp_generate_resp.text}"
        otp_data = otp_generate_resp.json()
        otp = otp_data.get("otp")
        assert otp is not None, "OTP not returned in response"

        # Verify the OTP before ride start
        otp_verify_payload = {"otp": otp}
        otp_verify_resp = requests.post(
            f"{BASE_URL}/api/rides/{ride_id}/otp/verify",
            headers=HEADERS,
            json=otp_verify_payload,
            timeout=TIMEOUT
        )
        assert otp_verify_resp.status_code == 200, f"OTP verification failed: {otp_verify_resp.text}"
        otp_verify_json = otp_verify_resp.json()
        assert otp_verify_json.get("verified") == True, "OTP verification did not succeed"

        # Update ride status to 'completed'
        status_complete = {"status": "completed"}
        complete_resp = requests.put(
            f"{BASE_URL}/api/rides/{ride_id}/status",
            headers=HEADERS,
            json=status_complete,
            timeout=TIMEOUT
        )
        assert complete_resp.status_code == 200, f"Ride status update to completed failed: {complete_resp.text}"
        complete_resp_json = complete_resp.json()
        assert complete_resp_json.get("status") == "completed", "Ride status not updated to completed"

    finally:
        if ride_id:
            # Delete the created ride to clean up
            delete_resp = requests.delete(
                f"{BASE_URL}/api/rides/{ride_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert delete_resp.status_code == 200 or delete_resp.status_code == 204, f"Failed to delete ride: {delete_resp.text}"

test_update_ride_status_and_generate_otp()