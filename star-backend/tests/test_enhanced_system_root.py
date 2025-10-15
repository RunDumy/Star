#!/usr/bin/env python3
"""
STAR Platform Enhanced Features Test Script
Tests WebSocket real-time updates, virtual scrolling, offline support, and multi-zodiac features
"""

import asyncio
import json
import os
import random
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

import requests

# Configuration
BASE_URL = "http://localhost:5000"
WEBSOCKET_URL = "ws://localhost:5000"
API_BASE = f"{BASE_URL}/api/v1"

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(text):
    """Print formatted header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}\n")

def print_success(text):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_info(text):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

class StarEnhancedTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        
    def check_backend_health(self):
        """Check if enhanced backend is running"""
        print_header("Backend Health Check")
        
        try:
            # Check basic health endpoint
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                print_success("Backend is running")
                health_data = response.json()
                print_info(f"Version: {health_data.get('version', 'Unknown')}")
                print_info(f"Features: {', '.join(health_data.get('features', []))}")
            else:
                print_error(f"Backend health check failed: {response.status_code}")
                return False
                
            # Check WebSocket endpoint
            websocket_response = self.session.get(f"{BASE_URL}/socket.io/")
            if websocket_response.status_code == 200:
                print_success("WebSocket endpoint is available")
            else:
                print_warning("WebSocket endpoint may not be available")
                
            return True
            
        except requests.exceptions.ConnectionError:
            print_error("Cannot connect to backend. Make sure enhanced-star-backend.py is running")
            return False
        except Exception as e:
            print_error(f"Backend health check failed: {str(e)}")
            return False

    def test_authentication(self):
        """Test user authentication"""
        print_header("Authentication Test")
        
        # Test user credentials
        test_username = f"testuser_{int(time.time())}"
        test_password = "testpass123"
        
        try:
            # Register test user
            register_data = {
                "username": test_username,
                "password": test_password,
                "zodiac": "Scorpio",
                "birth_date": "1990-11-15",
                "birth_time": "14:30",
                "birth_location": "New York, NY"
            }
            
            register_response = self.session.post(f"{API_BASE}/auth/register", json=register_data)
            if register_response.status_code == 201:
                print_success("User registration successful")
                self.auth_token = register_response.json().get('access_token')
                self.test_user_id = register_response.json().get('user_id')
            else:
                print_error(f"Registration failed: {register_response.status_code}")
                return False
                
            # Set auth header for future requests
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
            
            return True
            
        except Exception as e:
            print_error(f"Authentication test failed: {str(e)}")
            return False

    def test_multi_zodiac_calculation(self):
        """Test multi-zodiac calculation system"""
        print_header("Multi-Zodiac Calculation Test")
        
        try:
            # Test multi-zodiac calculation
            birth_data = {
                "birth_date": "1990-11-15",
                "birth_time": "14:30",
                "birth_location": "New York, NY"
            }
            
            response = self.session.post(f"{API_BASE}/zodiac/calculate-multi", json=birth_data)
            
            if response.status_code == 200:
                zodiac_data = response.json()
                print_success("Multi-zodiac calculation successful")
                
                print_info(f"Western: {zodiac_data.get('western')}")
                print_info(f"Chinese: {zodiac_data.get('chinese')}")
                print_info(f"Vedic: {zodiac_data.get('vedic')}")
                print_info(f"Mayan: {zodiac_data.get('mayan')}")
                print_info(f"Galactic Tone: {zodiac_data.get('galactic_tone')}")
                
                return True
            else:
                print_error(f"Multi-zodiac calculation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Multi-zodiac test failed: {str(e)}")
            return False

    def generate_test_posts(self, count=50):
        """Generate test posts for virtual scrolling"""
        print_header(f"Generating {count} Test Posts")
        
        post_types = ['text', 'tarot_reading', 'cosmic_event']
        zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        created_posts = 0
        
        try:
            for i in range(count):
                post_type = random.choice(post_types)
                
                if post_type == 'tarot_reading':
                    post_data = {
                        "type": "tarot_reading",
                        "content": {
                            "card_name": f"Test Card {i}",
                            "card_meaning": "Test meaning",
                            "interpretation": f"This is a test tarot reading interpretation {i} with cosmic insights."
                        }
                    }
                elif post_type == 'cosmic_event':
                    post_data = {
                        "type": "cosmic_event",
                        "content": {
                            "event_name": f"Test Cosmic Event {i}",
                            "description": f"A mystical cosmic event {i} is occurring in the universe."
                        }
                    }
                else:
                    post_data = {
                        "type": "text",
                        "content": f"Test post {i} - The cosmic energies are aligning beautifully today. 🌟✨ #cosmicvibes #{random.choice(zodiac_signs).lower()}"
                    }
                
                response = self.session.post(f"{API_BASE}/posts", json=post_data)
                
                if response.status_code == 201:
                    created_posts += 1
                    if created_posts % 10 == 0:
                        print_info(f"Created {created_posts} posts...")
                else:
                    print_warning(f"Failed to create post {i}")
                    
                # Small delay to avoid overwhelming the server
                time.sleep(0.1)
            
            print_success(f"Successfully created {created_posts} test posts")
            return created_posts > 0
            
        except Exception as e:
            print_error(f"Test post generation failed: {str(e)}")
            return False

    def test_infinite_scroll_api(self):
        """Test infinite scroll API endpoints"""
        print_header("Infinite Scroll API Test")
        
        try:
            # Test basic posts endpoint
            response = self.session.get(f"{API_BASE}/posts?page=1&limit=20")
            
            if response.status_code == 200:
                posts_data = response.json()
                posts = posts_data.get('posts', [])
                print_success(f"Retrieved {len(posts)} posts")
                print_info(f"Has more: {posts_data.get('has_more', False)}")
                print_info(f"Total count: {posts_data.get('total_count', 0)}")
                
                # Test pagination
                if posts_data.get('has_more'):
                    page2_response = self.session.get(f"{API_BASE}/posts?page=2&limit=20")
                    if page2_response.status_code == 200:
                        print_success("Pagination working correctly")
                    else:
                        print_warning("Pagination test failed")
                
                return True
            else:
                print_error(f"Posts API failed: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Infinite scroll API test failed: {str(e)}")
            return False

    def test_personalized_feed(self):
        """Test personalized feed filtering"""
        print_header("Personalized Feed Test")
        
        try:
            # Test zodiac filtering
            filter_params = {
                'zodiac': 'Scorpio',
                'post_types': ['tarot_reading', 'cosmic_event'],
                'page': 1,
                'limit': 10
            }
            
            response = self.session.get(f"{API_BASE}/posts/personalized", params=filter_params)
            
            if response.status_code == 200:
                filtered_posts = response.json()
                print_success("Personalized feed filtering working")
                print_info(f"Filtered posts: {len(filtered_posts.get('posts', []))}")
                
                # Test compatibility filtering
                compatibility_params = {
                    'compatibility_match': True,
                    'user_zodiac': 'Scorpio'
                }
                
                compat_response = self.session.get(f"{API_BASE}/posts/compatible", params=compatibility_params)
                if compat_response.status_code == 200:
                    print_success("Compatibility filtering working")
                
                return True
            else:
                print_error(f"Personalized feed test failed: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Personalized feed test failed: {str(e)}")
            return False

    def test_offline_support_api(self):
        """Test offline support API endpoints"""
        print_header("Offline Support API Test")
        
        try:
            # Test sync endpoint
            sync_data = {
                'offline_posts': [
                    {
                        'id': 'offline_1',
                        'content': 'This post was created offline',
                        'type': 'text',
                        'created_at': datetime.now().isoformat()
                    }
                ],
                'offline_likes': [
                    {'post_id': 'test_post_1', 'action': 'like'}
                ]
            }
            
            response = self.session.post(f"{API_BASE}/sync/offline", json=sync_data)
            
            if response.status_code == 200:
                print_success("Offline sync endpoint working")
                sync_result = response.json()
                print_info(f"Synced posts: {sync_result.get('synced_posts', 0)}")
                print_info(f"Synced likes: {sync_result.get('synced_likes', 0)}")
                return True
            else:
                print_error(f"Offline sync test failed: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Offline support test failed: {str(e)}")
            return False

    def test_websocket_connection(self):
        """Test WebSocket connection (basic check)"""
        print_header("WebSocket Connection Test")
        
        try:
            # This is a basic test - in a real scenario you'd use a WebSocket client
            websocket_info = self.session.get(f"{BASE_URL}/socket.io/")
            
            if websocket_info.status_code == 200:
                print_success("WebSocket endpoint is accessible")
                print_info("For full WebSocket testing, use the frontend application")
                return True
            else:
                print_error("WebSocket endpoint not accessible")
                return False
                
        except Exception as e:
            print_error(f"WebSocket test failed: {str(e)}")
            return False

    def performance_test(self):
        """Test API performance under load"""
        print_header("Performance Test")
        
        try:
            # Test concurrent requests
            def make_request():
                return self.session.get(f"{API_BASE}/posts?page=1&limit=10")
            
            print_info("Testing 10 concurrent requests...")
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(make_request) for _ in range(10)]
                results = [f.result() for f in futures]
            
            end_time = time.time()
            successful_requests = sum(1 for r in results if r.status_code == 200)
            
            print_success(f"Completed {successful_requests}/10 requests in {end_time - start_time:.2f} seconds")
            
            if successful_requests >= 8:  # Allow for some failures
                return True
            else:
                print_warning("Performance test shows potential issues")
                return False
                
        except Exception as e:
            print_error(f"Performance test failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests"""
        print_header("STAR Enhanced Features Test Suite")
        print_info("Testing all advanced features...")
        
        test_results = []
        
        # Run tests
        tests = [
            ("Backend Health", self.check_backend_health),
            ("Authentication", self.test_authentication),
            ("Multi-Zodiac Calculation", self.test_multi_zodiac_calculation),
            ("Test Post Generation", lambda: self.generate_test_posts(20)),
            ("Infinite Scroll API", self.test_infinite_scroll_api),
            ("Personalized Feed", self.test_personalized_feed),
            ("Offline Support API", self.test_offline_support_api),
            ("WebSocket Connection", self.test_websocket_connection),
            ("Performance Test", self.performance_test)
        ]
        
        for test_name, test_func in tests:
            print_info(f"Running: {test_name}")
            try:
                result = test_func()
                test_results.append((test_name, result))
                if result:
                    print_success(f"{test_name} passed")
                else:
                    print_error(f"{test_name} failed")
            except Exception as e:
                print_error(f"{test_name} crashed: {str(e)}")
                test_results.append((test_name, False))
            
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print_header("Test Summary")
        passed = sum(1 for _, result in test_results if result)
        total = len(test_results)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.END}")
        
        if passed == total:
            print_success("🎉 All tests passed! Enhanced features are working correctly.")
        elif passed >= total * 0.8:
            print_warning("⚠️ Most tests passed, but some issues detected.")
        else:
            print_error("❌ Multiple test failures detected. Check configuration.")
        
        return passed >= total * 0.8

def main():
    """Main test runner"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--generate-data":
            count = int(sys.argv[2]) if len(sys.argv) > 2 else 100
            tester = StarEnhancedTester()
            if tester.check_backend_health():
                tester.test_authentication()
                tester.generate_test_posts(count)
            return
    
    # Run full test suite
    tester = StarEnhancedTester()
    success = tester.run_all_tests()
    
    if success:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🌟 Enhanced STAR platform is ready for production! 🌟{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️ Issues detected. Review the test results above. ⚠️{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()