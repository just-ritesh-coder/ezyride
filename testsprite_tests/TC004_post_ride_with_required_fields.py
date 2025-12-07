import requests
import datetime

def test_post_ride_with_required_fields():
    base_url = "http://localhost:5000"
    token = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    post_ride_url = f"{base_url}/api/rides"
    
    # Prepare payload with required fields
    payload = {
        "from": "New York",
        "to": "Boston",
        "date": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + "Z",
        "seatsAvailable": 3,
        "pricePerSeat": 25.50
    }

    ride_id = None
    try:
        response = requests.post(post_ride_url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        data = response.json()
        # Validate presence of ride ID and correct data in response
        assert "id" in data or "_id" in data, "Response missing ride ID"
        ride_id = data.get("id") or data.get("_id")
        assert data.get("from") == payload["from"], f"Expected from='{payload['from']}', got '{data.get('from')}'"
        assert data.get("to") == payload["to"], f"Expected to='{payload['to']}', got '{data.get('to')}'"
        # The date in response might be in a different format, at least check it's present
        assert "date" in data, "Response missing date"
        assert data.get("seatsAvailable") == payload["seatsAvailable"], f"Expected seatsAvailable={payload['seatsAvailable']}, got {data.get('seatsAvailable')}"
        assert float(data.get("pricePerSeat")) == payload["pricePerSeat"], f"Expected pricePerSeat={payload['pricePerSeat']}, got {data.get('pricePerSeat')}"
        # Status should default to 'posted'
        assert data.get("status") == "posted", f"Expected status='posted', got '{data.get('status')}'"

    finally:
        if ride_id:
            # Clean up: delete the created ride
            try:
                delete_url = f"{post_ride_url}/{ride_id}"
                del_response = requests.delete(delete_url, headers=headers, timeout=30)
                assert del_response.status_code in (200, 204), f"Failed to delete ride with id {ride_id}"
            except Exception:
                pass

test_post_ride_with_required_fields()