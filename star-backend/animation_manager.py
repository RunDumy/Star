"""
Animation Manager for STAR Multi-Zodiac System
Handles 304 zodiac-specific social action animations (4 per sign × 76+ signs)
Supports Western, Chinese, Vedic, Mayan, Aztec zodiac systems
"""

import json
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple


class AnimationType(Enum):
    """Social action animation types"""
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow" 
    SHARE = "share"


class ZodiacSystemType(Enum):
    """Supported zodiac systems"""
    WESTERN = "western"
    CHINESE = "chinese"
    VEDIC = "vedic"
    MAYAN = "mayan"
    AZTEC = "aztec"


@dataclass
class ZodiacAnimation:
    """Individual zodiac animation definition"""
    id: str
    sign_id: str
    system_type: ZodiacSystemType
    animation_type: AnimationType
    animation_name: str
    css_class: str
    duration_ms: int
    trigger_phrase: str
    particle_effects: List[str]
    sound_effect: Optional[str]
    color_scheme: List[str]
    model_3d_path: Optional[str]
    is_premium: bool = False


class ZodiacAnimationManager:
    """Manages all zodiac animation definitions and triggers"""
    
    def __init__(self):
        self.animations: Dict[str, ZodiacAnimation] = {}
        self.animations_by_system: Dict[ZodiacSystemType, Dict[str, List[ZodiacAnimation]]] = {}
        self.animations_by_type: Dict[AnimationType, List[ZodiacAnimation]] = {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize animation registry
        self._initialize_zodiac_animations()
    
    def _initialize_zodiac_animations(self):
        """Initialize all 304 zodiac animations"""
        
        # Western Zodiac Animations (12 signs × 4 animations = 48)
        western_signs = [
            ("aries", "♈", "Aries", ["#ff4757", "#ff3838"]),
            ("taurus", "♉", "Taurus", ["#2ed573", "#1e90ff"]),
            ("gemini", "♊", "Gemini", ["#ffa502", "#ff6348"]),
            ("cancer", "♋", "Cancer", ["#70a1ff", "#5352ed"]),
            ("leo", "♌", "Leo", ["#ff9f43", "#ee5a24"]),
            ("virgo", "♍", "Virgo", ["#26de81", "#20bf6b"]),
            ("libra", "♎", "Libra", ["#a55eea", "#8854d0"]),
            ("scorpio", "♏", "Scorpio", ["#fd79a8", "#e84393"]),
            ("sagittarius", "♐", "Sagittarius", ["#fdcb6e", "#e17055"]),
            ("capricorn", "♑", "Capricorn", ["#6c5ce7", "#a29bfe"]),
            ("aquarius", "♒", "Aquarius", ["#74b9ff", "#0984e3"]),
            ("pisces", "♓", "Pisces", ["#81ecec", "#00b894"])
        ]
        
        self._generate_western_animations(western_signs)
        
        # Chinese Zodiac Animations (12 signs × 4 animations = 48)
        chinese_signs = [
            ("rat", "🐭", "Rat", ["#2d3436", "#636e72"]),
            ("ox", "🐮", "Ox", ["#d63031", "#74b9ff"]),
            ("tiger", "🐅", "Tiger", ["#e17055", "#fd79a8"]),
            ("rabbit", "🐰", "Rabbit", ["#00b894", "#55a3ff"]),
            ("dragon", "🐉", "Dragon", ["#fdcb6e", "#f39c12"]),
            ("snake", "🐍", "Snake", ["#6c5ce7", "#a29bfe"]),
            ("horse", "🐴", "Horse", ["#fd79a8", "#e84393"]),
            ("goat", "🐐", "Goat", ["#81ecec", "#74b9ff"]),
            ("monkey", "🐵", "Monkey", ["#ffeaa7", "#fab1a0"]),
            ("rooster", "🐓", "Rooster", ["#ff7675", "#fd79a8"]),
            ("dog", "🐕", "Dog", ["#a29bfe", "#74b9ff"]),
            ("pig", "🐷", "Pig", ["#fd79a8", "#e84393"])
        ]
        
        self._generate_chinese_animations(chinese_signs)
        
        # Vedic Zodiac Animations (39 signs × 4 animations = 156)
        vedic_signs = [
            # Nakshatras (27) + Rashis (12) = 39 total
            ("ashwini", "🐎", "Ashwini", ["#ff4757", "#ff6b7d"]),
            ("bharani", "🌟", "Bharani", ["#ffa502", "#ff9f43"]),
            ("krittika", "🔥", "Krittika", ["#ff6348", "#ff3838"]),
            ("rohini", "🌹", "Rohini", ["#ff9ff3", "#f368e0"]),
            ("mrigashira", "🦌", "Mrigashira", ["#7bed9f", "#70a1ff"]),
            ("ardra", "💧", "Ardra", ["#70a1ff", "#5352ed"]),
            ("punarvasu", "🏹", "Punarvasu", ["#ffa502", "#ff6348"]),
            ("pushya", "🌸", "Pushya", ["#ff9ff3", "#fd79a8"]),
            ("ashlesha", "🐍", "Ashlesha", ["#a55eea", "#8854d0"]),
            ("magha", "👑", "Magha", ["#fdcb6e", "#f39c12"]),
            ("purva_phalguni", "🌞", "Purva Phalguni", ["#ff9f43", "#ee5a24"]),
            ("uttara_phalguni", "🌅", "Uttara Phalguni", ["#ffeaa7", "#fab1a0"]),
            ("hasta", "✋", "Hasta", ["#81ecec", "#74b9ff"]),
            ("chitra", "💎", "Chitra", ["#fd79a8", "#e84393"]),
            ("swati", "🍃", "Swati", ["#7bed9f", "#2ed573"]),
            ("vishakha", "🌿", "Vishakha", ["#26de81", "#20bf6b"]),
            ("anuradha", "⭐", "Anuradha", ["#a55eea", "#8854d0"]),
            ("jyeshtha", "👴", "Jyeshtha", ["#fd79a8", "#e84393"]),
            ("mula", "🌳", "Mula", ["#6c5ce7", "#a29bfe"]),
            ("purva_ashadha", "🏆", "Purva Ashadha", ["#fdcb6e", "#f39c12"]),
            ("uttara_ashadha", "🏔️", "Uttara Ashadha", ["#74b9ff", "#0984e3"]),
            ("shravana", "👂", "Shravana", ["#81ecec", "#00cec9"]),
            ("dhanishtha", "🥁", "Dhanishtha", ["#ffeaa7", "#fdcb6e"]),
            ("shatabhisha", "💫", "Shatabhisha", ["#a29bfe", "#6c5ce7"]),
            ("purva_bhadrapada", "⚡", "Purva Bhadrapada", ["#ff7675", "#fd79a8"]),
            ("uttara_bhadrapada", "🌊", "Uttara Bhadrapada", ["#74b9ff", "#0984e3"]),
            ("revati", "🐠", "Revati", ["#81ecec", "#00b894"])
        ]
        
        # Add 12 Vedic Rashis 
        vedic_rashis = [
            ("mesha", "♈", "Mesha (Aries)", ["#ff4757", "#ff3838"]),
            ("vrishaba", "♉", "Vrishaba (Taurus)", ["#2ed573", "#20bf6b"]),
            ("mithuna", "♊", "Mithuna (Gemini)", ["#ffa502", "#ff6348"]),
            ("karka", "♋", "Karka (Cancer)", ["#70a1ff", "#5352ed"]),
            ("simha", "♌", "Simha (Leo)", ["#ff9f43", "#ee5a24"]),
            ("kanya", "♍", "Kanya (Virgo)", ["#26de81", "#20bf6b"]),
            ("tula", "♎", "Tula (Libra)", ["#a55eea", "#8854d0"]),
            ("vrishchika", "♏", "Vrishchika (Scorpio)", ["#fd79a8", "#e84393"]),
            ("dhanu", "♐", "Dhanu (Sagittarius)", ["#fdcb6e", "#e17055"]),
            ("makara", "♑", "Makara (Capricorn)", ["#6c5ce7", "#a29bfe"]),
            ("kumbha", "♒", "Kumbha (Aquarius)", ["#74b9ff", "#0984e3"]),
            ("meena", "♓", "Meena (Pisces)", ["#81ecec", "#00b894"])
        ]
        
        vedic_all = vedic_signs + vedic_rashis
        self._generate_vedic_animations(vedic_all)
        
        # Mayan Zodiac Animations (20 day signs × 4 animations = 80)
        mayan_signs = [
            ("imix", "🐊", "Imix (Crocodile)", ["#e17055", "#d63031"]),
            ("ik", "💨", "Ik (Wind)", ["#74b9ff", "#0984e3"]),
            ("akbal", "🌙", "Akbal (Night)", ["#2d3436", "#636e72"]),
            ("kan", "🌽", "Kan (Seed)", ["#fdcb6e", "#f39c12"]),
            ("chicchan", "🐍", "Chicchan (Serpent)", ["#00b894", "#00cec9"]),
            ("cimi", "💀", "Cimi (Death)", ["#636e72", "#2d3436"]),
            ("manik", "✋", "Manik (Hand)", ["#fd79a8", "#e84393"]),
            ("lamat", "⭐", "Lamat (Star)", ["#ffeaa7", "#fdcb6e"]),
            ("muluc", "💧", "Muluc (Water)", ["#81ecec", "#74b9ff"]),
            ("oc", "🐕", "Oc (Dog)", ["#a29bfe", "#6c5ce7"]),
            ("chuen", "🐵", "Chuen (Monkey)", ["#fab1a0", "#e17055"]),
            ("eb", "🌿", "Eb (Grass)", ["#7bed9f", "#2ed573"]),
            ("ben", "🌱", "Ben (Reed)", ["#26de81", "#20bf6b"]),
            ("ix", "🐆", "Ix (Jaguar)", ["#ff7675", "#d63031"]),
            ("men", "🦅", "Men (Eagle)", ["#fd79a8", "#e84393"]),
            ("cib", "🕯️", "Cib (Candle)", ["#ffeaa7", "#fdcb6e"]),
            ("caban", "🌍", "Caban (Earth)", ["#6c5ce7", "#a29bfe"]),
            ("etznab", "🗡️", "Etznab (Flint)", ["#636e72", "#2d3436"]),
            ("cauac", "⚡", "Cauac (Storm)", ["#70a1ff", "#5352ed"]),
            ("ahau", "🌞", "Ahau (Sun)", ["#ff9f43", "#ee5a24"])
        ]
        
        self._generate_mayan_animations(mayan_signs)
        
        # Aztec Zodiac Animations (20 day signs × 4 animations = 80)
        aztec_signs = [
            ("cipactli", "🐊", "Cipactli (Crocodile)", ["#e17055", "#d63031"]),
            ("ehecatl", "💨", "Ehecatl (Wind)", ["#74b9ff", "#0984e3"]),
            ("calli", "🏠", "Calli (House)", ["#a29bfe", "#6c5ce7"]),
            ("cuetzpalin", "🦎", "Cuetzpalin (Lizard)", ["#7bed9f", "#2ed573"]),
            ("coatl", "🐍", "Coatl (Serpent)", ["#00b894", "#00cec9"]),
            ("miquiztli", "💀", "Miquiztli (Death)", ["#636e72", "#2d3436"]),
            ("mazatl", "🦌", "Mazatl (Deer)", ["#fab1a0", "#e17055"]),
            ("tochtli", "🐰", "Tochtli (Rabbit)", ["#fd79a8", "#f368e0"]),
            ("atl", "💧", "Atl (Water)", ["#81ecec", "#74b9ff"]),
            ("itzcuintli", "🐕", "Itzcuintli (Dog)", ["#a29bfe", "#6c5ce7"]),
            ("ozomatli", "🐵", "Ozomatli (Monkey)", ["#fab1a0", "#e17055"]),
            ("malinalli", "🌿", "Malinalli (Grass)", ["#7bed9f", "#2ed573"]),
            ("acatl", "🌱", "Acatl (Reed)", ["#26de81", "#20bf6b"]),
            ("ocelotl", "🐆", "Ocelotl (Jaguar)", ["#ff7675", "#d63031"]),
            ("cuauhtli", "🦅", "Cuauhtli (Eagle)", ["#fd79a8", "#e84393"]),
            ("cozcacuauhtli", "🦅", "Cozcacuauhtli (Vulture)", ["#636e72", "#2d3436"]),
            ("ollin", "🌍", "Ollin (Movement)", ["#fdcb6e", "#f39c12"]),
            ("tecpatl", "🗡️", "Tecpatl (Flint)", ["#636e72", "#2d3436"]),
            ("quiahuitl", "⚡", "Quiahuitl (Rain)", ["#70a1ff", "#5352ed"]),
            ("xochitl", "🌺", "Xochitl (Flower)", ["#ff9ff3", "#fd79a8"])
        ]
        
        self._generate_aztec_animations(aztec_signs)
        
        self.logger.info(f"Initialized {len(self.animations)} zodiac animations across 5 systems")
    
    def _generate_western_animations(self, signs: List[Tuple[str, str, str, List[str]]]):
        """Generate animations for Western zodiac signs"""
        for sign_key, symbol, name, colors in signs:
            sign_id = f"western_{sign_key}"
            
            # LIKE animation
            like_anim = ZodiacAnimation(
                id=f"{sign_id}_like",
                sign_id=sign_id,
                system_type=ZodiacSystemType.WESTERN,
                animation_type=AnimationType.LIKE,
                animation_name=f"{name} Stellar Like",
                css_class=f"zodiac-like-{sign_key}",
                duration_ms=1200,
                trigger_phrase=f"✨ {name} sends cosmic love! ✨",
                particle_effects=["stars", "sparkles", "constellation"],
                sound_effect=f"western_{sign_key}_like.mp3",
                color_scheme=colors,
                model_3d_path=f"models/western/{sign_key}_like.glb"
            )
            
            # COMMENT animation
            comment_anim = ZodiacAnimation(
                id=f"{sign_id}_comment",
                sign_id=sign_id,
                system_type=ZodiacSystemType.WESTERN,
                animation_type=AnimationType.COMMENT,
                animation_name=f"{name} Wisdom Share",
                css_class=f"zodiac-comment-{sign_key}",
                duration_ms=1500,
                trigger_phrase=f"🌟 {name} shares celestial wisdom! 🌟",
                particle_effects=["thought-bubbles", "cosmic-dust"],
                sound_effect=f"western_{sign_key}_comment.mp3",
                color_scheme=colors,
                model_3d_path=f"models/western/{sign_key}_comment.glb"
            )
            
            # FOLLOW animation
            follow_anim = ZodiacAnimation(
                id=f"{sign_id}_follow",
                sign_id=sign_id,
                system_type=ZodiacSystemType.WESTERN,
                animation_type=AnimationType.FOLLOW,
                animation_name=f"{name} Cosmic Bond",
                css_class=f"zodiac-follow-{sign_key}",
                duration_ms=2000,
                trigger_phrase=f"🌌 {name} creates a cosmic connection! 🌌",
                particle_effects=["energy-link", "constellation-bridge"],
                sound_effect=f"western_{sign_key}_follow.mp3",
                color_scheme=colors,
                model_3d_path=f"models/western/{sign_key}_follow.glb"
            )
            
            # SHARE animation
            share_anim = ZodiacAnimation(
                id=f"{sign_id}_share",
                sign_id=sign_id,
                system_type=ZodiacSystemType.WESTERN,
                animation_type=AnimationType.SHARE,
                animation_name=f"{name} Stellar Broadcast",
                css_class=f"zodiac-share-{sign_key}",
                duration_ms=1800,
                trigger_phrase=f"⭐ {name} broadcasts across the cosmos! ⭐",
                particle_effects=["energy-waves", "star-burst"],
                sound_effect=f"western_{sign_key}_share.mp3",
                color_scheme=colors,
                model_3d_path=f"models/western/{sign_key}_share.glb"
            )
            
            # Register animations
            for anim in [like_anim, comment_anim, follow_anim, share_anim]:
                self._register_animation(anim)
    
    def _generate_chinese_animations(self, signs: List[Tuple[str, str, str, List[str]]]):
        """Generate animations for Chinese zodiac signs"""
        for sign_key, symbol, name, colors in signs:
            sign_id = f"chinese_{sign_key}"
            
            # LIKE animation - with Chinese cultural elements
            like_anim = ZodiacAnimation(
                id=f"{sign_id}_like",
                sign_id=sign_id,
                system_type=ZodiacSystemType.CHINESE,
                animation_type=AnimationType.LIKE,
                animation_name=f"{name} Fortune Like",
                css_class=f"chinese-like-{sign_key}",
                duration_ms=1300,
                trigger_phrase=f"🧧 {name} brings fortune and luck! 🧧",
                particle_effects=["fortune-coins", "lucky-bamboo", "cherry-blossoms"],
                sound_effect=f"chinese_{sign_key}_like.mp3",
                color_scheme=colors,
                model_3d_path=f"models/chinese/{sign_key}_like.glb"
            )
            
            # COMMENT animation
            comment_anim = ZodiacAnimation(
                id=f"{sign_id}_comment",
                sign_id=sign_id,
                system_type=ZodiacSystemType.CHINESE,
                animation_type=AnimationType.COMMENT,
                animation_name=f"{name} Ancient Wisdom",
                css_class=f"chinese-comment-{sign_key}",
                duration_ms=1600,
                trigger_phrase=f"📜 {name} shares ancient wisdom! 📜",
                particle_effects=["scroll-unfurl", "calligraphy-brush"],
                sound_effect=f"chinese_{sign_key}_comment.mp3",
                color_scheme=colors,
                model_3d_path=f"models/chinese/{sign_key}_comment.glb"
            )
            
            # FOLLOW animation
            follow_anim = ZodiacAnimation(
                id=f"{sign_id}_follow",
                sign_id=sign_id,
                system_type=ZodiacSystemType.CHINESE,
                animation_type=AnimationType.FOLLOW,
                animation_name=f"{name} Harmony Bond",
                css_class=f"chinese-follow-{sign_key}",
                duration_ms=2200,
                trigger_phrase=f"☯️ {name} creates perfect harmony! ☯️",
                particle_effects=["yin-yang-flow", "dragon-dance"],
                sound_effect=f"chinese_{sign_key}_follow.mp3",
                color_scheme=colors,
                model_3d_path=f"models/chinese/{sign_key}_follow.glb"
            )
            
            # SHARE animation
            share_anim = ZodiacAnimation(
                id=f"{sign_id}_share",
                sign_id=sign_id,
                system_type=ZodiacSystemType.CHINESE,
                animation_type=AnimationType.SHARE,
                animation_name=f"{name} Festival Share",
                css_class=f"chinese-share-{sign_key}",
                duration_ms=1900,
                trigger_phrase=f"🎊 {name} celebrates and shares joy! 🎊",
                particle_effects=["lanterns-float", "fireworks"],
                sound_effect=f"chinese_{sign_key}_share.mp3",
                color_scheme=colors,
                model_3d_path=f"models/chinese/{sign_key}_share.glb"
            )
            
            # Register animations
            for anim in [like_anim, comment_anim, follow_anim, share_anim]:
                self._register_animation(anim)
    
    def _generate_vedic_animations(self, signs: List[Tuple[str, str, str, List[str]]]):
        """Generate animations for Vedic zodiac signs"""
        for sign_key, symbol, name, colors in signs:
            sign_id = f"vedic_{sign_key}"
            
            # LIKE animation - with Sanskrit/Vedic elements
            like_anim = ZodiacAnimation(
                id=f"{sign_id}_like",
                sign_id=sign_id,
                system_type=ZodiacSystemType.VEDIC,
                animation_type=AnimationType.LIKE,
                animation_name=f"{name} Dharma Like",
                css_class=f"vedic-like-{sign_key}",
                duration_ms=1400,
                trigger_phrase=f"🕉️ {name} blesses with divine love! 🕉️",
                particle_effects=["sacred-geometry", "lotus-petals", "mantra-vibrations"],
                sound_effect=f"vedic_{sign_key}_like.mp3",
                color_scheme=colors,
                model_3d_path=f"models/vedic/{sign_key}_like.glb"
            )
            
            # Register all four animation types for each Vedic sign
            for anim in self._create_full_animation_set(sign_id, ZodiacSystemType.VEDIC, sign_key, name, colors):
                self._register_animation(anim)
    
    def _generate_mayan_animations(self, signs: List[Tuple[str, str, str, List[str]]]):
        """Generate animations for Mayan zodiac signs"""
        for sign_key, symbol, name, colors in signs:
            sign_id = f"mayan_{sign_key}"
            
            for anim in self._create_full_animation_set(sign_id, ZodiacSystemType.MAYAN, sign_key, name, colors):
                self._register_animation(anim)
    
    def _generate_aztec_animations(self, signs: List[Tuple[str, str, str, List[str]]]):
        """Generate animations for Aztec zodiac signs"""
        for sign_key, symbol, name, colors in signs:
            sign_id = f"aztec_{sign_key}"
            
            for anim in self._create_full_animation_set(sign_id, ZodiacSystemType.AZTEC, sign_key, name, colors):
                self._register_animation(anim)
    
    def _create_full_animation_set(self, sign_id: str, system: ZodiacSystemType, sign_key: str, name: str, colors: List[str]) -> List[ZodiacAnimation]:
        """Create all 4 animation types for a zodiac sign"""
        system_name = system.value
        
        animations = []
        
        # Like
        animations.append(ZodiacAnimation(
            id=f"{sign_id}_like",
            sign_id=sign_id,
            system_type=system,
            animation_type=AnimationType.LIKE,
            animation_name=f"{name} Sacred Like",
            css_class=f"{system_name}-like-{sign_key}",
            duration_ms=1200 + (hash(sign_key) % 400),  # Vary duration slightly
            trigger_phrase=f"✨ {name} sends sacred energy! ✨",
            particle_effects=["sacred-light", "energy-flow"],
            sound_effect=f"{system_name}_{sign_key}_like.mp3",
            color_scheme=colors,
            model_3d_path=f"models/{system_name}/{sign_key}_like.glb"
        ))
        
        # Comment  
        animations.append(ZodiacAnimation(
            id=f"{sign_id}_comment",
            sign_id=sign_id,
            system_type=system,
            animation_type=AnimationType.COMMENT,
            animation_name=f"{name} Ancient Comment",
            css_class=f"{system_name}-comment-{sign_key}",
            duration_ms=1500 + (hash(sign_key) % 300),
            trigger_phrase=f"📜 {name} shares ancient knowledge! 📜",
            particle_effects=["wisdom-scroll", "glyph-symbols"],
            sound_effect=f"{system_name}_{sign_key}_comment.mp3",
            color_scheme=colors,
            model_3d_path=f"models/{system_name}/{sign_key}_comment.glb"
        ))
        
        # Follow
        animations.append(ZodiacAnimation(
            id=f"{sign_id}_follow",
            sign_id=sign_id,
            system_type=system,
            animation_type=AnimationType.FOLLOW,
            animation_name=f"{name} Sacred Bond",
            css_class=f"{system_name}-follow-{sign_key}",
            duration_ms=2000 + (hash(sign_key) % 500),
            trigger_phrase=f"🌟 {name} forms sacred connection! 🌟",
            particle_effects=["spirit-link", "energy-bridge"],
            sound_effect=f"{system_name}_{sign_key}_follow.mp3",
            color_scheme=colors,
            model_3d_path=f"models/{system_name}/{sign_key}_follow.glb"
        ))
        
        # Share
        animations.append(ZodiacAnimation(
            id=f"{sign_id}_share",
            sign_id=sign_id,
            system_type=system,
            animation_type=AnimationType.SHARE,
            animation_name=f"{name} Ritual Share",
            css_class=f"{system_name}-share-{sign_key}",
            duration_ms=1800 + (hash(sign_key) % 400),
            trigger_phrase=f"🔥 {name} performs sharing ritual! 🔥",
            particle_effects=["ritual-fire", "spirit-dance"],
            sound_effect=f"{system_name}_{sign_key}_share.mp3",
            color_scheme=colors,
            model_3d_path=f"models/{system_name}/{sign_key}_share.glb"
        ))
        
        return animations
    
    def _register_animation(self, animation: ZodiacAnimation):
        """Register an animation in all lookup structures"""
        # Main registry
        self.animations[animation.id] = animation
        
        # By system
        if animation.system_type not in self.animations_by_system:
            self.animations_by_system[animation.system_type] = {}
        if animation.sign_id not in self.animations_by_system[animation.system_type]:
            self.animations_by_system[animation.system_type][animation.sign_id] = []
        self.animations_by_system[animation.system_type][animation.sign_id].append(animation)
        
        # By type
        if animation.animation_type not in self.animations_by_type:
            self.animations_by_type[animation.animation_type] = []
        self.animations_by_type[animation.animation_type].append(animation)
    
    def get_animation(self, animation_id: str) -> Optional[ZodiacAnimation]:
        """Get specific animation by ID"""
        return self.animations.get(animation_id)
    
    def get_animations_for_sign(self, sign_id: str, system_type: Optional[ZodiacSystemType] = None) -> List[ZodiacAnimation]:
        """Get all animations for a specific zodiac sign"""
        if system_type:
            return self.animations_by_system.get(system_type, {}).get(sign_id, [])
        
        # Search across all systems
        results = []
        for system_anims in self.animations_by_system.values():
            results.extend(system_anims.get(sign_id, []))
        return results
    
    def get_animations_by_type(self, animation_type: AnimationType) -> List[ZodiacAnimation]:
        """Get all animations of a specific type"""
        return self.animations_by_type.get(animation_type, [])
    
    def get_animations_by_system(self, system_type: ZodiacSystemType) -> Dict[str, List[ZodiacAnimation]]:
        """Get all animations for a zodiac system"""
        return self.animations_by_system.get(system_type, {})
    
    def trigger_animation(self, user_id: str, sign_id: str, animation_type: AnimationType, 
                         system_type: Optional[ZodiacSystemType] = None) -> Optional[ZodiacAnimation]:
        """Trigger a zodiac animation for a user action"""
        
        # Find the appropriate animation
        animations = self.get_animations_for_sign(sign_id, system_type)
        matching_anims = [a for a in animations if a.animation_type == animation_type]
        
        if not matching_anims:
            self.logger.warning(f"No animation found for sign {sign_id}, type {animation_type}")
            return None
        
        # Use first matching animation (could be randomized)
        animation = matching_anims[0]
        
        # Log animation trigger
        self.logger.info(f"User {user_id} triggered {animation.animation_name}")
        
        return animation
    
    def get_animation_statistics(self) -> Dict:
        """Get comprehensive animation system statistics"""
        
        stats = {
            "total_animations": len(self.animations),
            "expected_total": 304,  # 76+ signs × 4 animations
            "animations_by_system": {
                system.value: len(anims) 
                for system, anims in self.animations_by_system.items()
            },
            "animations_by_type": {
                anim_type.value: len(anims) 
                for anim_type, anims in self.animations_by_type.items()
            },
            "completion_percentage": (len(self.animations) / 304) * 100,
            "systems_implemented": list(self.animations_by_system.keys())
        }
        
        return stats
    
    def export_animations_json(self, file_path: str):
        """Export all animations to JSON for frontend consumption"""
        
        export_data = {
            "metadata": {
                "total_animations": len(self.animations),
                "systems": list(self.animations_by_system.keys()),
                "animation_types": list(self.animations_by_type.keys()),
                "generated_at": "2024-01-01T00:00:00Z"  # Would use actual timestamp
            },
            "animations": [
                {
                    "id": anim.id,
                    "sign_id": anim.sign_id,
                    "system_type": anim.system_type.value,
                    "animation_type": anim.animation_type.value,
                    "animation_name": anim.animation_name,
                    "css_class": anim.css_class,
                    "duration_ms": anim.duration_ms,
                    "trigger_phrase": anim.trigger_phrase,
                    "particle_effects": anim.particle_effects,
                    "sound_effect": anim.sound_effect,
                    "color_scheme": anim.color_scheme,
                    "model_3d_path": anim.model_3d_path,
                    "is_premium": anim.is_premium
                }
                for anim in self.animations.values()
            ]
        }
        
        with open(file_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        self.logger.info(f"Exported {len(self.animations)} animations to {file_path}")


# Global animation manager instance
animation_manager = ZodiacAnimationManager()


def get_animation_manager() -> ZodiacAnimationManager:
    """Get the global animation manager instance"""
    return animation_manager


# Example usage and testing
if __name__ == "__main__":
    # Initialize and test animation manager
    manager = get_animation_manager()
    
    # Get statistics
    stats = manager.get_animation_statistics()
    print(f"Animation System Statistics:")
    print(f"Total Animations: {stats['total_animations']}")
    print(f"Completion: {stats['completion_percentage']:.1f}%")
    print(f"By System: {stats['animations_by_system']}")
    print(f"By Type: {stats['animations_by_type']}")
    
    # Test getting animations for specific signs
    aries_anims = manager.get_animations_for_sign("western_aries")
    print(f"\\nAries (Western) has {len(aries_anims)} animations:")
    for anim in aries_anims:
        print(f"  - {anim.animation_name} ({anim.animation_type.value})")
    
    # Test triggering animation
    triggered = manager.trigger_animation("user123", "western_aries", AnimationType.LIKE)
    if triggered:
        print(f"\\nTriggered: {triggered.animation_name}")
        print(f"Phrase: {triggered.trigger_phrase}")
    
    # Export for frontend
    # manager.export_animations_json("zodiac_animations.json")