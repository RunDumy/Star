import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Set testing environment
os.environ['TESTING'] = 'true'

# Import the app
from star_backend_flask.main import create_app

# Create test app
app = create_app()
app.config['TESTING'] = True

# Test the posts endpoint
with app.test_client() as client:
    resp = client.get('/api/v1/posts')
    print("Status:", resp.status_code)
    print("Response:", resp.get_json())
    if resp.status_code == 200:
        data = resp.get_json()
        if data['posts']:
            print("Test passed: Posts returned")
        else:
            print("Test issue: Empty posts list")
    else:
        print("Test failed: Bad status code")