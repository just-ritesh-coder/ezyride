import requests

BASE_URL = "http://localhost:5000"
TOKEN = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def test_trigger_sos_and_record_request():
    url = f"{BASE_URL}/api/sos"
    payload = {}
    response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
    assert response.status_code == 200 or response.status_code == 201, f"Unexpected status code: {response.status_code}"
    data = response.json()
    assert data is not None, "SOS response data is None"
    assert "id" in data or "_id" in data, "SOS request ID not returned"
    sos_id = data.get("id") or data.get("_id")
    assert sos_id, "SOS ID is empty"

test_trigger_sos_and_record_request()
