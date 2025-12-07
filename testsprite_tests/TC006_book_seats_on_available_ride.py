import requests

BASE_URL = "http://localhost:5000"
AUTH_TOKEN = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_book_seats_on_available_ride():
    # Step 1: Create a new ride to be booked
    ride_payload = {
        "from": "CityA",
        "to": "CityB",
        "date": "2099-12-31T10:00:00Z",
        "seatsAvailable": 4,
        "pricePerSeat": 50.0
    }
    ride_id = None
    booking_id = None

    try:
        # Create ride
        ride_response = requests.post(f"{BASE_URL}/api/rides", json=ride_payload, headers=HEADERS, timeout=TIMEOUT)
        assert ride_response.status_code == 201, f"Ride creation failed with status {ride_response.status_code}"
        ride_data = ride_response.json()
        ride_id = ride_data.get("id") or ride_data.get("_id")
        assert ride_id is not None, "Created ride does not have an ID"
        initial_seats = ride_data.get("seatsAvailable")
        assert initial_seats == 4, f"Initial seatsAvailable expected to be 4 but got {initial_seats}"

        # Step 2: Book seats on the ride
        book_payload = {
            "rideId": ride_id,
            "seatsBooked": 2
        }
        booking_response = requests.post(f"{BASE_URL}/api/bookings", json=book_payload, headers=HEADERS, timeout=TIMEOUT)
        assert booking_response.status_code == 201, f"Booking failed with status {booking_response.status_code}"
        booking_data = booking_response.json()
        booking_id = booking_data.get("id") or booking_data.get("_id")
        assert booking_id is not None, "Booking response does not contain an ID"
        booked_seats = booking_data.get("seatsBooked")
        assert booked_seats == 2, f"Seats booked expected to be 2 but got {booked_seats}"
        booked_ride_id = booking_data.get("rideId")
        assert booked_ride_id == ride_id, "Booking rideId does not match created rideId"

        # Step 3: Get ride details to confirm seatsAvailable is reduced accordingly
        ride_detail_response = requests.get(f"{BASE_URL}/api/rides/{ride_id}", headers=HEADERS, timeout=TIMEOUT)
        assert ride_detail_response.status_code == 200, f"Failed to get ride details, status {ride_detail_response.status_code}"
        ride_detail_data = ride_detail_response.json()
        seats_available_after_booking = ride_detail_data.get("seatsAvailable")
        expected_seats_after = initial_seats - booked_seats
        assert seats_available_after_booking == expected_seats_after, \
            f"Seats available after booking expected {expected_seats_after} but got {seats_available_after_booking}"

    finally:
        # Cleanup booking
        if booking_id:
            try:
                del_booking_resp = requests.delete(f"{BASE_URL}/api/bookings/{booking_id}", headers=HEADERS, timeout=TIMEOUT)
                assert del_booking_resp.status_code in (200, 204), f"Failed to delete booking with status {del_booking_resp.status_code}"
            except Exception:
                pass

        # Cleanup ride
        if ride_id:
            try:
                del_ride_resp = requests.delete(f"{BASE_URL}/api/rides/{ride_id}", headers=HEADERS, timeout=TIMEOUT)
                assert del_ride_resp.status_code in (200, 204), f"Failed to delete ride with status {del_ride_resp.status_code}"
            except Exception:
                pass


test_book_seats_on_available_ride()