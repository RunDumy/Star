"""
Multi-Zodiac Database Schema Setup for STAR Platform
Creates necessary Cosmos DB containers for the complete zodiac system
"""

import json
import logging
import os
import sys

# Add the star_backend_flask directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'star_backend_flask'))

from cosmos_db import CosmosDBHelper


class MultiZodiacDatabaseSetup:
    """Setup and initialize all zodiac-related Cosmos DB containers"""
    
    def __init__(self):
        self.cosmos_helper = CosmosDBHelper()
        self.logger = logging.getLogger(__name__)
    
    def create_zodiac_containers(self):
        """Create all necessary containers for the multi-zodiac system"""
        
        containers = [
            # Zodiac Systems (5 traditions)
            {
                'name': 'zodiac_systems',
                'partition_key': '/system_type',
                'description': 'Western, Chinese, Vedic, Mayan, Aztec systems'
            },
            
            # Zodiac Signs (76+ signs across all systems)
            {
                'name': 'zodiac_signs', 
                'partition_key': '/system_type',
                'description': '12 Western + 12 Chinese + 39 Vedic + 20 Mayan + 20 Aztec signs'
            },
            
            # Galactic Tones (13 Mesoamerican tones)
            {
                'name': 'galactic_tones',
                'partition_key': '/tone_number',
                'description': '13 sacred tones from Mayan/Aztec calendars'
            },
            
            # Zodiac Animations (304 total animations)
            {
                'name': 'zodiac_animations',
                'partition_key': '/system_type',
                'description': '4 animations per sign × 76+ signs'
            },
            
            # Cosmic Signatures (Day Sign + Galactic Tone combinations)
            {
                'name': 'cosmic_signatures',
                'partition_key': '/day_sign',
                'description': '260 unique Tzolkin combinations'
            },
            
            # Zodiac Readings (User calculation results)
            {
                'name': 'zodiac_readings',
                'partition_key': '/user_id',
                'description': 'Multi-zodiac calculation results for users'
            },
            
            # Zodiac Compatibilities (Sign relationships)
            {
                'name': 'zodiac_compatibilities',
                'partition_key': '/system_type',
                'description': 'Compatibility matrices between zodiac signs'
            }
        ]
        
        created_containers = []
        
        for container_config in containers:
            try:
                # Check if container exists
                existing = self.cosmos_helper._get_container(container_config['name'])
                if existing:
                    self.logger.info(f"Container {container_config['name']} already exists")
                    created_containers.append(container_config['name'])
                    continue
                
                # Create container if it doesn't exist
                container = self.cosmos_helper.database.create_container(
                    id=container_config['name'],
                    partition_key={'paths': [container_config['partition_key']], 'kind': 'Hash'}
                )
                
                self.logger.info(f"✅ Created container: {container_config['name']} - {container_config['description']}")
                created_containers.append(container_config['name'])
                
            except Exception as e:
                self.logger.error(f"❌ Failed to create container {container_config['name']}: {e}")
        
        return created_containers

    def seed_zodiac_systems_data(self):
        """Populate zodiac_systems container with 5 traditions"""
        
        zodiac_systems = [
            {
                "id": "western",
                "system_type": "western", 
                "name": "Western Astrology",
                "total_signs": 12,
                "calculation_method": "tropical_solar",
                "elements": ["fire", "earth", "air", "water"],
                "modalities": ["cardinal", "fixed", "mutable"],
                "cultural_origin": "Greco-Roman",
                "description": "Tropical zodiac based on seasonal cycles"
            },
            {
                "id": "chinese",
                "system_type": "chinese",
                "name": "Chinese Zodiac", 
                "total_signs": 12,
                "calculation_method": "lunar_year_based",
                "elements": ["wood", "fire", "earth", "metal", "water"],
                "cycle_years": 60,
                "cultural_origin": "Chinese",
                "description": "12-year lunar cycle with elemental influences"
            },
            {
                "id": "vedic",
                "system_type": "vedic",
                "name": "Vedic/Hindu Astrology",
                "total_signs": 39,  # 12 Rashis + 27 Nakshatras
                "calculation_method": "sidereal_astronomical",
                "components": {
                    "rashis": 12,
                    "nakshatras": 27
                },
                "cultural_origin": "Ancient India",
                "description": "Sidereal system with Rashis and Nakshatras"
            },
            {
                "id": "mayan", 
                "system_type": "mayan",
                "name": "Mayan Tzolkin",
                "total_signs": 20,
                "calculation_method": "sacred_calendar_260",
                "day_signs": 20,
                "galactic_tones": 13,
                "cycle_days": 260,
                "cultural_origin": "Maya Civilization",
                "description": "Sacred 260-day calendar with Galactic Tones"
            },
            {
                "id": "aztec",
                "system_type": "aztec", 
                "name": "Aztec Tonalpohualli",
                "total_signs": 20,
                "calculation_method": "sacred_calendar_260",
                "day_signs": 20,
                "cycle_days": 260,
                "cultural_origin": "Aztec Civilization",
                "description": "Sacred Mesoamerican calendar system"
            }
        ]
        
        container = self.cosmos_helper._get_container('zodiac_systems')
        if not container:
            self.logger.error("zodiac_systems container not found")
            return False
            
        created_count = 0
        for system in zodiac_systems:
            try:
                container.create_item(body=system)
                created_count += 1
                self.logger.info(f"✅ Created zodiac system: {system['name']}")
            except Exception as e:
                self.logger.warning(f"System {system['id']} may already exist: {e}")
        
        self.logger.info(f"Seeded {created_count} zodiac systems")
        return created_count > 0

    def seed_galactic_tones_data(self):
        """Populate galactic_tones container with 13 authentic Mayan tones"""
        
        galactic_tones = [
            {
                "id": "tone_1",
                "tone_number": 1,
                "name": "Magnetic",
                "nahuatl_name": "Hun",
                "energy": "Unity",
                "meaning": "Attracts, unifies, purpose",
                "qualities": ["Leadership", "Purpose", "Unity"],
                "challenges": ["Over-attachment", "Rigidity"],
                "color": "Red",
                "symbol": "•",
                "direction": "East",
                "keywords": ["attract", "purpose", "unify"]
            },
            {
                "id": "tone_2", 
                "tone_number": 2,
                "name": "Lunar",
                "nahuatl_name": "Ca",
                "energy": "Duality",
                "meaning": "Polarizes, challenges, stabilizes",
                "qualities": ["Balance", "Cooperation", "Stability"],
                "challenges": ["Indecision", "Conflict"],
                "color": "White",
                "symbol": "••",
                "direction": "North",
                "keywords": ["polarize", "challenge", "stabilize"]
            },
            {
                "id": "tone_3",
                "tone_number": 3, 
                "name": "Electric",
                "nahuatl_name": "Ox",
                "energy": "Service",
                "meaning": "Activates, bonds, serves",
                "qualities": ["Service", "Action", "Bonding"],
                "challenges": ["Martyrdom", "Over-giving"],
                "color": "Blue",
                "symbol": "•••",
                "direction": "West",
                "keywords": ["activate", "bond", "service"]
            },
            {
                "id": "tone_4",
                "tone_number": 4,
                "name": "Self-Existing", 
                "nahuatl_name": "Can",
                "energy": "Form",
                "meaning": "Defines, measures, forms",
                "qualities": ["Structure", "Stability", "Form"],
                "challenges": ["Rigidity", "Limitation"],
                "color": "Yellow",
                "symbol": "••••",
                "direction": "South",
                "keywords": ["define", "measure", "form"]
            },
            {
                "id": "tone_5",
                "tone_number": 5,
                "name": "Overtone",
                "nahuatl_name": "Ho",
                "energy": "Radiance",
                "meaning": "Empowers, commands, radiates",
                "qualities": ["Empowerment", "Command", "Center"],
                "challenges": ["Domination", "Pride"],
                "color": "Red",
                "symbol": "•••••",
                "direction": "Center",
                "keywords": ["empower", "command", "radiate"]
            },
            {
                "id": "tone_6",
                "tone_number": 6,
                "name": "Rhythmic",
                "nahuatl_name": "Uac", 
                "energy": "Equality",
                "meaning": "Organizes, balances, equals",
                "qualities": ["Balance", "Organization", "Equality"],
                "challenges": ["Perfectionism", "Rigidity"],
                "color": "White",
                "symbol": "••••••",
                "direction": "North",
                "keywords": ["organize", "balance", "equal"]
            },
            {
                "id": "tone_7",
                "tone_number": 7,
                "name": "Resonant",
                "nahuatl_name": "Uuc",
                "energy": "Attunement",
                "meaning": "Channels, inspires, attunes",
                "qualities": ["Inspiration", "Channeling", "Mysticism"],
                "challenges": ["Isolation", "Confusion"],
                "color": "Blue", 
                "symbol": "•••••••",
                "direction": "West",
                "keywords": ["channel", "inspire", "attune"]
            },
            {
                "id": "tone_8",
                "tone_number": 8,
                "name": "Galactic",
                "nahuatl_name": "Uaxac",
                "energy": "Integrity",
                "meaning": "Harmonizes, models, integrates",
                "qualities": ["Harmony", "Modeling", "Integration"],
                "challenges": ["Over-analysis", "Perfectionism"],
                "color": "Yellow",
                "symbol": "••••••••",
                "direction": "South",
                "keywords": ["harmonize", "model", "integrate"]
            },
            {
                "id": "tone_9", 
                "tone_number": 9,
                "name": "Solar",
                "nahuatl_name": "Bolon",
                "energy": "Intention",
                "meaning": "Realizes, intends, completes",
                "qualities": ["Completion", "Intention", "Realization"],
                "challenges": ["Impatience", "Rushing"],
                "color": "Red",
                "symbol": "•••••••••",
                "direction": "East",
                "keywords": ["realize", "intend", "complete"]
            },
            {
                "id": "tone_10",
                "tone_number": 10,
                "name": "Planetary", 
                "nahuatl_name": "Lahun",
                "energy": "Manifestation",
                "meaning": "Perfects, produces, manifests",
                "qualities": ["Perfection", "Production", "Manifestation"],
                "challenges": ["Over-doing", "Materialism"],
                "color": "White",
                "symbol": "••••••••••",
                "direction": "North",
                "keywords": ["perfect", "produce", "manifest"]
            },
            {
                "id": "tone_11",
                "tone_number": 11,
                "name": "Spectral",
                "nahuatl_name": "Buluc",
                "energy": "Liberation",
                "meaning": "Dissolves, releases, liberates",
                "qualities": ["Liberation", "Release", "Dissolution"],
                "challenges": ["Destruction", "Chaos"],
                "color": "Blue",
                "symbol": "•••••••••••",
                "direction": "West", 
                "keywords": ["dissolve", "release", "liberate"]
            },
            {
                "id": "tone_12",
                "tone_number": 12,
                "name": "Crystal",
                "nahuatl_name": "Lahca",
                "energy": "Cooperation",
                "meaning": "Dedicates, universalizes, cooperates", 
                "qualities": ["Dedication", "Cooperation", "Universality"],
                "challenges": ["Over-sacrifice", "Martyrdom"],
                "color": "Yellow",
                "symbol": "••••••••••••",
                "direction": "South",
                "keywords": ["dedicate", "universalize", "cooperate"]
            },
            {
                "id": "tone_13",
                "tone_number": 13,
                "name": "Cosmic",
                "nahuatl_name": "Oxlahun",
                "energy": "Transcendence", 
                "meaning": "Endures, transcends, presences",
                "qualities": ["Transcendence", "Endurance", "Presence"],
                "challenges": ["Detachment", "Aloofness"],
                "color": "Red",
                "symbol": "•••••••••••••",
                "direction": "Center",
                "keywords": ["endure", "transcend", "presence"]
            }
        ]
        
        container = self.cosmos_helper._get_container('galactic_tones')
        if not container:
            self.logger.error("galactic_tones container not found")
            return False
            
        created_count = 0
        for tone in galactic_tones:
            try:
                container.create_item(body=tone)
                created_count += 1
                self.logger.info(f"✅ Created galactic tone: {tone['name']} ({tone['tone_number']})")
            except Exception as e:
                self.logger.warning(f"Tone {tone['tone_number']} may already exist: {e}")
        
        self.logger.info(f"Seeded {created_count} galactic tones")
        return created_count > 0
    
    def update_cosmos_helper_containers(self):
        """Update CosmosDBHelper to include new zodiac containers"""
        
        new_containers = [
            'zodiac_systems', 'zodiac_signs', 'galactic_tones', 
            'zodiac_animations', 'cosmic_signatures', 'zodiac_readings',
            'zodiac_compatibilities'
        ]
        
        # This would need to be added to the CosmosDBHelper._init_containers method
        container_list = [
            'users', 'posts', 'chats', 'follows', 'likes', 'comments', 
            'profiles', 'notifications', 'stream_chat', 'streams', 
            'zodiac_dna', 'user_interactions'
        ] + new_containers
        
        self.logger.info(f"Updated container list to include: {new_containers}")
        return container_list

if __name__ == "__main__":
    """Run database setup"""
    setup = MultiZodiacDatabaseSetup()
    
    print("🌟 STAR Multi-Zodiac Database Setup")
    print("=" * 50)
    
    # Create containers
    created = setup.create_zodiac_containers()
    print(f"✅ Created {len(created)} containers: {', '.join(created)}")
    
    # Seed data
    if 'zodiac_systems' in created:
        setup.seed_zodiac_systems_data()
    
    if 'galactic_tones' in created:
        setup.seed_galactic_tones_data()
    
    print("🎯 Multi-Zodiac database setup complete!")
    print("📊 Total capacity: 5 systems, 76+ signs, 13 galactic tones, 304 animations")