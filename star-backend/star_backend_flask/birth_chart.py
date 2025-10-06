import datetime
import os
import zoneinfo
from typing import Dict, List, Optional

import swisseph as swe
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
from geopy.geocoders import Nominatim

# Initialize Swiss Ephemeris with the ephemeris file path if needed
# swe.set_ephe_path(os.path.join(os.path.dirname(__file__), 'ephem'))

class BirthChartCalculator:
    """Class for calculating birth charts using Swiss Ephemeris"""

    # Zodiac signs in order
    ZODIAC_SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    def __init__(self):
        self.geolocator = Nominatim(user_agent="star_app_birth_chart")

    def geocode_location(self, location_str: str) -> Optional[Dict]:
        """
        Geocode a location string to latitude and longitude coordinates.

        Args:
            location_str: Location string like "New York, NY" or "Tokyo, Japan"

        Returns:
            Dict with 'lat', 'lng', 'addr' keys, or None if geocoding fails
        """
        try:
            location = self.geolocator.geocode(location_str, timeout=10)
            if location:
                return {
                    'lat': location.latitude,
                    'lng': location.longitude,
                    'addr': location.address
                }
            return None
        except (GeocoderTimedOut, GeocoderUnavailable) as e:
            print(f"Geocoding error for {location_str}: {e}")
            return None

    def _julian_day(self, dt: datetime.datetime, timezone_offset: float = 0) -> float:
        """
        Calculate Julian Day number for a given datetime.

        Args:
            dt: Python datetime object
            timezone_offset: Hours offset from UTC (e.g., -5 for EST)

        Returns:
            Julian Day number as float
        """
        # Convert to UTC
        utc_dt = dt - datetime.timedelta(hours=timezone_offset)

        # Calculate Julian Day
        a = (14 - utc_dt.month) // 12
        y = utc_dt.year + 4800 - a
        m = utc_dt.month + 12 * a - 3

        jd = utc_dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

        # Add fractional day
        jd += (utc_dt.hour - 12) / 24.0 + utc_dt.minute / 1440.0 + utc_dt.second / 86400.0

        return jd

    def _get_zodiac_sign(self, longitude: float) -> str:
        """
        Get zodiac sign name from longitude.

        Args:
            longitude: Planetary longitude in degrees (0-360)

        Returns:
            Zodiac sign name
        """
        sign_index = int(longitude // 30) % 12
        return self.ZODIAC_SIGNS[sign_index]

    def _get_house_position(self, longitude: float, cusps: List[float]) -> int:
        """
        Determine which house a planet is in based on longitude and house cusps.

        Args:
            longitude: Planetary longitude in degrees
            cusps: House cusp longitudes [asc, 2nd, 3rd, ..., 12th]

        Returns:
            House number (1-12)
        """
        # Normalize longitude to 0-360 range
        lon = longitude % 360

        for i in range(12):
            cusp = cusps[i]
            next_cusp = cusps[(i + 1) % 12]

            # Handle case where cusps wrap around 360/0
            if cusp <= next_cusp:
                if cusp <= lon < next_cusp:
                    return i + 1
            else:  # cusps wrap around
                if cusp <= lon or lon < next_cusp:
                    return i + 1

        return 1  # Default to 1st house

    def calculate_birth_chart(self, birth_date: datetime.date, birth_time: str, location: str) -> Optional[Dict]:
        """
        Calculate complete birth chart data.

        Args:
            birth_date: Birth date as date object
            birth_time: Birth time as "HH:MM" string
            location: Birth location string

        Returns:
            Birth chart data dict or None if calculation fails
        """
        try:
            # Parse birth time
            time_parts = birth_time.split(':')
            if len(time_parts) != 2:
                raise ValueError("Invalid time format. Use HH:MM")

            hour = int(time_parts[0])
            minute = int(time_parts[1])

            if not (0 <= hour <= 23) or not (0 <= minute <= 59):
                raise ValueError("Invalid time values")

            # Create datetime object
            birth_dt = datetime.datetime.combine(birth_date, datetime.time(hour, minute))

            # Geocode location
            geo_data = self.geocode_location(location)
            if not geo_data:
                raise ValueError(f"Could not geocode location: {location}")

            latitude = geo_data['lat']
            longitude = geo_data['lng']

            # Calculate Julian Day
            jd = self._julian_day(birth_dt)

            # Set geographic position for house calculation
            swe.set_topo(longitude, latitude, 0)  # Altitude = 0 for simplicity

            # Calculate Ascendant and house cusps (Placidus system)
            houses, asc = swe.houses(jd, latitude, longitude, b'P')
            asc_longitude = asc[0]  # Ascendant longitude

            # Planets to calculate (subset for basic chart)
            planets = {
                'sun': swe.SUN,
                'moon': swe.MOON,
                'ascendant': None  # Special case
            }

            result = {
                'sun': None,
                'moon': None,
                'ascendant': None,
                'houses': list(houses),  # Convert to list instead of tolist()
                'calculated_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

            # Calculate planetary positions
            for planet_name, planet_id in planets.items():
                if planet_id is not None:  # Not ascendant
                    # Calculate position
                    pos_data = swe.calc(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SPEED)
                    longitude_deg = pos_data[0][0] % 360  # Normalize to 0-360

                    # Get zodiac sign
                    sign = self._get_zodiac_sign(longitude_deg)

                    # Get house position
                    house = self._get_house_position(longitude_deg, houses)

                    result[planet_name] = {
                        'position': round(longitude_deg, 2),
                        'sign': sign,
                        'house': house
                    }

            # Handle ascendant specially
            sign = self._get_zodiac_sign(asc_longitude)
            house = 1  # Ascendant is always in 1st house

            result['ascendant'] = {
                'position': round(asc_longitude, 2),
                'sign': sign,
                'house': house
            }

            return result

        except Exception as e:
            print(f"Error calculating birth chart: {e}")
            return None


# Global calculator instance
calculator = BirthChartCalculator()


def calculate_birth_chart(birth_date: datetime.date, birth_time: str, location: str) -> Optional[Dict]:
    """
    Convenience function to calculate birth chart using global calculator.

    Args:
        birth_date: Birth date
        birth_time: Birth time as HH:MM
        location: Birth location

    Returns:
        Birth chart data dict or None
    """
    return calculator.calculate_birth_chart(birth_date, birth_time, location)


def geocode_location(location_str: str) -> Optional[Dict]:
    """
    Convenience function for geocoding.

    Args:
        location_str: Location string

    Returns:
        Geocode result dict or None
    """
    return calculator.geocode_location(location_str)
