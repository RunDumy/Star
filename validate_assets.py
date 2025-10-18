#!/usr/bin/env python3
"""
Script to validate that all uploaded Icons8 assets are accessible via Supabase Storage URLs
"""

import json
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

# List of asset URLs to test
ASSET_URLS = [
    # Zodiac signs (Western) - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-aquarius-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-aries-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-cancer-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-capricorn-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-gemini-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-leo-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-libra-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-pisces-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-sagittarius-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-scorpio-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-taurus-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-virgo-100.png",

    # Zodiac signs (Western) - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-aquarius-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-aries-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-cancer-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-capricorn-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-gemini-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-leo-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-libra-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-pisces-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-sagittarius-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-scorpio-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-taurus-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-virgo-50.png",

    # Planetary symbols - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-jupiter-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-mars-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-mercury-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-neptune-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-pluto-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-saturn-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-sun-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-uranus-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-venus-symbol-100.png",

    # Planetary symbols - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-jupiter-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-mars-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-mercury-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-neptune-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-pluto-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-saturn-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-sun-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-uranus-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-venus-symbol-50.png",

    # Elements - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-air-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-earth-element-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-earth-symbol-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-fire-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-water-element-100.png",

    # Elements - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-air-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-earth-element-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-earth-symbol-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-fire-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-water-element-50.png",

    # Chinese zodiac - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-dog-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-dragon-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-goat-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-horse-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-monkey-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-ox-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-pig-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rabbit-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rat-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rooster-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-snake-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-tiger-100.png",

    # Chinese zodiac - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-dog-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-dragon-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-goat-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-horse-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-monkey-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-ox-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-pig-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rabbit-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rat-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-rooster-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-snake-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-year-of-tiger-50.png",

    # Moon phases - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-crescent-moon-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-first-quarter-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-full-moon-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-last-quarter-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-and-stars-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-phase-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-new-moon-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waning-crescent-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waning-gibbous-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waxing-crescent-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waxing-gibbous-100.png",

    # Moon phases - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-crescent-moon-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-first-quarter-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-full-moon-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-last-quarter-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-and-stars-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-moon-phase-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-new-moon-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waning-crescent-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waning-gibbous-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waxing-crescent-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-waxing-gibbous-50.png",

    # Seasons - 100px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-autumn-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-spring-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-summer-100.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-winter-100.png",

    # Seasons - 50px
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-autumn-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-spring-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-summer-50.png",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/icons8-winter-50.png",

    # Blank tarot card
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/blank_tarot.png",

    # Sound effects (MP3)
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/bubble-pop-04-323580.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-axe-throw-389751.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-bamboo-389752.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-dark-tension-386134.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-door-388765.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-flame-388763.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-motion-3-390710.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-sound-effect-240257.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-torch-2-388764.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-truck-2-386138.mp3",
    "https://your-project-ref.supabase.co/storage/v1/object/public/assets/whoosh-velocity-383019.mp3"
]

def test_asset_url(url):
    """Test if an asset URL is accessible"""
    try:
        response = requests.head(url, timeout=10)
        return {
            'url': url,
            'status_code': response.status_code,
            'accessible': response.status_code == 200,
            'content_type': response.headers.get('content-type', 'unknown')
        }
    except requests.RequestException as e:
        return {
            'url': url,
            'status_code': None,
            'accessible': False,
            'error': str(e)
        }

def main():
    print("🔍 Validating Supabase Storage Asset URLs...")
    print(f"Testing {len(ASSET_URLS)} asset URLs...\n")

    results = []
    accessible_count = 0

    # Test URLs concurrently for speed
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(test_asset_url, url): url for url in ASSET_URLS}

        for future in as_completed(future_to_url):
            result = future.result()
            results.append(result)

            if result['accessible']:
                accessible_count += 1
                print(f"✅ {result['url'].split('/')[-1]} - OK ({result['content_type']})")
            else:
                print(f"❌ {result['url'].split('/')[-1]} - FAILED ({result.get('status_code', 'ERROR')})")
                if 'error' in result:
                    print(f"   Error: {result['error']}")

    print(f"\n📊 Results: {accessible_count}/{len(ASSET_URLS)} assets accessible")

    if accessible_count == len(ASSET_URLS):
        print("🎉 All assets are accessible!")
        return True
    else:
        print("⚠️  Some assets are not accessible. Check the failed URLs above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
