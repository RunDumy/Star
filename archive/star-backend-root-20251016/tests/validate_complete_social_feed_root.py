#!/usr/bin/env python3
"""
Complete Social Feed System Validation Test

This script validates the unified social feed implementation with:
- Enhanced feed API endpoints
- Real-time WebSocket integration 
- Zodiac-specific social actions (304 combinations)
- Advanced filtering and sorting
- Infinite scroll pagination
- Cosmic energy calculations
- Multi-zodiac system support

Run this after implementing the complete social feed system to ensure
all components work together seamlessly.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import requests
import websocket

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CompleteSocialFeedValidator:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1"
        self.ws_url = f"ws://localhost:5000"
        self.auth_token = None
        self.test_results = []
        
        # Test data
        self.test_user = {
            "username": "CosmicTestUser",
            "email": "test@cosmic.star",
            "password": "CosmicTest123!",
            "zodiac_signs": {
                "western": "Scorpio",
                "chinese": "Dragon",
                "vedic": "Vrishchika",
                "galactic_tone": 8
            }
        }
        
        self.zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        self.chinese_zodiac = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                              'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
        
        self.social_actions = ['like', 'comment', 'share', 'follow', 'boost', 'transform']

    def log_test_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result with timestamp"""
        result = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"{status} - {test_name}: {details}")

    def authenticate_test_user(self) -> bool:
        """Authenticate test user and get JWT token"""
        try:
            # Register test user
            register_data = {
                **self.test_user,
                "birthdate": "1990-11-08"
            }
            
            response = requests.post(f"{self.api_url}/auth/register", json=register_data, timeout=10)
            
            if response.status_code == 201:
                result = response.json()
                self.auth_token = result.get('token')
                self.log_test_result("User Registration", True, f"User registered with token: {self.auth_token[:20]}...")
                return True
            else:
                # Try login if user already exists
                login_data = {
                    "email": self.test_user["email"],
                    "password": self.test_user["password"]
                }
                
                response = requests.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    self.auth_token = result.get('token')
                    self.log_test_result("User Login", True, f"User logged in with token: {self.auth_token[:20]}...")
                    return True
                
        except Exception as e:
            self.log_test_result("Authentication", False, f"Authentication error: {e}")
            
        return False

    def test_enhanced_feed_api(self) -> bool:
        """Test enhanced feed API with pagination and filtering"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Test basic feed fetch
            response = requests.get(f"{self.api_url}/feed", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has new enhanced format
                if isinstance(data, dict) and 'posts' in data and 'metadata' in data:
                    posts = data['posts']
                    metadata = data['metadata']
                    
                    self.log_test_result("Enhanced Feed Format", True, 
                                       f"Found {len(posts)} posts with enhanced metadata")
                    
                    # Validate post structure
                    if posts and len(posts) > 0:
                        sample_post = posts[0]
                        required_fields = ['id', 'username', 'zodiac', 'type', 'content', 
                                         'created_at', 'engagement_data', 'cosmic_tags']
                        
                        missing_fields = [field for field in required_fields if field not in sample_post]
                        
                        if not missing_fields:
                            self.log_test_result("Post Structure Validation", True, 
                                               "All required fields present in posts")
                        else:
                            self.log_test_result("Post Structure Validation", False, 
                                               f"Missing fields: {missing_fields}")
                        
                        # Test engagement data structure
                        engagement = sample_post.get('engagement_data', {})
                        if 'cosmic_energy' in engagement and 'zodiac_reactions' in engagement:
                            self.log_test_result("Engagement Data Structure", True, 
                                               f"Cosmic energy: {engagement['cosmic_energy']}")
                        else:
                            self.log_test_result("Engagement Data Structure", False, 
                                               "Missing cosmic energy or zodiac reactions")
                    
                    return True
                    
                elif isinstance(data, list):
                    # Old format - still functional but not enhanced
                    self.log_test_result("Enhanced Feed Format", False, 
                                       "Received old feed format - enhancement needed")
                    return False
                    
            else:
                self.log_test_result("Enhanced Feed API", False, 
                                   f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test_result("Enhanced Feed API", False, f"API error: {e}")
            
        return False

    def test_advanced_filtering(self) -> bool:
        """Test advanced filtering parameters"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Test zodiac filtering
            params = {'zodiac_filter': 'Scorpio,Leo,Aries'}
            response = requests.get(f"{self.api_url}/feed", headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'posts' in data:
                    posts = data['posts']
                    filtered_zodiacs = set(post['zodiac'] for post in posts)
                    expected_zodiacs = {'Scorpio', 'Leo', 'Aries'}
                    
                    if filtered_zodiacs.issubset(expected_zodiacs):
                        self.log_test_result("Zodiac Filtering", True, 
                                           f"Filtered to zodiacs: {filtered_zodiacs}")
                    else:
                        self.log_test_result("Zodiac Filtering", False, 
                                           f"Unexpected zodiacs: {filtered_zodiacs}")
            
            # Test content type filtering
            params = {'content_types': 'tarot_reading,cosmic_insight'}
            response = requests.get(f"{self.api_url}/feed", headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'posts' in data:
                    posts = data['posts']
                    content_types = set(post['type'] for post in posts)
                    expected_types = {'tarot_reading', 'cosmic_insight'}
                    
                    if content_types.issubset(expected_types):
                        self.log_test_result("Content Type Filtering", True, 
                                           f"Filtered to types: {content_types}")
                    else:
                        self.log_test_result("Content Type Filtering", False, 
                                           f"Unexpected types: {content_types}")
            
            # Test sorting
            params = {'sort_by': 'cosmic_energy'}
            response = requests.get(f"{self.api_url}/feed", headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                self.log_test_result("Cosmic Energy Sorting", True, "Sorting parameter accepted")
            else:
                self.log_test_result("Cosmic Energy Sorting", False, f"HTTP {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test_result("Advanced Filtering", False, f"Filtering error: {e}")
            
        return False

    def test_zodiac_social_actions(self) -> bool:
        """Test enhanced zodiac-specific social actions"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Get a test post ID first
            response = requests.get(f"{self.api_url}/feed?limit=1", headers=headers, timeout=15)
            if response.status_code != 200:
                self.log_test_result("Social Actions Setup", False, "Could not fetch test post")
                return False
                
            data = response.json()
            posts = data.get('posts', []) if isinstance(data, dict) else data
            
            if not posts:
                self.log_test_result("Social Actions Setup", False, "No posts available for testing")
                return False
                
            test_post_id = posts[0]['id']
            
            # Test each social action
            actions_tested = 0
            actions_successful = 0
            
            for action in self.social_actions:
                try:
                    action_data = {
                        'action': f"scorpio_{action}",
                        'post_id': test_post_id,
                        'action_text': f"Scorpio {action.title()}",
                        'zodiac_context': {
                            'post_zodiac': 'Leo',
                            'cosmic_compatibility': 0.6
                        }
                    }
                    
                    if action == 'comment':
                        action_data['comment_text'] = f"Scorpio cosmic insight about this {action}"
                    
                    response = requests.post(f"{self.api_url}/social-actions", 
                                           json=action_data, headers=headers, timeout=10)
                    
                    actions_tested += 1
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        # Check enhanced response format
                        expected_fields = ['success', 'action_id', 'cosmic_impact', 'action_effects', 
                                         'points_awarded', 'zodiac_resonance']
                        
                        missing_fields = [field for field in expected_fields if field not in result]
                        
                        if not missing_fields:
                            actions_successful += 1
                            cosmic_impact = result.get('cosmic_impact', 0)
                            self.log_test_result(f"Zodiac Action: {action}", True, 
                                               f"Cosmic impact: {cosmic_impact}")
                        else:
                            self.log_test_result(f"Zodiac Action: {action}", False, 
                                               f"Missing response fields: {missing_fields}")
                    else:
                        self.log_test_result(f"Zodiac Action: {action}", False, 
                                           f"HTTP {response.status_code}: {response.text}")
                        
                except Exception as e:
                    self.log_test_result(f"Zodiac Action: {action}", False, f"Action error: {e}")
                    
            # Summary
            success_rate = actions_successful / actions_tested if actions_tested > 0 else 0
            self.log_test_result("Social Actions Summary", success_rate >= 0.8, 
                               f"{actions_successful}/{actions_tested} actions successful")
            
            return success_rate >= 0.8
            
        except Exception as e:
            self.log_test_result("Zodiac Social Actions", False, f"Social actions error: {e}")
            
        return False

    def test_infinite_scroll_pagination(self) -> bool:
        """Test infinite scroll pagination"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Test first page
            response1 = requests.get(f"{self.api_url}/feed?limit=5&offset=0", headers=headers, timeout=15)
            if response1.status_code != 200:
                self.log_test_result("Pagination - First Page", False, f"HTTP {response1.status_code}")
                return False
                
            data1 = response1.json()
            posts1 = data1.get('posts', []) if isinstance(data1, dict) else data1
            
            # Test second page
            response2 = requests.get(f"{self.api_url}/feed?limit=5&offset=5", headers=headers, timeout=15)
            if response2.status_code != 200:
                self.log_test_result("Pagination - Second Page", False, f"HTTP {response2.status_code}")
                return False
                
            data2 = response2.json()
            posts2 = data2.get('posts', []) if isinstance(data2, dict) else data2
            
            # Check for different content
            ids1 = set(post['id'] for post in posts1)
            ids2 = set(post['id'] for post in posts2)
            
            if len(ids1 & ids2) == 0:  # No overlap
                self.log_test_result("Infinite Scroll Pagination", True, 
                                   f"Page 1: {len(posts1)} posts, Page 2: {len(posts2)} posts, no overlap")
                return True
            else:
                overlap = len(ids1 & ids2)
                self.log_test_result("Infinite Scroll Pagination", False, 
                                   f"Found {overlap} duplicate posts between pages")
                
        except Exception as e:
            self.log_test_result("Infinite Scroll Pagination", False, f"Pagination error: {e}")
            
        return False

    def test_cosmic_energy_calculations(self) -> bool:
        """Test cosmic energy calculation accuracy"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Fetch posts and analyze cosmic energy distribution
            response = requests.get(f"{self.api_url}/feed?limit=20", headers=headers, timeout=15)
            if response.status_code != 200:
                return False
                
            data = response.json()
            posts = data.get('posts', []) if isinstance(data, dict) else data
            
            cosmic_energies = []
            post_types = set()
            
            for post in posts:
                engagement = post.get('engagement_data', {})
                cosmic_energy = engagement.get('cosmic_energy', 0)
                post_type = post.get('type', 'unknown')
                
                cosmic_energies.append(cosmic_energy)
                post_types.add(post_type)
            
            if cosmic_energies:
                avg_energy = sum(cosmic_energies) / len(cosmic_energies)
                min_energy = min(cosmic_energies)
                max_energy = max(cosmic_energies)
                
                # Validate energy ranges (should be 10-100)
                valid_range = all(10 <= energy <= 100 for energy in cosmic_energies)
                
                self.log_test_result("Cosmic Energy Calculations", valid_range, 
                                   f"Avg: {avg_energy:.1f}, Range: {min_energy}-{max_energy}, Types: {len(post_types)}")
                return valid_range
                
        except Exception as e:
            self.log_test_result("Cosmic Energy Calculations", False, f"Energy calculation error: {e}")
            
        return False

    def test_multi_zodiac_support(self) -> bool:
        """Test multi-zodiac system integration"""
        try:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            
            # Fetch posts and check zodiac variety
            response = requests.get(f"{self.api_url}/feed?limit=30", headers=headers, timeout=15)
            if response.status_code != 200:
                return False
                
            data = response.json()
            posts = data.get('posts', []) if isinstance(data, dict) else data
            
            western_zodiacs = set()
            chinese_zodiacs = set()
            vedic_zodiacs = set()
            
            for post in posts:
                zodiac_signs = post.get('zodiac_signs', {})
                
                if zodiac_signs:
                    western = zodiac_signs.get('western')
                    chinese = zodiac_signs.get('chinese')
                    vedic = zodiac_signs.get('vedic')
                    
                    if western:
                        western_zodiacs.add(western)
                    if chinese:
                        chinese_zodiacs.add(chinese)
                    if vedic:
                        vedic_zodiacs.add(vedic)
            
            # Check variety across systems
            western_variety = len(western_zodiacs) >= 5  # At least 5 different Western signs
            chinese_variety = len(chinese_zodiacs) >= 3  # At least 3 different Chinese signs
            vedic_support = len(vedic_zodiacs) >= 3     # At least 3 Vedic signs
            
            self.log_test_result("Multi-Zodiac Support", 
                               western_variety and chinese_variety and vedic_support,
                               f"Western: {len(western_zodiacs)}, Chinese: {len(chinese_zodiacs)}, Vedic: {len(vedic_zodiacs)}")
            
            return western_variety and chinese_variety and vedic_support
            
        except Exception as e:
            self.log_test_result("Multi-Zodiac Support", False, f"Multi-zodiac error: {e}")
            
        return False

    def test_real_time_features(self) -> bool:
        """Test WebSocket real-time functionality (basic connectivity)"""
        try:
            # Simple WebSocket connection test
            ws_connected = False
            
            def on_open(ws):
                nonlocal ws_connected
                ws_connected = True
                ws.close()
            
            def on_error(ws, error):
                pass
            
            # Try WebSocket connection
            try:
                ws = websocket.WebSocketApp(self.ws_url,
                                          on_open=on_open,
                                          on_error=on_error)
                ws.run_forever(timeout=5)
                
                if ws_connected:
                    self.log_test_result("Real-time WebSocket Connection", True, "WebSocket connection successful")
                    return True
                else:
                    self.log_test_result("Real-time WebSocket Connection", False, "WebSocket connection failed")
                    
            except Exception as ws_error:
                self.log_test_result("Real-time WebSocket Connection", False, f"WebSocket error: {ws_error}")
                
        except Exception as e:
            self.log_test_result("Real-time Features", False, f"Real-time test error: {e}")
            
        return False

    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Categorize tests
        categories = {
            'Authentication': [],
            'Feed API': [],
            'Social Actions': [],
            'System Features': [],
            'Real-time': []
        }
        
        for result in self.test_results:
            test_name = result['test_name']
            if 'auth' in test_name.lower() or 'login' in test_name.lower() or 'register' in test_name.lower():
                categories['Authentication'].append(result)
            elif 'feed' in test_name.lower() or 'filter' in test_name.lower() or 'pagination' in test_name.lower():
                categories['Feed API'].append(result)
            elif 'action' in test_name.lower() or 'zodiac' in test_name.lower():
                categories['Social Actions'].append(result)
            elif 'websocket' in test_name.lower() or 'real-time' in test_name.lower():
                categories['Real-time'].append(result)
            else:
                categories['System Features'].append(result)
        
        report = {
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': failed_tests,
                'success_rate': round(success_rate, 1),
                'test_completion_time': datetime.now(timezone.utc).isoformat()
            },
            'categories': categories,
            'detailed_results': self.test_results,
            'system_status': {
                'unified_feed_ready': success_rate >= 80,
                'production_ready': success_rate >= 90,
                'critical_issues': failed_tests,
                'recommendations': self.generate_recommendations()
            }
        }
        
        return report

    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        failed_tests = [result for result in self.test_results if not result['success']]
        
        for failed_test in failed_tests:
            test_name = failed_test['test_name']
            
            if 'Enhanced Feed' in test_name:
                recommendations.append("Implement enhanced feed API with metadata and cosmic energy calculations")
            elif 'Social Actions' in test_name:
                recommendations.append("Complete zodiac-specific social actions with cosmic impact calculations")
            elif 'Filtering' in test_name:
                recommendations.append("Add advanced filtering parameters (zodiac, content type, energy level)")
            elif 'Pagination' in test_name:
                recommendations.append("Fix infinite scroll pagination to prevent duplicate posts")
            elif 'WebSocket' in test_name:
                recommendations.append("Set up WebSocket server for real-time updates")
            elif 'Multi-Zodiac' in test_name:
                recommendations.append("Expand zodiac system support beyond Western signs")
        
        if not recommendations:
            recommendations.append("All core features implemented successfully - ready for production deployment")
        
        return recommendations

    async def run_all_tests(self):
        """Run complete validation test suite"""
        logger.info("🌟 Starting Complete Social Feed System Validation")
        logger.info("=" * 60)
        
        # Authentication
        auth_success = self.authenticate_test_user()
        if not auth_success:
            logger.error("❌ Authentication failed - cannot proceed with API tests")
            return self.generate_comprehensive_report()
        
        # Core API Tests
        logger.info("\n🔍 Testing Enhanced Feed API...")
        self.test_enhanced_feed_api()
        
        logger.info("\n🎛️ Testing Advanced Filtering...")
        self.test_advanced_filtering()
        
        logger.info("\n⚡ Testing Zodiac Social Actions...")
        self.test_zodiac_social_actions()
        
        logger.info("\n📜 Testing Infinite Scroll Pagination...")
        self.test_infinite_scroll_pagination()
        
        logger.info("\n✨ Testing Cosmic Energy Calculations...")
        self.test_cosmic_energy_calculations()
        
        logger.info("\n🌌 Testing Multi-Zodiac Support...")
        self.test_multi_zodiac_support()
        
        logger.info("\n🔄 Testing Real-time Features...")
        self.test_real_time_features()
        
        # Generate final report
        report = self.generate_comprehensive_report()
        
        logger.info("\n" + "=" * 60)
        logger.info("🎯 VALIDATION COMPLETE")
        logger.info("=" * 60)
        logger.info(f"📊 Success Rate: {report['summary']['success_rate']}%")
        logger.info(f"✅ Passed: {report['summary']['passed_tests']}")
        logger.info(f"❌ Failed: {report['summary']['failed_tests']}")
        
        if report['system_status']['unified_feed_ready']:
            logger.info("🚀 Complete Social Feed System: READY FOR DEPLOYMENT")
        else:
            logger.info("⚠️ Complete Social Feed System: NEEDS IMPROVEMENTS")
            
        logger.info("\n📋 Recommendations:")
        for i, rec in enumerate(report['system_status']['recommendations'], 1):
            logger.info(f"   {i}. {rec}")
        
        return report


def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Complete Social Feed System Validation')
    parser.add_argument('--url', default='http://localhost:5000', 
                       help='Base URL for the backend API (default: http://localhost:5000)')
    parser.add_argument('--output', default='validation_report.json',
                       help='Output file for detailed report (default: validation_report.json)')
    
    args = parser.parse_args()
    
    # Run validation
    validator = CompleteSocialFeedValidator(args.url)
    
    try:
        report = asyncio.run(validator.run_all_tests())
        
        # Save detailed report
        with open(args.output, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"\n📄 Detailed report saved to: {args.output}")
        
        # Exit with appropriate code
        if report['system_status']['unified_feed_ready']:
            exit(0)  # Success
        else:
            exit(1)  # Needs improvements
            
    except KeyboardInterrupt:
        logger.info("\n⏹️ Validation interrupted by user")
        exit(130)
    except Exception as e:
        logger.error(f"\n💥 Validation failed with error: {e}")
        exit(1)


if __name__ == "__main__":
    main()