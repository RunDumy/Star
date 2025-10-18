#!/usr/bin/env python3
"""
STAR Platform: Enhanced Occult Oracle AI Engine
Integrates precision lunar calculations and archetypal mentors with core astrology
"""

import datetime
import logging
from dataclasses import asdict
from typing import Dict, Optional

from enhanced_archetypal_mentors import ArchetypalMentorRegistry
from enhanced_lunar_engine import EnhancedLunarEngine
from oracle_engine_enhanced import OccultOracleEngine


class EnhancedOccultOracleEngine(OccultOracleEngine):
    """Enhanced oracle engine with lunar precision and archetypal mentors"""

    def __init__(self, cosmos_db_helper=None, ai_client=None):
        super().__init__()
        self.cosmos_db = cosmos_db_helper
        self.ai_client = ai_client
        self.lunar_engine = EnhancedLunarEngine(self)
        self.mentor_registry = ArchetypalMentorRegistry(self)
        self.logger = logging.getLogger(__name__)

    def get_comprehensive_lunar_guidance(self, date: datetime.datetime = None) -> Dict:
        """Get enhanced lunar guidance with mansion influences"""
        return self.lunar_engine.get_lunar_guidance_enhanced(date)

    def get_archetypal_mentor_guidance(self, user_id: str, question: str,
                                     user_data: Dict = None) -> Dict:
        """Get personalized guidance from archetypal mentor"""
        try:
            # Get user data if not provided
            if not user_data:
                user_data = self._get_user_data(user_id)

            # Get current lunar data
            lunar_data = self.lunar_engine.calculate_precision_moon_data()

            # Assign optimal mentor
            mentor = self.mentor_registry.assign_mentor(user_data, lunar_data)

            # Generate guidance
            guidance = mentor.generate_guidance(question, lunar_data)

            # Save to database if available
            if self.cosmos_db:
                self._save_mentor_session(user_id, guidance)

            return guidance

        except Exception as e:
            self.logger.error(f"Mentor guidance error: {e}")
            return self._get_fallback_guidance(question)

    def _get_user_data(self, user_id: str) -> Dict:
        """Get user's astrological and numerological data"""
        try:
            if self.cosmos_db:
                # Try to get from database
                user_profile = self.cosmos_db.get_item("profiles", user_id)
                if user_profile:
                    return {
                        "user_id": user_id,
                        "natal_chart": user_profile.get("natal_chart"),
                        "numerology": user_profile.get("numerology", {})
                    }
        except Exception as e:
            self.logger.error(f"Database user data retrieval error: {e}")

        # Return minimal data if database unavailable
        return {
            "user_id": user_id,
            "numerology": {"life_path": 7}  # Default
        }

    def _save_mentor_session(self, user_id: str, guidance: Dict):
        """Save mentor session to database"""
        try:
            if self.cosmos_db:
                session_data = {
                    "id": f"{user_id}_{guidance['timestamp'].isoformat()}",
                    "user_id": user_id,
                    "mentor_name": guidance["mentor"],
                    "question": guidance.get("question", ""),
                    "response": guidance["response"],
                    "mood": guidance["mood"],
                    "lunar_influence": guidance["lunar_influence"],
                    "timestamp": guidance["timestamp"].isoformat()
                }
                self.cosmos_db.upsert_item("mentor_sessions", session_data)
        except Exception as e:
            self.logger.error(f"Failed to save mentor session: {e}")

    def _get_fallback_guidance(self, question: str) -> Dict:
        """Get fallback guidance when mentor system fails"""
        return {
            "mentor": "Cosmic Guide",
            "archetype": "Universal Wisdom",
            "mood": "inspirational",
            "response": "Trust in the cosmic flow. The universe has a plan for you.",
            "lunar_influence": "",
            "symbolic_animal": "Starry Wisdom",
            "elemental_affirmation": "I am connected to universal wisdom.",
            "ritual_suggestion": "Take a moment to breathe deeply and center yourself.",
            "timestamp": datetime.datetime.now()
        }

    def create_enhanced_oracle_session(self, user_id: str, name: str,
                                     birth_date: datetime.datetime,
                                     birth_place: str, question: str = "") -> Dict:
        """Create enhanced oracle session with lunar and mentor integration"""
        try:
            # Get basic natal chart
            natal_chart = self.calculate_natal_chart(birth_date, birth_place)

            # Calculate numerology
            numerology = self.calculate_numerology(name, birth_date)

            # Get enhanced lunar data
            lunar_guidance = self.get_comprehensive_lunar_guidance()

            # Get user data for mentor assignment
            user_data = {
                "natal_chart": natal_chart,
                "numerology": numerology
            }

            # Get archetypal mentor guidance
            mentor_guidance = self.get_archetypal_mentor_guidance(user_id, question, user_data)

            # Create comprehensive session
            session = {
                "session_id": f"{user_id}_{datetime.datetime.now().isoformat()}",
                "user_id": user_id,
                "name": name,
                "birth_date": birth_date.isoformat(),
                "birth_place": birth_place,
                "question": question,
                "natal_chart": asdict(natal_chart),
                "numerology": numerology,
                "enhanced_lunar_guidance": lunar_guidance,
                "archetypal_mentor": mentor_guidance,
                "cosmic_signature": self._generate_cosmic_signature(natal_chart, lunar_guidance),
                "multi_zodiac_insights": self._calculate_multi_zodiac_insights(natal_chart),
                "created_at": datetime.datetime.now().isoformat()
            }

            # Save session to database if available
            if self.cosmos_db:
                self._save_oracle_session(session)

            return session

        except Exception as e:
            self.logger.error(f"Enhanced oracle session creation error: {e}")
            # Fallback to basic session
            return self._create_basic_session(user_id, name, birth_date, birth_place, question)

    def _generate_cosmic_signature(self, natal_chart, lunar_guidance: Dict) -> str:
        """Generate cosmic signature combining all systems"""
        sun_sign = natal_chart.sun.zodiac_sign.value[0]
        life_path = self.calculate_numerology("", natal_chart.sun.longitude).get('life_path', 1)
        moon_mansion = lunar_guidance.get('moon_mansion', 'Unknown')

        return f"Solar {sun_sign} × Path {life_path} × Lunar {moon_mansion}"

    def _calculate_multi_zodiac_insights(self, natal_chart) -> Dict:
        """Calculate insights across multiple zodiac traditions"""
        # This would integrate with a multi-zodiac calculator
        # For now, return basic insights
        return {
            "western_zodiac": natal_chart.sun.zodiac_sign.value[0],
            "chinese_zodiac": "Dragon",  # Placeholder
            "vedic_zodiac": "Leo",  # Placeholder
            "galactic_tone": 7,  # Placeholder
            "elemental_balance": "Fire dominant"
        }

    def _save_oracle_session(self, session: Dict):
        """Save oracle session to database"""
        try:
            if self.cosmos_db:
                self.cosmos_db.upsert_item("oracle_sessions", session)
        except Exception as e:
            self.logger.error(f"Failed to save oracle session: {e}")

    def _create_basic_session(self, user_id: str, name: str, birth_date: datetime.datetime,
                            birth_place: str, question: str) -> Dict:
        """Create basic session as fallback"""
        return {
            "session_id": f"{user_id}_{datetime.datetime.now().isoformat()}",
            "user_id": user_id,
            "name": name,
            "birth_date": birth_date.isoformat(),
            "birth_place": birth_place,
            "question": question,
            "error": "Enhanced features unavailable",
            "created_at": datetime.datetime.now().isoformat()
        }

    def get_daily_cosmic_guidance(self, user_id: str) -> Dict:
        """Get comprehensive daily cosmic guidance"""
        try:
            # Get lunar guidance
            lunar_guidance = self.get_comprehensive_lunar_guidance()

            # Get user data
            user_data = self._get_user_data(user_id)

            # Get mentor guidance for the day
            daily_question = "What guidance do you have for me today?"
            mentor_guidance = self.get_archetypal_mentor_guidance(user_id, daily_question, user_data)

            # Get astrological transits (simplified)
            transits = self._calculate_daily_transits()

            return {
                "date": datetime.datetime.now().date().isoformat(),
                "lunar_guidance": lunar_guidance,
                "mentor_guidance": mentor_guidance,
                "astrological_transits": transits,
                "cosmic_weather": self._generate_daily_cosmic_weather(lunar_guidance, transits)
            }

        except Exception as e:
            self.logger.error(f"Daily guidance error: {e}")
            return {"error": "Unable to generate daily guidance"}

    def _calculate_daily_transits(self) -> Dict:
        """Calculate daily astrological transits"""
        # Simplified transit calculation
        return {
            "sun_sign": "Current sun sign",
            "moon_sign": "Current moon sign",
            "active_planets": ["Sun", "Moon"],
            "transit_summary": "Harmonious day for new beginnings"
        }

    def _generate_daily_cosmic_weather(self, lunar_guidance: Dict, transits: Dict) -> str:
        """Generate poetic daily cosmic weather report"""
        phase = lunar_guidance.get('moon_phase', 'unknown')
        mansion = lunar_guidance.get('moon_mansion', 'unknown')

        weather_report = f"Today's cosmic weather: {phase} Moon in {mansion}. "
        weather_report += transits.get('transit_summary', 'A day of cosmic alignment.')

        return weather_report