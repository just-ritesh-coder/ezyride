import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
UPLOAD_URL = f"{BASE_URL}/api/kyc/upload"

# Create dummy images
def create_dummy_image(filename):
    with open(filename, 'wb') as f:
        f.write(os.urandom(1024)) # 1KB dummy file

create_dummy_image('dummy_front.jpg')
create_dummy_image('dummy_back.jpg')
create_dummy_image('dummy_selfie.jpg')

def test_kyc_flow():
    # 1. Login (use an existing user or creating one would be better, but assuming user exists or we can register)
    # Let's try to register a new user to be sure
    register_url = f"{BASE_URL}/api/auth/register"
    user_data = {
        "fullName": "Test KYC User",
        "email": f"testkyc_{os.urandom(4).hex()}@example.com",
        "password": "password123",
        "phone": "9876543210"
    }
    
    print(f"Registering user: {user_data['email']}")
    reg_res = requests.post(register_url, json=user_data)
    if reg_res.status_code != 201 and reg_res.status_code != 200:
        print(f"Registration failed: {reg_res.text}")
        return

    token = reg_res.json().get('token')
    print(f"User registered. Token: {token[:10]}...")

    # 2. Upload KYC Docs
    headers = {'Authorization': f'Bearer {token}'}
    
    # Open files securely
    files = {}
    try:
        files['aadhaarFront'] = ('dummy_front.jpg', open('dummy_front.jpg', 'rb'), 'image/jpeg')
        files['aadhaarBack'] = ('dummy_back.jpg', open('dummy_back.jpg', 'rb'), 'image/jpeg')
        files['selfie'] = ('dummy_selfie.jpg', open('dummy_selfie.jpg', 'rb'), 'image/jpeg')
        
        print("Uploading KYC documents...")
        res = requests.post(UPLOAD_URL, headers=headers, files=files)
        
        print(f"Status Code: {res.status_code}")
        try:
            print(json.dumps(res.json(), indent=2))
        except:
            print(res.text)
    finally:
        # Close all files
        for val in files.values():
            if isinstance(val, tuple):
                val[1].close()
            else:
                val.close()

    # Cleanup
    for f in ['dummy_front.jpg', 'dummy_back.jpg', 'dummy_selfie.jpg']:
        if os.path.exists(f):
            os.remove(f)

if __name__ == "__main__":
    try:
        test_kyc_flow()
    except Exception as e:
        print(f"Error: {e}")
