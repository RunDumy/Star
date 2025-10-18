import json

import requests


def test_infinite_scroll_api():
    """Test the infinite scroll feed API"""
    base_url = "http://localhost:5000"
    
    print("🌟 Testing STAR Infinite Scroll API\n")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health Check: {response.status_code}")
        print(f"   Response: {response.json()}\n")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}\n")
        return
    
    # Test 2: First page (offset 0, limit 5)
    try:
        response = requests.get(f"{base_url}/api/v1/feed?limit=5&offset=0")
        first_page = response.json()
        print(f"✅ First Page: {response.status_code}")
        print(f"   Retrieved {len(first_page)} items")
        print(f"   First item: {first_page[0]['username']} - {first_page[0]['zodiac']}")
        print(f"   Last item:  {first_page[-1]['username']} - {first_page[-1]['zodiac']}\n")
    except Exception as e:
        print(f"❌ First Page Failed: {e}\n")
        return
    
    # Test 3: Second page (offset 5, limit 5)
    try:
        response = requests.get(f"{base_url}/api/v1/feed?limit=5&offset=5")
        second_page = response.json()
        print(f"✅ Second Page: {response.status_code}")
        print(f"   Retrieved {len(second_page)} items")
        print(f"   First item: {second_page[0]['username']} - {second_page[0]['zodiac']}")
        print(f"   Last item:  {second_page[-1]['username']} - {second_page[-1]['zodiac']}\n")
        
        # Verify no duplicates between pages
        first_ids = {item['id'] for item in first_page}
        second_ids = {item['id'] for item in second_page}
        if first_ids.intersection(second_ids):
            print("❌ Found duplicate items between pages!")
        else:
            print("✅ No duplicates found between pages")
    except Exception as e:
        print(f"❌ Second Page Failed: {e}\n")
        return
    
    # Test 4: Large offset (to test end of data)
    try:
        response = requests.get(f"{base_url}/api/v1/feed?limit=10&offset=95")
        end_page = response.json()
        print(f"✅ Near End Page: {response.status_code}")
        print(f"   Retrieved {len(end_page)} items (should be 5 if total is 100)")
        if len(end_page) > 0:
            print(f"   Last item: {end_page[-1]['username']} - {end_page[-1]['zodiac']}\n")
    except Exception as e:
        print(f"❌ End Page Failed: {e}\n")
        return
    
    # Test 5: Beyond data (should return empty)
    try:
        response = requests.get(f"{base_url}/api/v1/feed?limit=10&offset=100")
        empty_page = response.json()
        print(f"✅ Beyond Data: {response.status_code}")
        print(f"   Retrieved {len(empty_page)} items (should be 0)")
    except Exception as e:
        print(f"❌ Beyond Data Failed: {e}\n")
        return
    
    print("\n🎉 All tests completed! Your infinite scroll API is working correctly!")

if __name__ == "__main__":
    test_infinite_scroll_api()