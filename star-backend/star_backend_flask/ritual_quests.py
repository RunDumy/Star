#!/usr/bin/env python3
"""
STAR Platform: Ritual Quests System
Lunar cycle quests, elemental sequences, and mythological archetypes
"""

import random
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from archetypal_mentors import ArchetypalMentorsSystem
from lunar_calculations import LunarCalculations


@dataclass
class QuestStep:
    """Individual step in a ritual quest"""
    id: str
    title: str
    description: str
    action_type: str  # 'meditation', 'journaling', 'ritual', 'social_action', 'creative'
    duration_minutes: int
    lunar_phase_required: Optional[str] = None
    elemental_focus: Optional[str] = None
    completion_criteria: Dict[str, Any] = None
    rewards: Dict[str, Any] = None


@dataclass
class RitualQuest:
    """Complete ritual quest with multiple steps"""
    id: str
    title: str
    description: str
    archetype: str
    element: str
    lunar_cycle: str  # 'new_moon', 'full_moon', 'waxing', 'waning'
    duration_days: int
    steps: List[QuestStep]
    prerequisites: Dict[str, Any] = None
    rewards: Dict[str, Any] = None
    mythological_context: str = ""


class RitualQuestsSystem:
    """System for managing ritual quests and lunar cycle adventures"""

    def __init__(self):
        self.lunar_calc = LunarCalculations()
        self.mentor_system = ArchetypalMentorsSystem()
        self.quests = self._initialize_quests()
        self.active_quests = {}  # user_id -> list of active quests

    def _initialize_quests(self) -> Dict[str, RitualQuest]:
        """Initialize the complete library of ritual quests"""
        quests = {}

        # Lunar Cycle Quests
        quests.update(self._create_lunar_cycle_quests())

        # Elemental Sequence Quests
        quests.update(self._create_elemental_sequence_quests())

        # Archetypal Journey Quests
        quests.update(self._create_archetypal_journey_quests())

        # Seasonal Mythological Quests
        quests.update(self._create_seasonal_mythological_quests())

        return quests

    def _create_lunar_cycle_quests(self) -> Dict[str, RitualQuest]:
        """Create quests aligned with lunar cycles"""
        quests = {}

        # New Moon Intention Quest
        new_moon_quest = RitualQuest(
            id="new_moon_intention_ritual",
            title="Seeds of Destiny",
            description="Plant powerful intentions during the fertile darkness of the new moon",
            archetype="Creator",
            element="earth",
            lunar_cycle="new_moon",
            duration_days=3,
            steps=[
                QuestStep(
                    id="nm1",
                    title="Sacred Space Preparation",
                    description="Create a sacred space for your intention ritual",
                    action_type="ritual",
                    duration_minutes=15,
                    lunar_phase_required="new_moon",
                    elemental_focus="earth",
                    completion_criteria={"space_prepared": True},
                    rewards={"cosmic_energy": 10}
                ),
                QuestStep(
                    id="nm2",
                    title="Intention Crystallization",
                    description="Write down your deepest desires and intentions",
                    action_type="journaling",
                    duration_minutes=20,
                    completion_criteria={"intentions_written": True},
                    rewards={"clarity": 15}
                ),
                QuestStep(
                    id="nm3",
                    title="Energetic Charging",
                    description="Charge your intentions with lunar and elemental energy",
                    action_type="meditation",
                    duration_minutes=10,
                    completion_criteria={"energy_charged": True},
                    rewards={"manifestation_power": 20}
                )
            ],
            rewards={
                "achievement": "New Moon Manifestor",
                "cosmic_energy": 50,
                "badge_unlock": "lunar_creator"
            },
            mythological_context="Like the cosmic egg from which all creation emerges, the new moon holds infinite potential for manifestation."
        )
        quests[new_moon_quest.id] = new_moon_quest

        # Full Moon Release Quest
        full_moon_quest = RitualQuest(
            id="full_moon_release_ritual",
            title="Lunar Liberation",
            description="Release what no longer serves you under the illuminating full moon",
            archetype="Alchemist",
            element="water",
            lunar_cycle="full_moon",
            duration_days=3,
            steps=[
                QuestStep(
                    id="fm1",
                    title="Shadow Inventory",
                    description="Identify patterns, beliefs, and attachments to release",
                    action_type="journaling",
                    duration_minutes=25,
                    lunar_phase_required="full_moon",
                    elemental_focus="water",
                    completion_criteria={"shadows_identified": True},
                    rewards={"self_awareness": 15}
                ),
                QuestStep(
                    id="fm2",
                    title="Release Ceremony",
                    description="Perform a symbolic release ritual",
                    action_type="ritual",
                    duration_minutes=15,
                    completion_criteria={"release_performed": True},
                    rewards={"emotional_freedom": 20}
                ),
                QuestStep(
                    id="fm3",
                    title="Integration Reflection",
                    description="Reflect on the space created by your release",
                    action_type="meditation",
                    duration_minutes=10,
                    completion_criteria={"reflection_complete": True},
                    rewards={"inner_peace": 25}
                )
            ],
            rewards={
                "achievement": "Full Moon Liberator",
                "cosmic_energy": 60,
                "badge_unlock": "lunar_alchemist"
            },
            mythological_context="As the moon reveals the hidden landscape, so too does this ritual illuminate and liberate the soul."
        )
        quests[full_moon_quest.id] = full_moon_quest

        return quests

    def _create_elemental_sequence_quests(self) -> Dict[str, RitualQuest]:
        """Create quests following elemental sequences"""
        quests = {}

        # Fire Initiation Quest
        fire_quest = RitualQuest(
            id="fire_initiation_journey",
            title="Ignite Your Inner Flame",
            description="Begin your elemental journey with the transformative power of fire",
            archetype="Warrior",
            element="fire",
            lunar_cycle="waxing",
            duration_days=7,
            steps=[
                QuestStep(
                    id="f1",
                    title="Spark Discovery",
                    description="Identify the spark of passion within you",
                    action_type="journaling",
                    duration_minutes=15,
                    elemental_focus="fire",
                    completion_criteria={"spark_identified": True},
                    rewards={"passion": 10}
                ),
                QuestStep(
                    id="f2",
                    title="Flame Building",
                    description="Build and nurture your inner fire through action",
                    action_type="creative",
                    duration_minutes=30,
                    completion_criteria={"action_taken": True},
                    rewards={"courage": 15}
                ),
                QuestStep(
                    id="f3",
                    title="Blaze Integration",
                    description="Integrate the fire energy into your daily life",
                    action_type="meditation",
                    duration_minutes=20,
                    completion_criteria={"integration_complete": True},
                    rewards={"transformation": 25}
                )
            ],
            rewards={
                "achievement": "Fire Initiate",
                "elemental_affinity": "fire",
                "badge_unlock": "elemental_fire"
            },
            mythological_context="Like Prometheus stealing fire from the gods, you now carry the divine spark of creation."
        )
        quests[fire_quest.id] = fire_quest

        # Water Flow Quest
        water_quest = RitualQuest(
            id="water_flow_journey",
            title="Flow with Cosmic Tides",
            description="Learn to flow with the emotional and intuitive currents of water",
            archetype="Dreamer",
            element="water",
            lunar_cycle="waning",
            duration_days=7,
            steps=[
                QuestStep(
                    id="w1",
                    title="Emotional Mapping",
                    description="Chart the currents of your emotional landscape",
                    action_type="journaling",
                    duration_minutes=20,
                    elemental_focus="water",
                    completion_criteria={"emotions_mapped": True},
                    rewards={"emotional_intelligence": 15}
                ),
                QuestStep(
                    id="w2",
                    title="Intuitive Listening",
                    description="Practice listening to your inner wisdom",
                    action_type="meditation",
                    duration_minutes=25,
                    completion_criteria={"intuition_practiced": True},
                    rewards={"intuition": 20}
                ),
                QuestStep(
                    id="w3",
                    title="Surrender Flow",
                    description="Learn to surrender and trust the cosmic flow",
                    action_type="ritual",
                    duration_minutes=15,
                    completion_criteria={"surrender_achieved": True},
                    rewards={"trust": 25}
                )
            ],
            rewards={
                "achievement": "Water Weaver",
                "elemental_affinity": "water",
                "badge_unlock": "elemental_water"
            },
            mythological_context="Like the great rivers that carved canyons through stone, your emotions shape your destiny."
        )
        quests[water_quest.id] = water_quest

        return quests

    def _create_archetypal_journey_quests(self) -> Dict[str, RitualQuest]:
        """Create quests based on archetypal journeys"""
        quests = {}

        # Hero's Journey Quest
        hero_quest = RitualQuest(
            id="heroes_journey_archetype",
            title="The Hero's Odyssey",
            description="Embark on the classic hero's journey of transformation",
            archetype="Warrior",
            element="fire",
            lunar_cycle="waxing",
            duration_days=14,
            steps=[
                QuestStep(
                    id="hj1",
                    title="Call to Adventure",
                    description="Recognize and answer your heroic calling",
                    action_type="journaling",
                    duration_minutes=20,
                    completion_criteria={"calling_recognized": True},
                    rewards={"purpose": 15}
                ),
                QuestStep(
                    id="hj2",
                    title="Threshold Crossing",
                    description="Cross the threshold into the unknown",
                    action_type="ritual",
                    duration_minutes=30,
                    completion_criteria={"threshold_crossed": True},
                    rewards={"courage": 20}
                ),
                QuestStep(
                    id="hj3",
                    title="Trials & Tribulations",
                    description="Face and overcome challenges",
                    action_type="creative",
                    duration_minutes=45,
                    completion_criteria={"trials_faced": True},
                    rewards={"resilience": 25}
                ),
                QuestStep(
                    id="hj4",
                    title="Abyss Descent",
                    description="Confront your deepest fears and shadows",
                    action_type="meditation",
                    duration_minutes=40,
                    completion_criteria={"abyss_confronted": True},
                    rewards={"wisdom": 30}
                ),
                QuestStep(
                    id="hj5",
                    title="Transformation",
                    description="Experience profound inner transformation",
                    action_type="ritual",
                    duration_minutes=35,
                    completion_criteria={"transformation_complete": True},
                    rewards={"mastery": 35}
                )
            ],
            rewards={
                "achievement": "Hero's Journey Master",
                "archetype_unlock": "warrior",
                "badge_unlock": "archetypal_hero"
            },
            mythological_context="Following in the footsteps of Odysseus, Gilgamesh, and countless heroes before you."
        )
        quests[hero_quest.id] = hero_quest

        return quests

    def _create_seasonal_mythological_quests(self) -> Dict[str, RitualQuest]:
        """Create quests aligned with seasonal mythological cycles"""
        quests = {}

        # Spring Equinox Quest
        spring_quest = RitualQuest(
            id="spring_equinox_rebirth",
            title="Phoenix Rising",
            description="Rise from the ashes of winter in glorious rebirth",
            archetype="Visionary",
            element="air",
            lunar_cycle="new_moon",
            duration_days=5,
            steps=[
                QuestStep(
                    id="se1",
                    title="Ashes Assessment",
                    description="Take stock of what has been burned away",
                    action_type="journaling",
                    duration_minutes=20,
                    completion_criteria={"assessment_complete": True},
                    rewards={"clarity": 10}
                ),
                QuestStep(
                    id="se2",
                    title="Rebirth Visualization",
                    description="Visualize your emergence in new form",
                    action_type="meditation",
                    duration_minutes=25,
                    completion_criteria={"rebirth_visualized": True},
                    rewards={"vision": 20}
                ),
                QuestStep(
                    id="se3",
                    title="Action Ignition",
                    description="Take the first bold steps of your rebirth",
                    action_type="creative",
                    duration_minutes=30,
                    completion_criteria={"action_taken": True},
                    rewards={"renewal": 25}
                )
            ],
            rewards={
                "achievement": "Phoenix Reborn",
                "seasonal_power": "spring",
                "badge_unlock": "seasonal_phoenix"
            },
            mythological_context="Like the phoenix that regenerates from its own ashes, you emerge renewed and radiant."
        )
        quests[spring_quest.id] = spring_quest

        return quests

    def recommend_quests(self, user_profile: Dict, max_recommendations: int = 3, user_history: Dict = None) -> List[Dict[str, Any]]:
        """Get personalized quest recommendations based on user profile and history"""
        current_lunar = self.lunar_calc.get_lunar_alchemy(datetime.now())
        lunar_phase = current_lunar.get('phase', {}).get('phase', '')

        # Calculate compatibility scores for all quests
        quest_scores = {}
        personalization_factors = {}

        for quest_id, quest in self.quests.items():
            base_score = self._calculate_quest_compatibility(quest, user_profile, lunar_phase)
            personalized_score, factors = self._apply_personalization(quest, user_profile, user_history or {}, lunar_phase)
            final_score = base_score + personalized_score

            quest_scores[quest_id] = final_score
            personalization_factors[quest_id] = factors

        # Sort by compatibility score
        sorted_quests = sorted(quest_scores.items(), key=lambda x: x[1], reverse=True)

        # Return top recommendations with personalization insights
        recommendations = []
        for quest_id, score in sorted_quests[:max_recommendations]:
            quest = self.quests[quest_id]
            factors = personalization_factors[quest_id]

            recommendation = {
                'quest': asdict(quest),
                'compatibility_score': score,
                'personalization_factors': factors,
                'recommended_reason': self._generate_personalized_reason(quest, user_profile, factors, lunar_phase),
                'estimated_completion_time': self._estimate_completion_time(quest, user_profile),
                'success_probability': self._calculate_success_probability(quest, user_profile, factors)
            }

            recommendations.append(recommendation)

        return recommendations

    def _calculate_quest_compatibility(self, quest: RitualQuest, user_profile: Dict, lunar_phase: str) -> float:
        """Calculate how compatible a quest is for the user"""
        score = 0.0

        # Lunar phase alignment (30% weight)
        if quest.lunar_cycle in lunar_phase.lower():
            score += 0.3
        elif self._phases_complement(quest.lunar_cycle, lunar_phase):
            score += 0.2

        # Elemental compatibility (25% weight)
        user_element = user_profile.get('element', '')
        if user_element and user_element == quest.element:
            score += 0.25
        elif self._elements_complement(user_element, quest.element):
            score += 0.15

        # Archetype alignment (25% weight)
        user_archetype = user_profile.get('dominant_archetype', '')
        if user_archetype and user_archetype.lower() == quest.archetype.lower():
            score += 0.25
        elif self._archetypes_complement(user_archetype, quest.archetype):
            score += 0.15

        # Zodiac compatibility (20% weight)
        sun_sign = user_profile.get('sun_sign', '').lower()
        zodiac_alignment = self._calculate_zodiac_quest_alignment(sun_sign, quest)
        score += 0.2 * zodiac_alignment

        return min(1.0, score)

    def _phases_complement(self, quest_phase: str, current_phase: str) -> bool:
        """Check if lunar phases complement each other"""
        complementary_phases = {
            'new_moon': ['waxing_crescent', 'waxing'],
            'waxing': ['first_quarter', 'waxing_gibbous'],
            'full_moon': ['waning_gibbous', 'waning'],
            'waning': ['last_quarter', 'waning_crescent']
        }
        return current_phase.lower() in complementary_phases.get(quest_phase, [])

    def _elements_complement(self, user_element: str, quest_element: str) -> bool:
        """Check elemental complementarity"""
        complementary_elements = {
            'fire': ['air'],
            'air': ['fire'],
            'water': ['earth'],
            'earth': ['water']
        }
        return quest_element in complementary_elements.get(user_element, [])

    def _archetypes_complement(self, user_archetype: str, quest_archetype: str) -> bool:
        """Check archetypal complementarity"""
        complementary_archetypes = {
            'warrior': ['guardian', 'healer'],
            'guardian': ['warrior', 'builder'],
            'messenger': ['seeker', 'visionary'],
            'sovereign': ['mediator', 'alchemist'],
            'healer': ['warrior', 'dreamer'],
            'mediator': ['sovereign', 'builder'],
            'seeker': ['messenger', 'dreamer'],
            'builder': ['mediator', 'guardian'],
            'visionary': ['messenger', 'creator'],
            'dreamer': ['seeker', 'healer'],
            'alchemist': ['dreamer', 'sovereign'],
            'creator': ['visionary', 'healer']
        }
        return quest_archetype.lower() in complementary_archetypes.get(user_archetype.lower(), [])

    def _calculate_zodiac_quest_alignment(self, sun_sign: str, quest: RitualQuest) -> float:
        """Calculate zodiac alignment with quest"""
        zodiac_element_map = {
            'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
            'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
            'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
            'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
        }

        user_element = zodiac_element_map.get(sun_sign, '')
        return 1.0 if user_element == quest.element else 0.5

    def _get_recommendation_reason(self, quest: RitualQuest, user_profile: Dict, lunar_phase: str) -> str:
        """Generate personalized recommendation reason"""
        reasons = []

        if quest.element == user_profile.get('element'):
            reasons.append(f"aligns with your {quest.element} elemental nature")

        if quest.archetype.lower() == user_profile.get('dominant_archetype', '').lower():
            reasons.append(f"matches your {quest.archetype} archetype")

        if quest.lunar_cycle in lunar_phase.lower():
            reasons.append(f"perfectly timed for the current {lunar_phase} phase")

        if not reasons:
            reasons.append("offers complementary growth opportunities")

        return f"This quest {', '.join(reasons)}."

    def _apply_personalization(self, quest: RitualQuest, user_profile: Dict, user_history: Dict, lunar_phase: str) -> Tuple[float, Dict[str, Any]]:
        """Apply advanced personalization based on user history and patterns"""
        personalization_score = 0.0
        factors = {
            'history_bonus': 0.0,
            'engagement_pattern': 'neutral',
            'cosmic_timing': 'neutral',
            'growth_opportunity': 'moderate',
            'completion_likelihood': 0.5
        }

        # Analyze quest completion history
        completed_quests = user_history.get('completed_quests', [])
        if completed_quests:
            # Bonus for similar quest types
            similar_quests = [q for q in completed_quests if q.get('archetype') == quest.archetype]
            if similar_quests:
                factors['history_bonus'] = min(0.2, len(similar_quests) * 0.05)
                personalization_score += factors['history_bonus']

            # Analyze completion patterns
            completion_times = [q.get('completion_time_days', 0) for q in completed_quests]
            avg_completion = sum(completion_times) / len(completion_times) if completion_times else 0

            if avg_completion <= quest.duration_days * 0.8:
                factors['engagement_pattern'] = 'fast_completer'
                personalization_score += 0.1
            elif avg_completion >= quest.duration_days * 1.5:
                factors['engagement_pattern'] = 'thorough_completer'
                personalization_score += 0.05

        # Cosmic timing analysis
        current_season = self._get_current_season()
        seasonal_alignment = self._calculate_seasonal_alignment(quest, current_season)

        if seasonal_alignment > 0.7:
            factors['cosmic_timing'] = 'optimal'
            personalization_score += 0.15
        elif seasonal_alignment > 0.4:
            factors['cosmic_timing'] = 'good'
            personalization_score += 0.08

        # Growth opportunity assessment
        user_level = user_history.get('engagement_level', 'beginner')
        quest_difficulty = self._assess_quest_difficulty(quest)

        if self._is_growth_opportunity(user_level, quest_difficulty):
            factors['growth_opportunity'] = 'high'
            personalization_score += 0.12
        elif self._is_comfortable_challenge(user_level, quest_difficulty):
            factors['growth_opportunity'] = 'balanced'
            personalization_score += 0.06

        # Success probability calculation
        factors['completion_likelihood'] = self._predict_completion_probability(quest, user_profile, user_history)

        return personalization_score, factors

    def _generate_personalized_reason(self, quest: RitualQuest, user_profile: Dict, factors: Dict, lunar_phase: str) -> str:
        """Generate highly personalized recommendation reason"""
        reasons = []

        # Base compatibility reasons
        if quest.element == user_profile.get('element'):
            reasons.append(f"perfectly aligns with your {quest.element} elemental nature")

        if quest.archetype.lower() == user_profile.get('dominant_archetype', '').lower():
            reasons.append(f"resonates with your {quest.archetype} archetype")

        # Personalization-based reasons
        if factors.get('history_bonus', 0) > 0:
            reasons.append("builds on your successful quest patterns")

        if factors.get('cosmic_timing') == 'optimal':
            reasons.append("is perfectly timed with current cosmic energies")

        if factors.get('growth_opportunity') == 'high':
            reasons.append("offers significant growth opportunities for you")

        if factors.get('engagement_pattern') == 'fast_completer':
            reasons.append("matches your dynamic completion style")

        if factors.get('completion_likelihood', 0) > 0.7:
            reasons.append("has a high likelihood of successful completion")

        # Lunar phase timing
        if quest.lunar_cycle in lunar_phase.lower():
            reasons.append(f"is ideally suited for the current {lunar_phase} phase")

        if not reasons:
            reasons.append("offers unique cosmic growth opportunities")

        return f"This quest {', '.join(reasons[:3])}."  # Limit to top 3 reasons

    def _estimate_completion_time(self, quest: RitualQuest, user_profile: Dict) -> str:
        """Estimate completion time based on user profile"""
        base_days = quest.duration_days

        # Adjust based on zodiac sign tendencies
        sun_sign = user_profile.get('sun_sign', '').lower()
        sign_multipliers = {
            'aries': 0.8, 'leo': 0.9, 'sagittarius': 0.85,  # Fast action signs
            'taurus': 1.2, 'virgo': 1.1, 'capricorn': 1.15,  # Methodical signs
            'gemini': 0.9, 'libra': 1.0, 'aquarius': 0.95,   # Balanced signs
            'cancer': 1.1, 'scorpio': 1.0, 'pisces': 1.05    # Intuitive signs
        }

        multiplier = sign_multipliers.get(sun_sign, 1.0)
        estimated_days = base_days * multiplier

        if estimated_days < 3:
            return "2-3 days"
        elif estimated_days < 7:
            return "3-5 days"
        elif estimated_days < 14:
            return "1-2 weeks"
        else:
            return "2-3 weeks"

    def _calculate_success_probability(self, quest: RitualQuest, user_profile: Dict, factors: Dict) -> float:
        """Calculate predicted success probability"""
        base_probability = 0.6

        # Archetype alignment
        if quest.archetype.lower() == user_profile.get('dominant_archetype', '').lower():
            base_probability += 0.15

        # Elemental harmony
        if quest.element == user_profile.get('element'):
            base_probability += 0.1

        # History-based adjustment
        history_bonus = factors.get('history_bonus', 0)
        base_probability += history_bonus

        # Cosmic timing
        if factors.get('cosmic_timing') == 'optimal':
            base_probability += 0.1
        elif factors.get('cosmic_timing') == 'good':
            base_probability += 0.05

        return min(0.95, max(0.3, base_probability))

    def _assess_quest_difficulty(self, quest: RitualQuest) -> str:
        """Assess quest difficulty level"""
        step_count = len(quest.steps)
        duration = quest.duration_days
        action_types = {step.action_type for step in quest.steps}

        # Difficulty scoring
        difficulty_score = 0

        if step_count > 5:
            difficulty_score += 2
        elif step_count > 3:
            difficulty_score += 1

        if duration > 10:
            difficulty_score += 2
        elif duration > 5:
            difficulty_score += 1

        if 'creative' in action_types:
            difficulty_score += 1
        if 'meditation' in action_types and len([s for s in quest.steps if s.action_type == 'meditation']) > 2:
            difficulty_score += 1

        if difficulty_score >= 4:
            return 'advanced'
        elif difficulty_score >= 2:
            return 'intermediate'
        else:
            return 'beginner'

    def _is_growth_opportunity(self, user_level: str, quest_difficulty: str) -> bool:
        """Check if quest represents a growth opportunity"""
        level_hierarchy = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        user_rank = level_hierarchy.get(user_level, 1)
        quest_rank = level_hierarchy.get(quest_difficulty, 2)

        return quest_rank > user_rank

    def _is_comfortable_challenge(self, user_level: str, quest_difficulty: str) -> bool:
        """Check if quest is a comfortable challenge"""
        level_hierarchy = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        user_rank = level_hierarchy.get(user_level, 1)
        quest_rank = level_hierarchy.get(quest_difficulty, 2)

        return abs(user_rank - quest_rank) <= 1

    def _predict_completion_probability(self, quest: RitualQuest, user_profile: Dict, user_history: Dict) -> float:
        """Predict quest completion probability based on user patterns"""
        base_prob = 0.6

        # Analyze completion history
        completed_quests = user_history.get('completed_quests', [])
        if completed_quests:
            completion_rate = len(completed_quests) / max(1, user_history.get('total_quests_started', len(completed_quests)))
            base_prob = min(0.9, max(0.4, completion_rate))

        # Adjust for quest characteristics
        if len(quest.steps) > 5:
            base_prob *= 0.9  # More steps = slightly harder

        if quest.duration_days > 10:
            base_prob *= 0.95  # Longer duration = slightly harder

        # Zodiac-based adjustments
        sun_sign = user_profile.get('sun_sign', '').lower()
        if sun_sign in ['capricorn', 'virgo', 'taurus']:  # Disciplined signs
            base_prob *= 1.1
        elif sun_sign in ['aries', 'sagittarius', 'leo']:  # Action-oriented signs
            if quest.duration_days <= 7:
                base_prob *= 1.05

        return min(0.95, max(0.25, base_prob))

    def _calculate_seasonal_alignment(self, quest: RitualQuest, current_season: str) -> float:
        """Calculate how well a quest aligns with the current season"""
        # Elemental alignment with seasons
        seasonal_elements = {
            'spring': ['air', 'fire'],  # Renewal, growth
            'summer': ['fire', 'earth'],  # Energy, manifestation
            'autumn': ['earth', 'water'],  # Harvest, reflection
            'winter': ['water', 'air']   # Introspection, planning
        }

        quest_element = quest.element.lower()
        season_elements = seasonal_elements.get(current_season, [])

        if quest_element in season_elements:
            return 0.8  # Strong alignment
        elif len(season_elements) > 0:
            return 0.4  # Moderate alignment
        else:
            return 0.2  # Weak alignment

    def _get_current_season(self) -> str:
        """Get current astronomical season"""
        now = datetime.now()
        month = now.month
        day = now.day

        if (month == 12 and day >= 21) or (month <= 3 and not (month == 3 and day >= 21)):
            return "winter"
        elif (month == 3 and day >= 21) or (month == 4) or (month == 5) or (month == 6 and day < 21):
            return "spring"
        elif (month == 6 and day >= 21) or (month == 7) or (month == 8) or (month == 9 and day < 23):
            return "summer"
        else:
            return "autumn"

    def start_quest(self, user_id: str, quest_id: str) -> Dict[str, Any]:
        """Start a quest for a user"""
        if quest_id not in self.quests:
            return {'success': False, 'error': 'Quest not found'}

        quest = self.quests[quest_id]

        # Initialize quest progress
        quest_progress = {
            'quest_id': quest_id,
            'started_at': datetime.now().isoformat(),
            'current_step': 0,
            'completed_steps': [],
            'status': 'active',
            'progress_percentage': 0
        }

        # Add to user's active quests
        if user_id not in self.active_quests:
            self.active_quests[user_id] = []

        self.active_quests[user_id].append(quest_progress)

        return {
            'success': True,
            'quest_progress': quest_progress,
            'quest_details': asdict(quest)
        }

    def complete_quest_step(self, user_id: str, quest_id: str, step_id: str) -> Dict[str, Any]:
        """Complete a specific quest step"""
        if user_id not in self.active_quests:
            return {'success': False, 'error': 'No active quests found'}

        quest_progress = None
        for progress in self.active_quests[user_id]:
            if progress['quest_id'] == quest_id:
                quest_progress = progress
                break

        if not quest_progress:
            return {'success': False, 'error': 'Quest not found in active quests'}

        quest = self.quests[quest_id]
        step_index = next((i for i, step in enumerate(quest.steps) if step.id == step_id), -1)

        if step_index == -1:
            return {'success': False, 'error': 'Step not found in quest'}

        # Mark step as completed
        if step_id not in quest_progress['completed_steps']:
            quest_progress['completed_steps'].append(step_id)

        # Update progress
        quest_progress['progress_percentage'] = len(quest_progress['completed_steps']) / len(quest.steps)

        # Check if quest is complete
        if len(quest_progress['completed_steps']) == len(quest.steps):
            quest_progress['status'] = 'completed'
            quest_progress['completed_at'] = datetime.now().isoformat()

            return {
                'success': True,
                'step_completed': step_id,
                'quest_completed': True,
                'rewards': quest.rewards,
                'progress': quest_progress
            }

        return {
            'success': True,
            'step_completed': step_id,
            'quest_completed': False,
            'next_step': asdict(quest.steps[step_index + 1]) if step_index + 1 < len(quest.steps) else None,
            'progress': quest_progress
        }

    def get_user_quests(self, user_id: str) -> Dict[str, Any]:
        """Get all quests for a user"""
        active = self.active_quests.get(user_id, [])
        completed = []  # Would be loaded from database in production

        return {
            'active_quests': active,
            'completed_quests': completed,
            'total_active': len(active),
            'total_completed': len(completed)
        }


# Global ritual quests system instance
ritual_quests_system = RitualQuestsSystem()


def get_recommended_quests(user_profile: Dict, max_recommendations: int = 3) -> List[Dict[str, Any]]:
    """Convenience function to get quest recommendations"""
    return ritual_quests_system.recommend_quests(user_profile, max_recommendations)


def start_user_quest(user_id: str, quest_id: str) -> Dict[str, Any]:
    """Convenience function to start a quest"""
    return ritual_quests_system.start_quest(user_id, quest_id)


def complete_quest_step(user_id: str, quest_id: str, step_id: str) -> Dict[str, Any]:
    """Convenience function to complete a quest step"""
    return ritual_quests_system.complete_quest_step(user_id, quest_id, step_id)


if __name__ == "__main__":
    # Test the ritual quests system
    test_profile = {
        'sun_sign': 'scorpio',
        'element': 'water',
        'dominant_archetype': 'alchemist'
    }

    # Get recommendations
    recommendations = get_recommended_quests(test_profile, 2)
    print(f"Recommended quests: {len(recommendations)}")
    for rec in recommendations:
        quest = rec['quest']
        print(f"- {quest['title']}: {rec['recommended_reason']} (Score: {rec['compatibility_score']:.2f})")

    # Test quest starting and completion
    if recommendations:
        quest_id = recommendations[0]['quest']['id']
        result = start_user_quest("test_user", quest_id)
        print(f"\nStarted quest: {result['success']}")

        if result['success']:
            quest_details = result['quest_details']
            if quest_details['steps']:
                first_step = quest_details['steps'][0]['id']
                completion_result = complete_quest_step("test_user", quest_id, first_step)
                print(f"Completed first step: {completion_result['success']}")
                print(f"Quest completed: {completion_result.get('quest_completed', False)}")