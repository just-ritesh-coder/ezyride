import requests
import time
import threading
import websocket
import json

BASE_URL = "http://localhost:5000"
TOKEN = "b6b347741b87b53be66d0263b691738515836a8128f26c58be50c9f86a4008a21dfce004959dfd99f97fc0e6a0956406822bd9f96aabf5343688ade678f940ed"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
TIMEOUT = 30

def test_real_time_chat_access_and_messaging():
    # Step 1: Get current user info to identify user ID (needed for booking)
    user_resp = requests.get(f"{BASE_URL}/api/users/me", headers=HEADERS, timeout=TIMEOUT)
    assert user_resp.status_code == 200, f"Failed to get user profile: {user_resp.text}"
    user = user_resp.json()
    user_id = user.get("id") or user.get("_id")
    assert user_id, "User ID not found in profile"

    # Step 2: Create a new ride posted by this user
    ride_payload = {
        "from": "LocationA",
        "to": "LocationB",
        "date": "2099-12-31T12:00:00Z",
        "seatsAvailable": 3,
        "pricePerSeat": 100
    }
    ride_resp = requests.post(f"{BASE_URL}/api/rides", headers=HEADERS, json=ride_payload, timeout=TIMEOUT)
    assert ride_resp.status_code == 201, f"Failed to create ride: {ride_resp.text}"
    ride = ride_resp.json()
    ride_id = ride.get("id") or ride.get("_id")
    assert ride_id, "Ride ID not found after creation"

    # Step 3: Book a seat on this ride (user is participant now)
    booking_payload = {
        "rideId": ride_id,
        "seatsBooked": 1
    }
    booking_resp = requests.post(f"{BASE_URL}/api/bookings", headers=HEADERS, json=booking_payload, timeout=TIMEOUT)
    assert booking_resp.status_code == 201, f"Failed to book a seat: {booking_resp.text}"
    booking = booking_resp.json()
    booking_id = booking.get("id") or booking.get("_id")
    assert booking_id, "Booking ID not found after creation"

    # Step 4: Connect to the ride chat WebSocket to join the chat room and send/receive messages
    # Assuming the chat uses a websocket URL like ws://localhost:5000/ws/chats/{ride_id}?token=...
    # We have only /api/chats endpoint in REST, but chat is realtime so websocket is used.

    # Prepare websocket URL and auth
    ws_url = f"ws://localhost:5000/ws/chats/{ride_id}?token={TOKEN}"

    received_messages = []

    def on_message(ws, message):
        received_messages.append(json.loads(message))

    def on_error(ws, error):
        raise AssertionError(f"WebSocket error: {error}")

    def on_close(ws):
        pass

    def on_open(ws):
        # Send a test chat message once connection is open
        msg = {"type": "message", "content": "Hello from test", "rideId": ride_id}
        ws.send(json.dumps(msg))

    # Create websocket app
    ws = websocket.WebSocketApp(
        ws_url,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=on_open,
        header={"Authorization": f"Bearer {TOKEN}"}
    )

    # Run websocket in another thread to not block
    ws_thread = threading.Thread(target=ws.run_forever)
    ws_thread.daemon = True
    ws_thread.start()

    # Allow some time for connect, send, and receive
    timeout_counter = 0
    max_wait = 10
    while timeout_counter < max_wait and len(received_messages) == 0:
        time.sleep(1)
        timeout_counter += 1

    # Validate that we received the message back (echo or broadcast by server)
    assert len(received_messages) > 0, "No message received from chat server"
    found_hello = any("Hello from test" in m.get("content", "") for m in received_messages)
    assert found_hello, "Sent message not received in chat room"

    # Step 5: Verify that a user not booked cannot join this chat
    # Create a second user by registering new user to test access restriction
    new_user_email = "tempuserrechattest@example.com"
    new_user_password = "TestPass123!"

    try:
        # Register new user
        reg_payload = {
            "email": new_user_email,
            "password": new_user_password,
            "fullName": "Temp Chat User",
            "phone": "1234567890"
        }
        reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"Failed to register temp user: {reg_resp.text}"

        # Login new user to get token
        login_payload = {"email": new_user_email, "password": new_user_password}
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Failed to login temp user: {login_resp.text}"
        login_data = login_resp.json()
        temp_token = login_data.get("token")
        assert temp_token, "Temp user login token missing"

        # Attempt to connect websocket chat as unauthorized user
        ws_url_unauth = f"ws://localhost:5000/ws/chats/{ride_id}?token={temp_token}"

        error_received = []

        def on_error_test(ws, error):
            error_received.append(str(error))

        ws_unauth = websocket.WebSocketApp(
            ws_url_unauth,
            on_message=lambda ws, msg: None,
            on_error=on_error_test,
            on_close=lambda ws: None,
            on_open=lambda ws: None,
            header={"Authorization": f"Bearer {temp_token}"}
        )
        ws_thread_unauth = threading.Thread(target=ws_unauth.run_forever)
        ws_thread_unauth.daemon = True
        ws_thread_unauth.start()

        time.sleep(3)

        # We expect some error or connection close or no valid messages allowed
        # The server should deny access, so either error captured or closed connection quickly
        assert len(error_received) > 0 or not ws_unauth.sock or not ws_unauth.sock.connected, "Unauthorized user was able to connect to ride chat"

    finally:
        # Cleanup booking
        if booking_id:
            requests.delete(f"{BASE_URL}/api/bookings/{booking_id}", headers=HEADERS, timeout=TIMEOUT)
        # Cleanup ride
        if ride_id:
            requests.delete(f"{BASE_URL}/api/rides/{ride_id}", headers=HEADERS, timeout=TIMEOUT)
        # Cleanup temp user
        try:
            # Assuming /api/users/me/delete or admin endpoint is not available,
            # so skipping permanent deletion of temp user because no API info available.
            pass
        except Exception:
            pass

    ws.close()
    ws_thread.join(timeout=1)


test_real_time_chat_access_and_messaging()