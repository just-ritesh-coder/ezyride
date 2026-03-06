import requests
import datetime
import time

base_url = "http://localhost:5000"

def register_and_login(role):
    timestamp = int(time.time())
    email = f"{role}_{timestamp}@example.com"
    password = "password123"
    name = f"{role} User"
    
    # Register
    requests.post(f"{base_url}/api/auth/register", json={
        "email": email, "password": password, "fullName": name, "phone": "1234567890"
    })
    # Login
    resp = requests.post(f"{base_url}/api/auth/login", json={
        "email": email, "password": password
    })
    return resp.json()["token"], resp.json()["_id"]

def test_otp_flow():
    print("1. Registering Driver...")
    driver_token, driver_id = register_and_login("driver")
    
    print("2. Driver Posting Ride...")
    headers_driver = {"Authorization": f"Bearer {driver_token}"}
    ride_resp = requests.post(f"{base_url}/api/rides", json={
        "from": "A", "to": "B", 
        "date": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + "Z",
        "seatsAvailable": 3, "pricePerSeat": 100
    }, headers=headers_driver)
    
    # Handle the bug found earlier: ride ID might be nested or at root
    ride_data = ride_resp.json()
    ride_id = ride_data.get("ride", {}).get("_id") or ride_data.get("_id") or ride_data.get("id")
    print(f"   Ride created: {ride_id}")
    
    print("3. Registering Passenger...")
    pass_token, pass_id = register_and_login("passenger")
    
    print("4. Passenger Booking Ride...")
    headers_pass = {"Authorization": f"Bearer {pass_token}"}
    book_resp = requests.post(f"{base_url}/api/bookings", json={
        "rideId": ride_id, "seats": 1
    }, headers=headers_pass)
    
    if book_resp.status_code != 201:
        print(f"   Booking failed: {book_resp.text}")
        return

    # 5. Extract OTP from My Bookings (since POST /bookings doesn't return it)
    print("5. Passenger Fetching OTP...")
    my_bookings_resp = requests.get(f"{base_url}/api/bookings/mybookings", headers=headers_pass)
    bookings = my_bookings_resp.json().get("bookings", [])
    booking = next((b for b in bookings if b["ride"]["_id"] == ride_id), None)
    
    otp = booking["ride_start_code"]
    print(f"   OTP Found: {otp}")
    
    print("6. Driver Starting Ride with OTP...")
    # Try the endpoint that requires code: /:rideId/start/verify OR /:rideId/start
    # routes/rides.js has router.post('/:rideId/start', ...) which checks code if provided
    
    start_resp = requests.post(f"{base_url}/api/rides/{ride_id}/start", json={
        "code": otp
    }, headers=headers_driver)
    
    print(f"   Start Response Code: {start_resp.status_code}")
    print(f"   Start Response Body: {start_resp.text}")

    if start_resp.status_code == 200:
        print("SUCCESS: Ride started with OTP.")
    else:
        print("FAILURE: Could not start ride.")

if __name__ == "__main__":
    test_otp_flow()
