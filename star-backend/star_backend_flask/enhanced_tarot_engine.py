"""
Enhanced Tarot System for STAR Platform
Implements advanced tarot spreads, AI-powered interpretations, and cosmic timing integration
"""

import logging
import random
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class TarotSuit(Enum):
    """Tarot suit enumeration"""
    CUPS = "Cups"
    WANDS = "Wands" 
    SWORDS = "Swords"
    PENTACLES = "Pentacles"
    MAJOR_ARCANA = "Major Arcana"

class TarotElement(Enum):
    """Elemental associations for tarot cards"""
    FIRE = "Fire"
    WATER = "Water"
    AIR = "Air"
    EARTH = "Earth"
    SPIRIT = "Spirit"

@dataclass
class TarotCard:
    """Enhanced tarot card representation"""
    name: str
    number: Optional[int]
    suit: TarotSuit
    element: TarotElement
    keywords_upright: List[str]
    keywords_reversed: List[str]
    description: str
    astrological_association: Optional[str]
    numerological_significance: Optional[int]
    chakra_association: Optional[str]
    crystal_recommendation: Optional[str]
    
    def get_cosmic_influences(self) -> Dict[str, Any]:
        """Get comprehensive cosmic influences for this card"""
        return {
            'element': self.element.value,
            'astrological': self.astrological_association,
            'numerological': self.numerological_significance,
            'chakra': self.chakra_association,
            'crystal': self.crystal_recommendation
        }

@dataclass
class SpreadPosition:
    """Position in a tarot spread with meaning"""
    x: float
    y: float
    name: str
    meaning: str
    significance: str
    rotation: float = 0.0
    
class AdvancedTarotSpread:
    """Advanced tarot spread configurations"""
    
    @staticmethod
    def get_single_card() -> Dict[str, Any]:
        """Single card spread - simple focused guidance"""
        return {
            'name': 'Single Card',
            'description': 'One card for focused guidance and daily insights',
            'card_count': 1,
            'positions': [
                SpreadPosition(0.5, 0.5, 'Guidance', 'Primary guidance and focus for your question', 'Core message')
            ]
        }
    
    @staticmethod
    def get_celtic_cross() -> Dict[str, Any]:
        """Celtic Cross spread - most comprehensive 10-card spread"""
        return {
            'name': 'Celtic Cross',
            'description': 'The most comprehensive and detailed tarot reading',
            'card_count': 10,
            'positions': [
                SpreadPosition(0.5, 0.5, 'Present Situation', 'Your current circumstances and energy', 'Central focus'),
                SpreadPosition(0.5, 0.35, 'Challenge/Cross', 'What crosses or challenges you now', 'Obstacles'),
                SpreadPosition(0.5, 0.2, 'Distant Past', 'Foundation and distant influences', 'Root causes'),
                SpreadPosition(0.35, 0.5, 'Recent Past', 'Recent events affecting the situation', 'Recent influences'),
                SpreadPosition(0.5, 0.8, 'Possible Outcome', 'Potential future if current path continues', 'Potential future'),
                SpreadPosition(0.65, 0.5, 'Immediate Future', 'Near-term developments and events', 'Near future'),
                SpreadPosition(0.85, 0.8, 'Your Approach', 'Your attitude and approach to the situation', 'Self-perception'),
                SpreadPosition(0.85, 0.65, 'External Influences', 'Environmental factors and other people', 'External forces'),
                SpreadPosition(0.85, 0.5, 'Hopes and Fears', 'Your inner hopes and fears', 'Inner feelings'),
                SpreadPosition(0.85, 0.35, 'Final Outcome', 'Ultimate resolution and outcome', 'Final result')
            ],
            'interpretation_flow': [
                [0, 1],  # Present + Challenge
                [2, 3, 5],  # Past influences to future
                [6, 7, 8, 9],  # Personal journey
                [0, 4, 9]  # Central narrative
            ]
        }
    
    @staticmethod
    def get_zodiac_wheel() -> Dict[str, Any]:
        """Zodiac Wheel spread - 12-card astrological reading"""
        positions = []
        for i in range(12):
            angle = (i * 30) * 3.14159 / 180  # Convert degrees to radians
            x = 0.5 + 0.35 * math.cos(angle - 3.14159/2)  # Start from top (Aries)
            y = 0.5 + 0.35 * math.sin(angle - 3.14159/2)
            
            house_meanings = [
                "Identity & Self", "Resources & Values", "Communication & Learning",
                "Home & Family", "Creativity & Romance", "Health & Work",
                "Partnerships", "Transformation", "Philosophy & Travel",
                "Career & Status", "Friends & Hopes", "Spirituality & Karma"
            ]
            
            positions.append(SpreadPosition(
                x, y, f"House {i+1}", house_meanings[i], 
                f"Astrological house {i+1} influences"
            ))
        
        return {
            'name': 'Zodiac Wheel',
            'description': 'Comprehensive astrological life reading',
            'card_count': 12,
            'positions': positions,
            'interpretation_flow': [
                [0, 6],  # Self vs Others
                [1, 2, 5, 8],  # Material and communication
                [3, 4, 9, 10],  # Personal growth and society
                [7, 11]  # Transformation and spirituality
            ]
        }
    
    @staticmethod
    def get_chakra_alignment() -> Dict[str, Any]:
        """7-card chakra alignment spread"""
        chakras = [
            ('Root Chakra', 'Survival, grounding, basic needs'),
            ('Sacral Chakra', 'Creativity, sexuality, emotions'),
            ('Solar Plexus', 'Personal power, confidence, will'),
            ('Heart Chakra', 'Love, compassion, relationships'),
            ('Throat Chakra', 'Communication, truth, expression'),
            ('Third Eye', 'Intuition, wisdom, spiritual sight'),
            ('Crown Chakra', 'Spiritual connection, enlightenment')
        ]
        
        positions = []
        for i, (name, meaning) in enumerate(chakras):
            positions.append(SpreadPosition(
                0.5, 0.15 + (i * 0.12), name, meaning, f"Chakra {i+1} energy state"
            ))
        
        return {
            'name': 'Chakra Alignment',
            'description': 'Seven-chakra energy reading and balance assessment',
            'card_count': 7,
            'positions': positions,
            'interpretation_flow': [
                [0, 1, 2],  # Lower chakras (physical)
                [3],  # Heart (bridge)
                [4, 5, 6]  # Upper chakras (spiritual)
            ]
        }
    
    @staticmethod
    def get_past_present_future_detailed() -> Dict[str, Any]:
        """Enhanced 9-card past-present-future spread"""
        return {
            'name': 'Past-Present-Future Detailed',
            'description': 'Comprehensive timeline reading with deep insights',
            'card_count': 9,
            'positions': [
                # Past column
                SpreadPosition(0.2, 0.3, 'Past Foundation', 'Deep roots and origins', 'Past foundation'),
                SpreadPosition(0.2, 0.5, 'Past Lessons', 'Key lessons from the past', 'Past learning'),
                SpreadPosition(0.2, 0.7, 'Past Release', 'What needs to be released', 'Past letting go'),
                
                # Present column
                SpreadPosition(0.5, 0.3, 'Present Situation', 'Current circumstances', 'Present reality'),
                SpreadPosition(0.5, 0.5, 'Present Action', 'What to do now', 'Present choice'),
                SpreadPosition(0.5, 0.7, 'Present Challenge', 'Current obstacles', 'Present difficulty'),
                
                # Future column
                SpreadPosition(0.8, 0.3, 'Future Potential', 'Emerging possibilities', 'Future opportunity'),
                SpreadPosition(0.8, 0.5, 'Future Path', 'Recommended direction', 'Future guidance'),
                SpreadPosition(0.8, 0.7, 'Future Outcome', 'Likely result', 'Future manifestation')
            ],
            'interpretation_flow': [
                [0, 3, 6],  # Foundation timeline
                [1, 4, 7],  # Action timeline  
                [2, 5, 8]   # Challenge/release timeline
            ]
        }
    
    @staticmethod
    def get_relationship_spread() -> Dict[str, Any]:
        """Comprehensive relationship reading"""
        return {
            'name': 'Relationship Deep Dive',
            'description': 'Comprehensive analysis of any relationship dynamic',
            'card_count': 8,
            'positions': [
                SpreadPosition(0.3, 0.2, 'Your Energy', 'Your role and energy in this relationship', 'Self in relationship'),
                SpreadPosition(0.7, 0.2, 'Their Energy', 'Their role and energy in this relationship', 'Other in relationship'),
                SpreadPosition(0.5, 0.35, 'Connection', 'The bond between you', 'Relationship core'),
                SpreadPosition(0.3, 0.5, 'Your Needs', 'What you need from this relationship', 'Personal needs'),
                SpreadPosition(0.7, 0.5, 'Their Needs', 'What they need from this relationship', 'Other\'s needs'),
                SpreadPosition(0.5, 0.65, 'Challenge', 'Main obstacle or lesson in this relationship', 'Growth edge'),
                SpreadPosition(0.3, 0.8, 'Your Growth', 'How you can grow through this relationship', 'Personal evolution'),
                SpreadPosition(0.7, 0.8, 'Relationship Future', 'Potential future of this connection', 'Relationship destiny')
            ],
            'interpretation_flow': [
                [0, 1, 2],  # Core dynamic
                [3, 4, 5],  # Needs and challenges
                [6, 7]      # Growth and future
            ]
        }

import math


class EnhancedTarotEngine:
    """Advanced tarot engine with AI interpretations and cosmic integration"""
    
    def __init__(self):
        self.deck = self._initialize_full_deck()
        self.spreads = {
            'single_card': AdvancedTarotSpread.get_single_card(),
            'celtic_cross': AdvancedTarotSpread.get_celtic_cross(),
            'zodiac_wheel': AdvancedTarotSpread.get_zodiac_wheel(),
            'chakra_alignment': AdvancedTarotSpread.get_chakra_alignment(),
            'past_present_future_detailed': AdvancedTarotSpread.get_past_present_future_detailed(),
            'relationship_spread': AdvancedTarotSpread.get_relationship_spread()
        }
    
    def _initialize_full_deck(self) -> List[TarotCard]:
        """Initialize complete 78-card tarot deck with cosmic associations"""
        deck = []
        
        # Major Arcana (22 cards)
        major_arcana = [
            TarotCard("The Fool", 0, TarotSuit.MAJOR_ARCANA, TarotElement.AIR, 
                     ["New beginnings", "Innocence", "Spontaneity", "Adventure"],
                     ["Recklessness", "Naivety", "Foolishness", "Risk"],
                     "The beginning of all journeys, infinite potential", 
                     "Uranus", 0, "Crown", "Clear Quartz"),
            
            TarotCard("The Magician", 1, TarotSuit.MAJOR_ARCANA, TarotElement.AIR,
                     ["Manifestation", "Willpower", "Skill", "Concentration"],
                     ["Manipulation", "Trickery", "Illusion", "Deception"],
                     "The power to manifest desires into reality",
                     "Mercury", 1, "Throat", "Citrine"),
            
            TarotCard("The High Priestess", 2, TarotSuit.MAJOR_ARCANA, TarotElement.WATER,
                     ["Intuition", "Mystery", "Subconscious", "Higher knowledge"],
                     ["Secrets", "Disconnection", "Withdrawal", "Silence"],
                     "Divine feminine wisdom and intuitive knowledge",
                     "Moon", 2, "Third Eye", "Moonstone"),
            
            TarotCard("The Empress", 3, TarotSuit.MAJOR_ARCANA, TarotElement.EARTH,
                     ["Fertility", "Femininity", "Beauty", "Nature", "Abundance"],
                     ["Dependency", "Smothering", "Emptiness", "Lack of growth"],
                     "Divine feminine creativity and nurturing energy",
                     "Venus", 3, "Heart", "Rose Quartz"),
            
            TarotCard("The Emperor", 4, TarotSuit.MAJOR_ARCANA, TarotElement.FIRE,
                     ["Authority", "Structure", "Control", "Father-figure"],
                     ["Domination", "Rigidity", "Coldness", "Tyranny"],
                     "Divine masculine authority and protective structure",
                     "Aries", 4, "Solar Plexus", "Red Jasper"),
            
            # Continue with remaining Major Arcana...
            TarotCard("The Hierophant", 5, TarotSuit.MAJOR_ARCANA, TarotElement.EARTH,
                     ["Tradition", "Conformity", "Morality", "Ethics"],
                     ["Rebellion", "Subversion", "New approaches", "Freedom"],
                     "Traditional wisdom and spiritual guidance",
                     "Taurus", 5, "Throat", "Sapphire"),
            
            TarotCard("The Lovers", 6, TarotSuit.MAJOR_ARCANA, TarotElement.AIR,
                     ["Love", "Harmony", "Relationships", "Values alignment"],
                     ["Disharmony", "Imbalance", "Misalignment", "Bad choices"],
                     "Divine union and conscious choice in love",
                     "Gemini", 6, "Heart", "Emerald"),
            
            TarotCard("The Chariot", 7, TarotSuit.MAJOR_ARCANA, TarotElement.WATER,
                     ["Control", "Will power", "Success", "Determination"],
                     ["Lack of control", "Lack of direction", "Aggression"],
                     "Victory through self-discipline and focused will",
                     "Cancer", 7, "Solar Plexus", "Tiger's Eye"),
            
            TarotCard("Strength", 8, TarotSuit.MAJOR_ARCANA, TarotElement.FIRE,
                     ["Strength", "Courage", "Persuasion", "Influence", "Compassion"],
                     ["Self-doubt", "Low energy", "Raw emotion", "Inner fears"],
                     "Inner strength and gentle courage over brute force",
                     "Leo", 8, "Heart", "Carnelian"),
            
            TarotCard("The Hermit", 9, TarotSuit.MAJOR_ARCANA, TarotElement.EARTH,
                     ["Soul searching", "Seeking truth", "Inner guidance"],
                     ["Isolation", "Loneliness", "Withdrawal", "Paranoia"],
                     "Inner wisdom found through solitude and reflection",
                     "Virgo", 9, "Third Eye", "Amethyst")
        ]
        
        deck.extend(major_arcana)
        
        # Minor Arcana - Cups (Water)
        cups_court = [
            TarotCard("King of Cups", None, TarotSuit.CUPS, TarotElement.WATER,
                     ["Emotional maturity", "Compassion", "Diplomacy"],
                     ["Moodiness", "Emotional manipulation", "Volatility"],
                     "Mastery of emotions and compassionate leadership",
                     "Scorpio", None, "Heart", "Aquamarine"),
            
            TarotCard("Queen of Cups", None, TarotSuit.CUPS, TarotElement.WATER,
                     ["Compassion", "Calm", "Comfort", "Intuition"],
                     ["Insecurity", "Giving too much", "Emotional dependency"],
                     "Intuitive nurturing and emotional wisdom",
                     "Pisces", None, "Heart", "Pearl"),
        ]
        
        # Add basic structure for other suits (shortened for brevity)
        # In production, this would include all 78 cards
        deck.extend(cups_court)
        
        return deck
    
    def draw_cards(self, count: int, seed: Optional[str] = None) -> List[TarotCard]:
        """Draw random cards from the deck"""
        if seed:
            random.seed(seed)
        
        return random.sample(self.deck, min(count, len(self.deck)))
    
    def generate_reading(self, spread_type: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate a complete tarot reading with AI interpretation"""
        if spread_type not in self.spreads:
            raise ValueError(f"Unknown spread type: {spread_type}")
        
        spread = self.spreads[spread_type]
        cards = self.draw_cards(spread['card_count'])
        
        # Create card placements
        placements = []
        for i, (card, position) in enumerate(zip(cards, spread['positions'])):
            is_reversed = random.choice([True, False])  # 50% chance reversed
            
            placements.append({
                'position': {
                    'name': position.name,
                    'meaning': position.meaning,
                    'significance': position.significance,
                    'x': position.x,
                    'y': position.y,
                    'rotation': position.rotation
                },
                'card': {
                    'name': card.name,
                    'number': card.number,
                    'suit': card.suit.value,
                    'element': card.element.value,
                    'keywords': card.keywords_reversed if is_reversed else card.keywords_upright,
                    'is_reversed': is_reversed,
                    'cosmic_influences': card.get_cosmic_influences()
                }
            })
        
        # Generate AI interpretation
        interpretation = self._generate_ai_interpretation(spread, placements, user_context)
        
        # Calculate energy flows
        energy_flows = self._calculate_energy_flows(placements, spread)
        
        return {
            'spread': spread,
            'placements': placements,
            'interpretation': interpretation,
            'energy_flows': energy_flows,
            'cosmic_timing': self._get_cosmic_timing_advice(placements, user_context),
            'numerology_connections': self._get_numerology_connections(placements, user_context),
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_ai_interpretation(self, spread: Dict, placements: List[Dict], user_context: Optional[Dict]) -> Dict[str, Any]:
        """Generate comprehensive AI-powered interpretation"""
        
        # Analyze elemental balance
        elements = [p['card']['element'] for p in placements]
        element_count = {elem: elements.count(elem) for elem in set(elements)}
        dominant_element = max(element_count, key=element_count.get)
        
        # Analyze numerical patterns
        numbers = [p['card']['number'] for p in placements if p['card']['number'] is not None]
        if numbers:
            avg_number = sum(numbers) / len(numbers)
            number_range = max(numbers) - min(numbers) if len(numbers) > 1 else 0
        else:
            avg_number = 0
            number_range = 0
        
        # Generate interpretation themes
        themes = self._identify_reading_themes(placements, spread)
        
        # Create narrative interpretation
        narrative = self._create_reading_narrative(placements, spread, themes, user_context)
        
        return {
            'overall_theme': themes['primary'],
            'secondary_themes': themes['secondary'],
            'elemental_analysis': {
                'dominant_element': dominant_element,
                'element_distribution': element_count,
                'elemental_message': self._get_elemental_message(dominant_element, element_count)
            },
            'numerical_analysis': {
                'average_energy': avg_number,
                'energy_range': number_range,
                'numerical_message': self._get_numerical_message(avg_number, number_range)
            },
            'narrative': narrative,
            'key_insights': self._extract_key_insights(placements, spread),
            'recommended_actions': self._generate_action_recommendations(placements, themes, user_context),
            'spiritual_guidance': self._generate_spiritual_guidance(placements, user_context)
        }
    
    def _identify_reading_themes(self, placements: List[Dict], spread: Dict) -> Dict[str, Any]:
        """Identify primary and secondary themes in the reading"""
        theme_keywords = []
        
        for placement in placements:
            theme_keywords.extend(placement['card']['keywords'])
        
        # Categorize themes
        theme_categories = {
            'love_relationships': ['love', 'relationships', 'harmony', 'partnership', 'romance'],
            'career_success': ['success', 'achievement', 'career', 'ambition', 'leadership'],
            'spiritual_growth': ['spirituality', 'intuition', 'wisdom', 'enlightenment', 'meditation'],
            'personal_power': ['power', 'confidence', 'strength', 'willpower', 'control'],
            'transformation': ['change', 'transformation', 'death', 'rebirth', 'renewal'],
            'material_world': ['money', 'abundance', 'security', 'resources', 'practical']
        }
        
        theme_scores = {}
        for category, keywords in theme_categories.items():
            score = sum(1 for keyword in theme_keywords if any(k in keyword.lower() for k in keywords))
            if score > 0:
                theme_scores[category] = score
        
        sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'primary': sorted_themes[0][0] if sorted_themes else 'general_guidance',
            'secondary': [theme for theme, _ in sorted_themes[1:3]]
        }
    
    def _create_reading_narrative(self, placements: List[Dict], spread: Dict, themes: Dict, user_context: Optional[Dict]) -> str:
        """Create a flowing narrative interpretation"""
        
        narrative_templates = {
            'celtic_cross': "Your current journey reveals {central_card} at its heart. The path you're walking shows {past_influence}, leading to {future_potential}. The universe advises {guidance}.",
            
            'zodiac_wheel': "The cosmic wheel shows your life's current season. Your identity ({house_1}) is influenced by {first_card}, while your relationships ({house_7}) reveal {seventh_card}. The stars suggest {cosmic_guidance}.",
            
            'chakra_alignment': "Your energy centers reveal a story of {energy_state}. Your root ({root_card}) provides {foundation}, while your crown ({crown_card}) shows {spiritual_connection}. Balance comes through {alignment_advice}.",
            
            'past_present_future': "Time flows from {past_foundation} through {present_moment} toward {future_manifestation}. The lessons of yesterday teach {past_wisdom}, today calls for {present_action}, and tomorrow promises {future_hope}.",
            
            'relationship': "This connection shows {relationship_core} at its center. You bring {your_energy} while they offer {their_energy}. Together you're learning {shared_lesson} and growing toward {relationship_destiny}."
        }
        
        # Extract key cards for narrative
        key_cards = {}
        if spread['name'] == 'Celtic Cross' and len(placements) >= 10:
            key_cards = {
                'central_card': placements[0]['card']['name'],
                'past_influence': placements[2]['card']['name'],
                'future_potential': placements[9]['card']['name']
            }
        
        template = narrative_templates.get(spread['name'].lower().replace(' ', '_'), 
                                        "The cards reveal a journey of {primary_theme}. {guidance_message}")
        
        # Fill template with reading-specific content
        return self._fill_narrative_template(template, placements, themes, user_context)
    
    def _fill_narrative_template(self, template: str, placements: List[Dict], themes: Dict, user_context: Optional[Dict]) -> str:
        """Fill narrative template with actual reading content"""
        # This would be more sophisticated in production
        # For now, return a basic interpretation
        primary_theme = themes['primary'].replace('_', ' ').title()
        
        return f"The cards reveal a powerful story centered around {primary_theme}. " + \
               f"The dominant energy of {placements[0]['card']['element']} guides this reading, " + \
               f"with {placements[0]['card']['name']} showing the core message. " + \
               f"The universe encourages you to embrace the qualities of {', '.join(placements[0]['card']['keywords'][:3])} " + \
               f"as you navigate this important phase of your journey."
    
    def _extract_key_insights(self, placements: List[Dict], spread: Dict) -> List[str]:
        """Extract key insights from the reading"""
        insights = []
        
        # Insight from most powerful card (usually first or central)
        if placements:
            central_card = placements[0]
            insights.append(f"Your central energy is {central_card['card']['name']}, emphasizing {central_card['card']['keywords'][0].lower()}")
        
        # Insight from elemental balance
        elements = [p['card']['element'] for p in placements]
        element_count = {elem: elements.count(elem) for elem in set(elements)}
        if element_count:
            dominant = max(element_count, key=element_count.get)
            insights.append(f"The dominant {dominant} energy suggests focusing on {self._get_element_focus(dominant)}")
        
        # Insight from reversed cards
        reversed_count = sum(1 for p in placements if p['card']['is_reversed'])
        if reversed_count > len(placements) // 2:
            insights.append("Many reversed cards indicate a need for introspection and inner work")
        
        return insights
    
    def _generate_action_recommendations(self, placements: List[Dict], themes: Dict, user_context: Optional[Dict]) -> List[str]:
        """Generate specific action recommendations"""
        actions = []
        
        primary_theme = themes['primary']
        
        theme_actions = {
            'love_relationships': [
                "Open your heart to deeper connections",
                "Communicate your feelings honestly",
                "Practice self-love and compassion"
            ],
            'career_success': [
                "Take initiative on important projects",
                "Network with influential people",
                "Develop your professional skills"
            ],
            'spiritual_growth': [
                "Dedicate time to meditation or reflection",
                "Study spiritual or philosophical texts",
                "Connect with nature for grounding"
            ],
            'personal_power': [
                "Assert your boundaries clearly",
                "Take responsibility for your choices",
                "Build confidence through small victories"
            ]
        }
        
        return theme_actions.get(primary_theme, [
            "Trust your intuition in important decisions",
            "Remain open to unexpected opportunities",
            "Practice patience with yourself and others"
        ])
    
    def _generate_spiritual_guidance(self, placements: List[Dict], user_context: Optional[Dict]) -> Dict[str, str]:
        """Generate spiritual guidance and cosmic connections"""
        
        # Extract crystal recommendations from cards
        crystals = [p['card']['cosmic_influences']['crystal'] for p in placements 
                   if p['card']['cosmic_influences'].get('crystal')]
        
        # Extract chakra focuses
        chakras = [p['card']['cosmic_influences']['chakra'] for p in placements 
                  if p['card']['cosmic_influences'].get('chakra')]
        
        return {
            'meditation_focus': f"Meditate on the energy of {placements[0]['card']['name']}" if placements else "Center yourself in present moment awareness",
            'crystal_recommendation': f"Work with {crystals[0]} for enhanced clarity" if crystals else "Clear Quartz for general purification",
            'chakra_focus': f"Balance your {chakras[0]} chakra" if chakras else "Focus on overall energy alignment",
            'affirmation': self._create_reading_affirmation(placements),
            'ritual_suggestion': self._suggest_ritual(placements)
        }
    
    def _create_reading_affirmation(self, placements: List[Dict]) -> str:
        """Create a personalized affirmation based on the reading"""
        if not placements:
            return "I am open to the wisdom of the universe"
        
        primary_keywords = placements[0]['card']['keywords'][:2]
        return f"I embrace {primary_keywords[0].lower()} and welcome {primary_keywords[1].lower()} into my life"
    
    def _suggest_ritual(self, placements: List[Dict]) -> str:
        """Suggest a ritual based on the reading's energy"""
        if not placements:
            return "Light a candle and set an intention for guidance"
        
        element = placements[0]['card']['element']
        
        element_rituals = {
            'Fire': "Light a red candle and write down what you want to manifest",
            'Water': "Take a ritual bath with sea salt or blessed water",
            'Air': "Burn incense and journal your thoughts and insights",
            'Earth': "Create a small altar with stones, plants, or crystals",
            'Spirit': "Meditate in silence and connect with your higher self"
        }
        
        return element_rituals.get(element, "Create a sacred space and reflect on the reading's message")
    
    def _calculate_energy_flows(self, placements: List[Dict], spread: Dict) -> List[Dict]:
        """Calculate energy flows between cards based on positions and elements"""
        flows = []
        
        if 'interpretation_flow' not in spread:
            return flows
        
        for flow_group in spread['interpretation_flow']:
            if len(flow_group) >= 2:
                for i in range(len(flow_group) - 1):
                    from_idx = flow_group[i]
                    to_idx = flow_group[i + 1]
                    
                    if from_idx < len(placements) and to_idx < len(placements):
                        from_card = placements[from_idx]
                        to_card = placements[to_idx]
                        
                        # Calculate flow strength based on elemental compatibility
                        strength = self._calculate_elemental_compatibility(
                            from_card['card']['element'], 
                            to_card['card']['element']
                        )
                        
                        flows.append({
                            'from_position': from_card['position']['name'],
                            'to_position': to_card['position']['name'],
                            'from_card': from_card['card']['name'],
                            'to_card': to_card['card']['name'],
                            'strength': strength,
                            'flow_type': self._determine_flow_type(strength),
                            'message': self._create_flow_message(from_card, to_card, strength)
                        })
        
        return flows
    
    def _calculate_elemental_compatibility(self, element1: str, element2: str) -> float:
        """Calculate compatibility between two elements (0.0 to 1.0)"""
        compatibility_matrix = {
            'Fire': {'Fire': 0.8, 'Water': 0.2, 'Air': 0.9, 'Earth': 0.4, 'Spirit': 0.7},
            'Water': {'Fire': 0.2, 'Water': 0.8, 'Air': 0.5, 'Earth': 0.9, 'Spirit': 0.7},
            'Air': {'Fire': 0.9, 'Water': 0.5, 'Air': 0.8, 'Earth': 0.3, 'Spirit': 0.8},
            'Earth': {'Fire': 0.4, 'Water': 0.9, 'Air': 0.3, 'Earth': 0.8, 'Spirit': 0.6},
            'Spirit': {'Fire': 0.7, 'Water': 0.7, 'Air': 0.8, 'Earth': 0.6, 'Spirit': 1.0}
        }
        
        return compatibility_matrix.get(element1, {}).get(element2, 0.5)
    
    def _determine_flow_type(self, strength: float) -> str:
        """Determine the type of energy flow based on strength"""
        if strength >= 0.8:
            return 'harmonious'
        elif strength >= 0.6:
            return 'supportive'
        elif strength >= 0.4:
            return 'neutral'
        else:
            return 'challenging'
    
    def _create_flow_message(self, from_card: Dict, to_card: Dict, strength: float) -> str:
        """Create a descriptive message for the energy flow"""
        flow_type = self._determine_flow_type(strength)
        
        messages = {
            'harmonious': f"The energy flows beautifully from {from_card['card']['name']} to {to_card['card']['name']}, creating perfect harmony",
            'supportive': f"{from_card['card']['name']} gently supports and enhances the energy of {to_card['card']['name']}",
            'neutral': f"The connection between {from_card['card']['name']} and {to_card['card']['name']} requires conscious integration",
            'challenging': f"The tension between {from_card['card']['name']} and {to_card['card']['name']} offers important lessons"
        }
        
        return messages.get(flow_type, f"Energy moves from {from_card['card']['name']} to {to_card['card']['name']}")
    
    def _get_cosmic_timing_advice(self, placements: List[Dict], user_context: Optional[Dict]) -> Dict[str, Any]:
        """Provide cosmic timing advice based on the reading"""
        
        # Analyze astrological influences
        astrological_influences = []
        for placement in placements:
            astro = placement['card']['cosmic_influences'].get('astrological')
            if astro:
                astrological_influences.append(astro)
        
        # Get numerological significance
        numerological_influences = []
        for placement in placements:
            num = placement['card']['cosmic_influences'].get('numerological')
            if num:
                numerological_influences.append(num)
        
        # Calculate timing recommendations
        timing_advice = {
            'best_days': self._calculate_best_days(astrological_influences, numerological_influences),
            'lunar_timing': self._get_lunar_advice(placements),
            'seasonal_guidance': self._get_seasonal_guidance(placements),
            'daily_timing': self._get_daily_timing_advice(placements)
        }
        
        return timing_advice
    
    def _calculate_best_days(self, astro_influences: List[str], num_influences: List[int]) -> List[str]:
        """Calculate best days based on astrological and numerological influences"""
        # Simplified calculation - in production this would be more sophisticated
        best_days = []
        
        if astro_influences:
            # Map astrological influences to favorable days
            astro_days = {
                'Mercury': ['Wednesday', 'Sunday'],
                'Venus': ['Friday', 'Monday'],
                'Mars': ['Tuesday', 'Thursday'],
                'Jupiter': ['Thursday', 'Sunday'],
                'Saturn': ['Saturday', 'Tuesday'],
                'Moon': ['Monday', 'Friday'],
                'Sun': ['Sunday', 'Wednesday']
            }
            
            for influence in astro_influences:
                if influence in astro_days:
                    best_days.extend(astro_days[influence])
        
        # Remove duplicates and return top 3
        return list(set(best_days))[:3] if best_days else ['Follow your intuition for timing']
    
    def _get_lunar_advice(self, placements: List[Dict]) -> str:
        """Get lunar phase advice based on reading energy"""
        elements = [p['card']['element'] for p in placements]
        element_count = {elem: elements.count(elem) for elem in set(elements)}
        
        if not element_count:
            return "Work with the natural lunar rhythms"
        
        dominant_element = max(element_count, key=element_count.get)
        
        lunar_advice = {
            'Fire': "New Moon is powerful for manifestation and action",
            'Water': "Full Moon enhances intuition and emotional clarity", 
            'Air': "First Quarter supports communication and planning",
            'Earth': "Last Quarter is ideal for grounding and release",
            'Spirit': "All lunar phases support your spiritual work"
        }
        
        return lunar_advice.get(dominant_element, "Align your actions with lunar cycles")
    
    def _get_seasonal_guidance(self, placements: List[Dict]) -> str:
        """Get seasonal guidance based on current time and reading energy"""
        current_month = datetime.now().month
        
        seasonal_guidance = {
            (12, 1, 2): "Winter energy supports deep reflection and inner work",
            (3, 4, 5): "Spring energy encourages new growth and fresh starts", 
            (6, 7, 8): "Summer energy amplifies action and manifestation",
            (9, 10, 11): "Autumn energy supports harvest and gratitude"
        }
        
        for months, guidance in seasonal_guidance.items():
            if current_month in months:
                return guidance
        
        return "Align with the natural seasonal energies"
    
    def _get_daily_timing_advice(self, placements: List[Dict]) -> str:
        """Get advice for daily timing based on reading energy"""
        if not placements:
            return "Morning meditation sets positive intentions"
        
        element = placements[0]['card']['element']
        
        timing_advice = {
            'Fire': "Morning hours (6-10 AM) are most powerful for action",
            'Water': "Evening hours (6-10 PM) enhance intuition and reflection",
            'Air': "Midday hours (11 AM - 2 PM) support communication and planning",
            'Earth': "Late afternoon (3-6 PM) is ideal for practical tasks",
            'Spirit': "Dawn and dusk are sacred times for spiritual practice"
        }
        
        return timing_advice.get(element, "Follow your natural energy rhythms")
    
    def _get_numerology_connections(self, placements: List[Dict], user_context: Optional[Dict]) -> Dict[str, Any]:
        """Connect tarot reading with numerological influences"""
        
        # Extract numerological values from cards
        card_numbers = []
        for placement in placements:
            num = placement['card']['cosmic_influences'].get('numerological')
            if num is not None:
                card_numbers.append(num)
        
        if not card_numbers:
            return {'message': 'Focus on the symbolic rather than numerical meanings'}
        
        # Calculate reading's numerological signature
        total_value = sum(card_numbers)
        while total_value > 9 and total_value not in [11, 22, 33]:
            total_value = sum(int(digit) for digit in str(total_value))
        
        # Get user's personal numbers if available
        personal_numbers = {}
        if user_context:
            personal_numbers = {
                'life_path': user_context.get('life_path_number'),
                'personal_year': user_context.get('personal_year_number'),
                'personal_month': user_context.get('personal_month_number')
            }
        
        return {
            'reading_signature': total_value,
            'signature_meaning': self._get_number_meaning(total_value),
            'personal_connections': self._analyze_personal_number_connections(total_value, personal_numbers),
            'numerological_advice': self._get_numerological_advice(total_value, personal_numbers)
        }
    
    def _get_number_meaning(self, number: int) -> str:
        """Get meaning for a numerological number"""
        meanings = {
            1: "New beginnings and leadership energy",
            2: "Partnership and cooperation themes",
            3: "Creative expression and communication", 
            4: "Foundation building and practical matters",
            5: "Change and freedom seeking",
            6: "Nurturing and responsibility",
            7: "Spiritual seeking and inner wisdom",
            8: "Material mastery and achievement",
            9: "Completion and universal service",
            11: "Intuitive illumination and inspiration",
            22: "Master builder and practical visionary",
            33: "Master teacher and healing service"
        }
        
        return meanings.get(number, f"Number {number} brings unique cosmic energy")
    
    def _analyze_personal_number_connections(self, reading_number: int, personal_numbers: Dict) -> List[str]:
        """Analyze connections between reading and personal numbers"""
        connections = []
        
        for num_type, personal_num in personal_numbers.items():
            if personal_num is None:
                continue
                
            if reading_number == personal_num:
                connections.append(f"Reading aligns perfectly with your {num_type.replace('_', ' ')} ({personal_num})")
            elif abs(reading_number - personal_num) <= 2:
                connections.append(f"Reading harmonizes with your {num_type.replace('_', ' ')} energy")
            elif (reading_number + personal_num) % 9 == 0:
                connections.append(f"Reading complements your {num_type.replace('_', ' ')} for completion")
        
        return connections if connections else ["Reading offers fresh numerological perspective"]
    
    def _get_numerological_advice(self, reading_number: int, personal_numbers: Dict) -> str:
        """Get numerological advice based on reading and personal numbers"""
        
        advice_map = {
            1: "This is a time for new initiatives and bold leadership",
            2: "Focus on cooperation and building harmonious relationships", 
            3: "Express yourself creatively and connect with others joyfully",
            4: "Build solid foundations and approach challenges methodically",
            5: "Embrace change and seek new experiences with courage",
            6: "Take on nurturing responsibilities and create beauty",
            7: "Seek inner wisdom through study and contemplation",
            8: "Focus on material goals with ethical consideration",
            9: "Serve others and prepare for new cycles to begin",
            11: "Trust your intuition and inspire others with your vision",
            22: "Build something lasting that serves the greater good",
            33: "Teach and heal others through compassionate service"
        }
        
        return advice_map.get(reading_number, f"The number {reading_number} guides your path forward")
    
    # Utility methods for element and theme analysis
    def _get_elemental_message(self, dominant_element: str, element_distribution: Dict) -> str:
        """Get message based on elemental analysis"""
        messages = {
            'Fire': "Passion and action drive this reading - trust your instincts",
            'Water': "Emotions and intuition flow strongly - listen to your heart",
            'Air': "Mental clarity and communication are key - think and speak clearly", 
            'Earth': "Practical matters and grounding are emphasized - focus on reality",
            'Spirit': "Divine guidance flows through this reading - trust the universe"
        }
        
        return messages.get(dominant_element, "Balance all elements for harmony")
    
    def _get_numerical_message(self, avg_energy: float, energy_range: float) -> str:
        """Get message based on numerical analysis"""
        if avg_energy <= 3:
            return "Foundation and beginning energies dominate - time for new starts"
        elif avg_energy <= 6:
            return "Creative and nurturing energies are strong - express and care"
        elif avg_energy <= 9:
            return "Wisdom and completion energies emerge - integrate and serve"
        else:
            return "Master number energies present - spiritual calling activated"
    
    def _get_element_focus(self, element: str) -> str:
        """Get focus area for dominant element"""
        focuses = {
            'Fire': "passion, creativity, and taking action",
            'Water': "emotions, intuition, and deep connections",
            'Air': "communication, learning, and mental clarity",
            'Earth': "practical matters, stability, and physical health",
            'Spirit': "spiritual growth, divine connection, and higher purpose"
        }
        
        return focuses.get(element, "balanced energy and mindful awareness")

    # Additional methods for API integration
    def get_available_spreads(self) -> List[Dict[str, Any]]:
        """Get all available tarot spreads"""
        return [
            {
                'id': 'single_card',
                'name': 'Single Card',
                'description': 'One card for focused guidance',
                'card_count': 1,
                'complexity': 'beginner'
            },
            {
                'id': 'celtic_cross',
                'name': 'Celtic Cross',
                'description': 'Comprehensive 10-card spread for deep insight',
                'card_count': 10,
                'complexity': 'advanced'
            },
            {
                'id': 'zodiac_wheel',
                'name': 'Zodiac Wheel',
                'description': '12-card spread based on astrological houses',
                'card_count': 12,
                'complexity': 'advanced'
            },
            {
                'id': 'chakra_alignment',
                'name': 'Chakra Alignment',
                'description': '7-card spread for energy center balance',
                'card_count': 7,
                'complexity': 'intermediate'
            },
            {
                'id': 'past_present_future_detailed',
                'name': 'Past Present Future (Detailed)',
                'description': 'Enhanced 9-card timeline spread',
                'card_count': 9,
                'complexity': 'intermediate'
            },
            {
                'id': 'relationship_spread',
                'name': 'Relationship Dynamics',
                'description': '6-card spread for relationship insights',
                'card_count': 6,
                'complexity': 'intermediate'
            }
        ]
    
    def create_enhanced_reading(self, user_id: str, spread_type: str, question: str, 
                               user_profile: Dict[str, Any], reading_intention: str = '') -> Dict[str, Any]:
        """Create a comprehensive enhanced tarot reading"""
        import uuid

        # Generate base reading
        reading = self.generate_reading(spread_type, user_profile)
        
        # Add enhanced metadata
        reading.update({
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'question': question,
            'reading_intention': reading_intention,
            'user_profile': user_profile,
            'created_at': datetime.now().isoformat(),
            'cosmic_timing': self._get_cosmic_timing_advice(reading.get('placements', []), user_profile),
            'numerology_connections': self._get_numerology_connections(reading.get('placements', []), user_profile)
        })
        
        return reading
    
    def get_current_cosmic_influences(self) -> Dict[str, Any]:
        """Get current cosmic influences for enhanced readings"""
        now = datetime.now()
        
        return {
            'lunar_phase': self._get_current_lunar_phase(),
            'astrological_weather': self._get_astrological_weather(now),
            'numerological_day': self._get_numerological_day(now),
            'seasonal_energy': self._get_seasonal_energy(now),
            'planetary_hours': self._get_planetary_hours(now)
        }
    
    def _get_current_lunar_phase(self) -> Dict[str, str]:
        """Get current lunar phase information"""
        # Simplified lunar phase calculation
        day_of_month = datetime.now().day
        
        if day_of_month <= 7:
            phase = "New Moon"
            meaning = "New beginnings and manifestation"
        elif day_of_month <= 14:
            phase = "Waxing Moon"  
            meaning = "Growth and building energy"
        elif day_of_month <= 21:
            phase = "Full Moon"
            meaning = "Culmination and revelation"
        else:
            phase = "Waning Moon"
            meaning = "Release and reflection"
        
        return {'phase': phase, 'meaning': meaning}
    
    def _get_astrological_weather(self, date_time: datetime) -> Dict[str, str]:
        """Get simplified astrological influences"""
        month = date_time.month
        
        zodiac_seasons = {
            1: "Capricorn", 2: "Aquarius", 3: "Pisces", 4: "Aries",
            5: "Taurus", 6: "Gemini", 7: "Cancer", 8: "Leo", 
            9: "Virgo", 10: "Libra", 11: "Scorpio", 12: "Sagittarius"
        }
        
        current_sign = zodiac_seasons.get(month, "Unknown")
        
        return {
            'sun_sign': current_sign,
            'influence': f"{current_sign} season brings focused energy for growth and transformation"
        }
    
    def _get_numerological_day(self, date_time: datetime) -> Dict[str, Any]:
        """Get numerological significance of the day"""
        day_number = date_time.day
        
        # Reduce to single digit or master number
        while day_number > 9 and day_number not in [11, 22, 33]:
            day_number = sum(int(digit) for digit in str(day_number))
        
        return {
            'number': day_number,
            'meaning': self._get_number_meaning(day_number)
        }
    
    def _get_seasonal_energy(self, date_time: datetime) -> Dict[str, str]:
        """Get seasonal energy influence"""
        month = date_time.month
        
        if month in [12, 1, 2]:
            return {'season': 'Winter', 'energy': 'Introspection and deep wisdom'}
        elif month in [3, 4, 5]:
            return {'season': 'Spring', 'energy': 'New growth and fresh possibilities'}
        elif month in [6, 7, 8]:
            return {'season': 'Summer', 'energy': 'Action and manifestation'}
        else:
            return {'season': 'Autumn', 'energy': 'Harvest and gratitude'}
    
    def _get_planetary_hours(self, date_time: datetime) -> Dict[str, str]:
        """Get simplified planetary hour influence"""
        hour = date_time.hour
        
        planetary_hours = {
            (0, 3): "Moon - Intuition and dreams",
            (3, 6): "Saturn - Discipline and structure", 
            (6, 9): "Jupiter - Expansion and wisdom",
            (9, 12): "Mars - Action and courage",
            (12, 15): "Sun - Leadership and vitality",
            (15, 18): "Venus - Love and beauty",
            (18, 21): "Mercury - Communication and learning",
            (21, 24): "Moon - Reflection and rest"
        }
        
        for time_range, influence in planetary_hours.items():
            if time_range[0] <= hour < time_range[1]:
                return {'influence': influence}
        
        return {'influence': 'Universal energy flows'}
    
    def get_daily_guidance(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Get personalized daily tarot guidance"""
        
        # Draw a single card for daily guidance
        daily_card = self.draw_cards(1)[0]
        
        # Create simplified reading for daily use
        guidance = {
            'card': {
                'name': daily_card.name,
                'element': daily_card.element.value,
                'keywords': daily_card.keywords_upright,
                'description': daily_card.description
            },
            'daily_message': f"Today, {daily_card.name} brings {daily_card.keywords_upright[0].lower()} energy",
            'focus_area': self._get_element_focus(daily_card.element.value),
            'affirmation': self._create_daily_affirmation(daily_card),
            'cosmic_timing': self._get_daily_timing_advice([{
                'card': {
                    'element': daily_card.element.value,
                    'cosmic_influences': daily_card.get_cosmic_influences()
                }
            }])
        }
        
        return guidance
    
    def _create_daily_affirmation(self, card: TarotCard) -> str:
        """Create a daily affirmation based on the card"""
        affirmations = {
            'Fire': f"I embrace the {card.keywords_upright[0].lower()} energy of {card.name} and take inspired action",
            'Water': f"I trust my intuition and allow {card.name} to guide my emotional wisdom",
            'Air': f"I communicate clearly and think wisely with the guidance of {card.name}",
            'Earth': f"I ground myself in practical wisdom and manifest with {card.name}'s energy",
            'Spirit': f"I align with divine guidance and embody the sacred energy of {card.name}"
        }
        
        return affirmations.get(card.element.value, f"I am guided by the wisdom of {card.name}")
    
    def generate_enhanced_interpretation(self, reading: Dict[str, Any], focus_area: str, specific_question: str) -> Dict[str, Any]:
        """Generate enhanced AI interpretation for specific focus areas"""
        
        placements = reading.get('placements', [])
        if not placements:
            return {'error': 'No card placements found in reading'}
        
        # Generate focused interpretation
        interpretation = {
            'focus_area': focus_area,
            'specific_question': specific_question,
            'focused_insights': self._generate_focused_insights(placements, focus_area),
            'detailed_analysis': self._generate_detailed_analysis(placements, focus_area, specific_question),
            'practical_advice': self._generate_practical_advice(placements, focus_area),
            'spiritual_guidance': self._generate_spiritual_guidance(placements, {'focus': focus_area}),
            'timing_advice': self._get_timing_for_focus(placements, focus_area)
        }
        
        return interpretation
    
    def _generate_focused_insights(self, placements: List[Dict], focus_area: str) -> List[str]:
        """Generate insights focused on specific area"""
        insights = []
        
        for placement in placements[:3]:  # Focus on first 3 cards
            card = placement['card']
            position = placement['position']
            
            insight = f"{card['name']} in {position['name']} suggests "
            
            if focus_area == 'career':
                insight += f"professional {card['keywords_upright'][0].lower()} is needed"
            elif focus_area == 'love':
                insight += f"romantic {card['keywords_upright'][0].lower()} influences your relationships"
            elif focus_area == 'spiritual':
                insight += f"spiritual {card['keywords_upright'][0].lower()} guides your path"
            elif focus_area == 'health':
                insight += f"holistic {card['keywords_upright'][0].lower()} supports your wellbeing"
            else:
                insight += f"{card['keywords_upright'][0].lower()} energy is prominent"
            
            insights.append(insight)
        
        return insights
    
    def _generate_detailed_analysis(self, placements: List[Dict], focus_area: str, question: str) -> str:
        """Generate detailed analysis for focused question"""
        
        if not placements:
            return "No cards available for analysis"
        
        primary_card = placements[0]['card']
        
        analysis = f"Focusing on {focus_area}, {primary_card['name']} reveals "
        
        if question:
            analysis += f"that your question about '{question}' is answered through "
        
        analysis += f"{primary_card['keywords_upright'][0].lower()} energy. "
        analysis += f"The {primary_card['element']} element suggests "
        
        element_advice = {
            'Fire': "taking bold action and trusting your instincts",
            'Water': "following your emotional wisdom and intuition", 
            'Air': "thinking clearly and communicating effectively",
            'Earth': "taking practical steps and staying grounded",
            'Spirit': "connecting with higher guidance and universal wisdom"
        }
        
        analysis += element_advice.get(primary_card['element'], "balancing all energies mindfully")
        
        return analysis
    
    def _generate_practical_advice(self, placements: List[Dict], focus_area: str) -> List[str]:
        """Generate practical advice for focus area"""
        
        advice = []
        
        if focus_area == 'career':
            advice.extend([
                "Update your resume with recent accomplishments",
                "Network with professionals in your field",
                "Set clear professional goals for the next quarter"
            ])
        elif focus_area == 'love':
            advice.extend([
                "Practice open and honest communication",
                "Make time for romantic gestures and connection",
                "Focus on self-love and personal growth"
            ])
        elif focus_area == 'spiritual':
            advice.extend([
                "Establish a daily meditation practice",
                "Study spiritual texts that resonate with you",
                "Connect with nature for grounding and clarity"
            ])
        elif focus_area == 'health':
            advice.extend([
                "Prioritize consistent sleep and rest",
                "Incorporate mindful movement into your routine",
                "Nourish your body with whole, healing foods"
            ])
        else:
            advice.extend([
                "Trust your inner wisdom and intuition",
                "Take practical steps toward your goals",
                "Maintain balance in all areas of life"
            ])
        
        return advice[:3]  # Return top 3 pieces of advice
    
    def _get_timing_for_focus(self, placements: List[Dict], focus_area: str) -> str:
        """Get timing advice specific to focus area"""
        
        timing_map = {
            'career': "Professional matters are best addressed during weekday business hours",
            'love': "Romantic connections flourish during evening hours and weekends",
            'spiritual': "Dawn and dusk are sacred times for spiritual practice",
            'health': "Morning hours support new health routines and habits"
        }
        
        return timing_map.get(focus_area, "Follow your natural rhythms and energy cycles")
    
    def calculate_reading_statistics(self, readings: List[Dict]) -> Dict[str, Any]:
        """Calculate comprehensive statistics for user's readings"""
        
        if not readings:
            return {
                'total_readings': 0,
                'message': 'No readings found'
            }
        
        # Basic statistics
        stats = {
            'total_readings': len(readings),
            'readings_this_month': len([r for r in readings if self._is_current_month(r.get('created_at'))]),
            'favorite_spread': self._get_most_frequent_spread(readings),
            'most_common_cards': self._get_most_frequent_cards(readings),
            'elemental_distribution': self._calculate_elemental_distribution(readings),
            'reading_patterns': self._analyze_reading_patterns(readings),
            'growth_insights': self._generate_growth_insights(readings)
        }
        
        return stats
    
    def _is_current_month(self, date_str: str) -> bool:
        """Check if date is in current month"""
        if not date_str:
            return False
        
        try:
            reading_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            now = datetime.now()
            return reading_date.month == now.month and reading_date.year == now.year
        except:
            return False
    
    def _get_most_frequent_spread(self, readings: List[Dict]) -> Dict[str, Any]:
        """Get most frequently used spread type"""
        
        spread_counts = {}
        for reading in readings:
            spread_type = reading.get('spread_type', 'unknown')
            spread_counts[spread_type] = spread_counts.get(spread_type, 0) + 1
        
        if not spread_counts:
            return {'type': 'none', 'count': 0}
        
        most_frequent = max(spread_counts, key=spread_counts.get)
        
        return {
            'type': most_frequent,
            'count': spread_counts[most_frequent],
            'percentage': round((spread_counts[most_frequent] / len(readings)) * 100, 1)
        }
    
    def _get_most_frequent_cards(self, readings: List[Dict]) -> List[Dict[str, Any]]:
        """Get most frequently appearing cards"""
        
        card_counts = {}
        
        for reading in readings:
            placements = reading.get('placements', [])
            for placement in placements:
                card_name = placement.get('card', {}).get('name')
                if card_name:
                    card_counts[card_name] = card_counts.get(card_name, 0) + 1
        
        # Sort by frequency and return top 5
        sorted_cards = sorted(card_counts.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {'name': name, 'count': count, 'significance': 'Frequent guide in your journey'}
            for name, count in sorted_cards[:5]
        ]
    
    def _calculate_elemental_distribution(self, readings: List[Dict]) -> Dict[str, Any]:
        """Calculate distribution of elements across all readings"""
        
        element_counts = {'Fire': 0, 'Water': 0, 'Air': 0, 'Earth': 0, 'Spirit': 0}
        total_cards = 0
        
        for reading in readings:
            placements = reading.get('placements', [])
            for placement in placements:
                element = placement.get('card', {}).get('element')
                if element in element_counts:
                    element_counts[element] += 1
                    total_cards += 1
        
        if total_cards == 0:
            return element_counts
        
        # Convert to percentages
        percentages = {
            element: round((count / total_cards) * 100, 1)
            for element, count in element_counts.items()
        }
        
        return {
            'percentages': percentages,
            'dominant_element': max(element_counts, key=element_counts.get),
            'total_cards_analyzed': total_cards
        }
    
    def _analyze_reading_patterns(self, readings: List[Dict]) -> Dict[str, Any]:
        """Analyze patterns in reading frequency and timing"""
        
        if len(readings) < 2:
            return {'message': 'Need more readings to identify patterns'}
        
        # Analyze reading frequency
        dates = []
        for reading in readings:
            date_str = reading.get('created_at')
            if date_str:
                try:
                    dates.append(datetime.fromisoformat(date_str.replace('Z', '+00:00')))
                except:
                    continue
        
        if len(dates) < 2:
            return {'message': 'Insufficient date data for pattern analysis'}
        
        dates.sort()
        intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
        avg_interval = sum(intervals) / len(intervals) if intervals else 0
        
        return {
            'average_days_between_readings': round(avg_interval, 1),
            'reading_frequency': self._categorize_frequency(avg_interval),
            'most_active_period': self._find_most_active_period(dates),
            'consistency_score': self._calculate_consistency_score(intervals)
        }
    
    def _categorize_frequency(self, avg_days: float) -> str:
        """Categorize reading frequency"""
        if avg_days <= 3:
            return 'Very frequent (multiple times per week)'
        elif avg_days <= 7:
            return 'Frequent (weekly)'
        elif avg_days <= 14:
            return 'Regular (bi-weekly)'
        elif avg_days <= 30:
            return 'Occasional (monthly)'
        else:
            return 'Sporadic (less than monthly)'
    
    def _find_most_active_period(self, dates: List[datetime]) -> str:
        """Find the time period with most readings"""
        if not dates:
            return 'No data available'
        
        month_counts = {}
        for date in dates:
            month_key = f"{date.strftime('%B')} {date.year}"
            month_counts[month_key] = month_counts.get(month_key, 0) + 1
        
        most_active = max(month_counts, key=month_counts.get)
        return f"{most_active} ({month_counts[most_active]} readings)"
    
    def _calculate_consistency_score(self, intervals: List[int]) -> Dict[str, Any]:
        """Calculate consistency score for reading practice"""
        if not intervals:
            return {'score': 0, 'rating': 'No data'}
        
        # Lower variance indicates more consistency
        avg = sum(intervals) / len(intervals)
        variance = sum((x - avg) ** 2 for x in intervals) / len(intervals)
        
        # Normalize to 0-100 scale (lower variance = higher consistency)
        consistency_score = max(0, 100 - variance)
        
        if consistency_score >= 80:
            rating = 'Highly consistent'
        elif consistency_score >= 60:
            rating = 'Moderately consistent'
        elif consistency_score >= 40:
            rating = 'Somewhat consistent'
        else:
            rating = 'Inconsistent'
        
        return {
            'score': round(consistency_score, 1),
            'rating': rating
        }
    
    def _generate_growth_insights(self, readings: List[Dict]) -> List[str]:
        """Generate insights about user's growth journey"""
        
        insights = []
        
        if len(readings) >= 5:
            insights.append("You've developed a meaningful tarot practice")
        
        if len(readings) >= 10:
            insights.append("Your consistent readings show dedication to self-discovery")
        
        if len(readings) >= 20:
            insights.append("You're building substantial wisdom through regular practice")
        
        # Analyze recent vs. older readings for growth patterns
        if len(readings) >= 6:
            recent_readings = readings[-3:]
            older_readings = readings[:3]
            
            recent_questions = [r.get('question', '') for r in recent_readings]
            older_questions = [r.get('question', '') for r in older_readings]
            
            if any('future' in q.lower() for q in recent_questions):
                insights.append("You're increasingly focused on future planning and goals")
            
            if any('relationship' in q.lower() for q in recent_questions):
                insights.append("Relationships are becoming a key area of focus in your readings")
        
        if not insights:
            insights.append("Continue your practice to unlock deeper insights")
        
        return insights

# Global instance for use in API endpoints
enhanced_tarot_engine = EnhancedTarotEngine()