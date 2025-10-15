"""
Enhanced Sigil Generator for STAR Platform
Generates personalized sigils based on zodiac signs and archetypal alignments
"""

import hashlib
import math
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple


def generate_base_sigil(zodiac_sign: str, archetype: str, user_id: str) -> Dict[str, Any]:
    """Generate a base sigil combining zodiac and archetype influences"""
    
    # Create deterministic seed from user data
    seed_string = f"{zodiac_sign}_{archetype}_{user_id}"
    seed = int(hashlib.md5(seed_string.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # Base geometric patterns for zodiac signs
    zodiac_patterns = {
        'aries': {'sides': 3, 'base_angle': 0, 'symmetry': 'radial', 'complexity': 'sharp'},
        'taurus': {'sides': 4, 'base_angle': 45, 'symmetry': 'bilateral', 'complexity': 'grounded'},
        'gemini': {'sides': 6, 'base_angle': 30, 'symmetry': 'mirror', 'complexity': 'dual'},
        'cancer': {'sides': 8, 'base_angle': 22.5, 'symmetry': 'spiral', 'complexity': 'protective'},
        'leo': {'sides': 5, 'base_angle': 0, 'symmetry': 'radial', 'complexity': 'dramatic'},
        'virgo': {'sides': 6, 'base_angle': 0, 'symmetry': 'precise', 'complexity': 'detailed'},
        'libra': {'sides': 6, 'base_angle': 30, 'symmetry': 'perfect', 'complexity': 'balanced'},
        'scorpio': {'sides': 8, 'base_angle': 45, 'symmetry': 'spiral', 'complexity': 'intense'},
        'sagittarius': {'sides': 3, 'base_angle': 60, 'symmetry': 'arrow', 'complexity': 'dynamic'},
        'capricorn': {'sides': 4, 'base_angle': 0, 'symmetry': 'mountain', 'complexity': 'structured'},
        'aquarius': {'sides': 7, 'base_angle': 25.7, 'symmetry': 'wave', 'complexity': 'innovative'},
        'pisces': {'sides': 8, 'base_angle': 45, 'symmetry': 'flow', 'complexity': 'fluid'}
    }
    
    # Archetype modifiers
    archetype_modifiers = {
        'seeker': {'scale': 1.2, 'rotation': 15, 'inner_complexity': 1.5, 'openness': 0.8},
        'guardian': {'scale': 0.9, 'rotation': 0, 'inner_complexity': 0.8, 'openness': 0.6},
        'rebel': {'scale': 1.4, 'rotation': 45, 'inner_complexity': 1.8, 'openness': 1.2},
        'mystic': {'scale': 1.1, 'rotation': 30, 'inner_complexity': 2.0, 'openness': 0.9}
    }
    
    pattern = zodiac_patterns.get(zodiac_sign.lower(), zodiac_patterns['scorpio'])
    modifier = archetype_modifiers.get(archetype.lower(), archetype_modifiers['mystic'])
    
    # Generate geometric points
    points = generate_sigil_geometry(pattern, modifier)
    
    # Generate connecting strokes
    strokes = generate_connecting_strokes(points, pattern, modifier)
    
    # Add elemental influences
    element = get_zodiac_element(zodiac_sign)
    points, strokes = apply_elemental_influence(points, strokes, element)
    
    return {
        'id': f"{zodiac_sign}_{archetype}_{user_id[:8]}",
        'points': points,
        'strokes': strokes,
        'metadata': {
            'zodiac_sign': zodiac_sign,
            'archetype': archetype,
            'element': element,
            'pattern': pattern,
            'modifier': modifier,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    }

def generate_sigil_geometry(pattern: Dict, modifier: Dict) -> List[Tuple[float, float]]:
    """Generate the core geometric points for the sigil"""
    sides = pattern['sides']
    base_angle = math.radians(pattern['base_angle'] + modifier['rotation'])
    
    points = []
    center_x, center_y = 150, 150  # Canvas center
    base_radius = 60 * modifier['scale']
    
    for i in range(sides):
        angle = base_angle + (2 * math.pi * i / sides)
        
        # Add some variation based on archetype
        radius_variation = 1 + (random.random() - 0.5) * 0.3 * modifier['inner_complexity']
        radius = base_radius * radius_variation
        
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        points.append((x, y))
    
    # Add inner points for complexity
    inner_points = []
    inner_radius = base_radius * 0.4 * modifier['openness']
    
    for i in range(sides):
        angle = base_angle + (2 * math.pi * i / sides) + math.pi / sides
        x = center_x + inner_radius * math.cos(angle)
        y = center_y + inner_radius * math.sin(angle)
        inner_points.append((x, y))
    
    return points + inner_points

def generate_connecting_strokes(points: List[Tuple[float, float]], pattern: Dict, modifier: Dict) -> List[Dict]:
    """Generate connecting strokes between sigil points"""
    strokes = []
    outer_points = points[:pattern['sides']]
    inner_points = points[pattern['sides']:] if len(points) > pattern['sides'] else []
    
    # Connect outer points
    for i in range(len(outer_points)):
        next_i = (i + 1) % len(outer_points)
        strokes.append({
            'from': outer_points[i],
            'to': outer_points[next_i],
            'weight': 2.0,
            'style': 'solid'
        })
    
    # Connect to inner points based on archetype
    if inner_points:
        connection_style = get_connection_style(pattern['symmetry'])
        
        for i, outer_point in enumerate(outer_points):
            if i < len(inner_points):
                strokes.append({
                    'from': outer_point,
                    'to': inner_points[i],
                    'weight': 1.5 * modifier['inner_complexity'],
                    'style': connection_style
                })
    
    return strokes

def get_zodiac_element(zodiac_sign: str) -> str:
    """Get the elemental correspondence for a zodiac sign"""
    elemental_map = {
        'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
        'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
        'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
        'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    }
    return elemental_map.get(zodiac_sign.lower(), 'water')

def apply_elemental_influence(points: List[Tuple[float, float]], strokes: List[Dict], element: str) -> Tuple[List[Tuple[float, float]], List[Dict]]:
    """Apply elemental styling to the sigil"""
    if element == 'fire':
        # Sharp, angular modifications
        for stroke in strokes:
            stroke['style'] = 'sharp'
            stroke['weight'] *= 1.2
    elif element == 'earth':
        # Grounded, stable modifications
        for stroke in strokes:
            stroke['style'] = 'solid'
            stroke['weight'] *= 0.9
    elif element == 'air':
        # Light, flowing modifications
        for stroke in strokes:
            stroke['style'] = 'flowing'
            stroke['weight'] *= 0.7
    elif element == 'water':
        # Curved, fluid modifications
        for stroke in strokes:
            stroke['style'] = 'curved'
            stroke['weight'] *= 1.1
    
    return points, strokes

def get_connection_style(symmetry: str) -> str:
    """Get stroke connection style based on symmetry pattern"""
    styles = {
        'radial': 'solid',
        'bilateral': 'dashed',
        'mirror': 'dotted',
        'spiral': 'curved',
        'arrow': 'sharp',
        'mountain': 'solid',
        'wave': 'flowing',
        'flow': 'curved',
        'precise': 'solid',
        'perfect': 'solid'
    }
    return styles.get(symmetry, 'solid')

def generate_sigil_variations(base_sigil: Dict[str, Any], count: int = 3) -> List[Dict[str, Any]]:
    """Generate multiple variations of a base sigil for user selection"""
    variations = [base_sigil]  # Include original
    
    for i in range(count - 1):
        variation = base_sigil.copy()
        variation['id'] = f"{base_sigil['id']}_var{i+1}"
        
        # Apply minor variations
        varied_points = []
        for point in base_sigil['points']:
            x, y = point
            # Small random offset
            x += (random.random() - 0.5) * 10
            y += (random.random() - 0.5) * 10
            varied_points.append((x, y))
        
        variation['points'] = varied_points
        variations.append(variation)
    
    return variations

def modify_for_tarot(points, strokes, tarot_card):
    """Modify sigil geometry based on tarot influences"""

    # Major Arcana modifiers
    major_arcana_modifiers = {
        'The Fool': {'scale': 1.1, 'rotation': 0},
        'The Magician': {'scale': 1.05, 'rotation': 45},
        'The High Priestess': {'scale': 0.95, 'rotation': 90},
        'The Empress': {'scale': 1.15, 'rotation': 135},
        'The Emperor': {'scale': 1.0, 'rotation': 180},
        'The Hierophant': {'scale': 0.9, 'rotation': 225},
        'The Lovers': {'scale': 1.2, 'rotation': 270},
        'The Chariot': {'scale': 1.1, 'rotation': 315},
        'Strength': {'scale': 0.95, 'rotation': 30},
        'The Hermit': {'scale': 0.85, 'rotation': 60},
        'Wheel of Fortune': {'scale': 1.25, 'rotation': 90},
        'Justice': {'scale': 0.9, 'rotation': 120},
        'The Hanged Man': {'scale': 1.0, 'rotation': 150},
        'Death': {'scale': 0.8, 'rotation': 180},
        'Temperance': {'scale': 1.0, 'rotation': 210},
        'The Devil': {'scale': 1.1, 'rotation': 240},
        'The Tower': {'scale': 1.3, 'rotation': 270},
        'The Star': {'scale': 1.1, 'rotation': 300},
        'The Moon': {'scale': 0.95, 'rotation': 330},
        'The Sun': {'scale': 1.4, 'rotation': 0},
        'Judgement': {'scale': 1.2, 'rotation': 45},
        'The World': {'scale': 1.3, 'rotation': 90}
    }

    # Minor Arcana modifiers by suit and rank
    minor_arcana_modifiers = {
        # Wands (Fire) - Action, creativity, energy
        'Ace of Wands': {'scale': 1.4, 'rotation': 0, 'curvature': 1.8, 'intensity': 'high'},
        'Two of Wands': {'scale': 1.2, 'rotation': 15, 'curvature': 1.1, 'intensity': 'medium'},
        'Three of Wands': {'scale': 1.1, 'rotation': 30, 'curvature': 1.0, 'intensity': 'medium'},
        'Four of Wands': {'scale': 1.3, 'rotation': 45, 'curvature': 1.2, 'intensity': 'high'},
        'Five of Wands': {'scale': 0.9, 'rotation': 60, 'curvature': 0.7, 'intensity': 'low'},
        'Six of Wands': {'scale': 1.2, 'rotation': 75, 'curvature': 1.1, 'intensity': 'high'},
        'Seven of Wands': {'scale': 0.95, 'rotation': 90, 'curvature': 0.8, 'intensity': 'medium'},
        'Eight of Wands': {'scale': 1.6, 'rotation': 105, 'curvature': 2.0, 'intensity': 'very_high'},
        'Nine of Wands': {'scale': 0.8, 'rotation': 120, 'curvature': 0.6, 'intensity': 'low'},
        'Ten of Wands': {'scale': 1.0, 'rotation': 135, 'curvature': 0.9, 'intensity': 'medium'},
        'Page of Wands': {'scale': 1.1, 'rotation': 150, 'curvature': 1.3, 'intensity': 'medium'},
        'Knight of Wands': {'scale': 1.35, 'rotation': 165, 'curvature': 1.5, 'intensity': 'high'},
        'Queen of Wands': {'scale': 1.25, 'rotation': 180, 'curvature': 1.4, 'intensity': 'high'},
        'King of Wands': {'scale': 1.4, 'rotation': 195, 'curvature': 1.3, 'intensity': 'high'},

        # Cups (Water) - Emotion, intuition, relationships
        'Ace of Cups': {'scale': 1.3, 'rotation': 0, 'curvature': 2.2, 'intensity': 'high'},
        'Two of Cups': {'scale': 1.1, 'rotation': 20, 'curvature': 1.8, 'intensity': 'medium'},
        'Three of Cups': {'scale': 1.2, 'rotation': 40, 'curvature': 1.7, 'intensity': 'high'},
        'Four of Cups': {'scale': 0.9, 'rotation': 60, 'curvature': 0.8, 'intensity': 'low'},
        'Five of Cups': {'scale': 0.85, 'rotation': 80, 'curvature': 0.7, 'intensity': 'low'},
        'Six of Cups': {'scale': 1.0, 'rotation': 100, 'curvature': 1.5, 'intensity': 'medium'},
        'Seven of Cups': {'scale': 1.1, 'rotation': 120, 'curvature': 1.6, 'intensity': 'medium'},
        'Eight of Cups': {'scale': 0.8, 'rotation': 140, 'curvature': 0.6, 'intensity': 'low'},
        'Nine of Cups': {'scale': 1.3, 'rotation': 160, 'curvature': 1.4, 'intensity': 'high'},
        'Ten of Cups': {'scale': 1.4, 'rotation': 180, 'curvature': 1.8, 'intensity': 'very_high'},
        'Page of Cups': {'scale': 1.05, 'rotation': 200, 'curvature': 1.9, 'intensity': 'medium'},
        'Knight of Cups': {'scale': 1.15, 'rotation': 220, 'curvature': 1.7, 'intensity': 'medium'},
        'Queen of Cups': {'scale': 1.2, 'rotation': 240, 'curvature': 2.0, 'intensity': 'high'},
        'King of Cups': {'scale': 1.1, 'rotation': 260, 'curvature': 1.5, 'intensity': 'medium'},

        # Swords (Air) - Intellect, communication, conflict
        'Ace of Swords': {'scale': 1.5, 'rotation': 0, 'curvature': 0.3, 'intensity': 'very_high'},
        'Two of Swords': {'scale': 1.0, 'rotation': 30, 'curvature': 0.5, 'intensity': 'medium'},
        'Three of Swords': {'scale': 0.75, 'rotation': 60, 'curvature': 0.4, 'intensity': 'low'},
        'Four of Swords': {'scale': 0.9, 'rotation': 90, 'curvature': 0.8, 'intensity': 'medium'},
        'Five of Swords': {'scale': 0.8, 'rotation': 120, 'curvature': 0.2, 'intensity': 'low'},
        'Six of Swords': {'scale': 1.0, 'rotation': 150, 'curvature': 0.6, 'intensity': 'medium'},
        'Seven of Swords': {'scale': 0.95, 'rotation': 180, 'curvature': 0.3, 'intensity': 'medium'},
        'Eight of Swords': {'scale': 0.7, 'rotation': 210, 'curvature': 0.4, 'intensity': 'low'},
        'Nine of Swords': {'scale': 0.8, 'rotation': 240, 'curvature': 0.2, 'intensity': 'low'},
        'Ten of Swords': {'scale': 0.65, 'rotation': 270, 'curvature': 0.1, 'intensity': 'very_low'},
        'Page of Swords': {'scale': 1.05, 'rotation': 300, 'curvature': 0.7, 'intensity': 'medium'},
        'Knight of Swords': {'scale': 1.3, 'rotation': 330, 'curvature': 0.4, 'intensity': 'high'},
        'Queen of Swords': {'scale': 1.1, 'rotation': 0, 'curvature': 0.5, 'intensity': 'high'},
        'King of Swords': {'scale': 1.2, 'rotation': 30, 'curvature': 0.3, 'intensity': 'high'},

        # Pentacles (Earth) - Material, practical, physical
        'Ace of Pentacles': {'scale': 1.3, 'rotation': 0, 'curvature': 1.0, 'intensity': 'high'},
        'Two of Pentacles': {'scale': 1.1, 'rotation': 45, 'curvature': 0.9, 'intensity': 'medium'},
        'Three of Pentacles': {'scale': 1.0, 'rotation': 90, 'curvature': 0.8, 'intensity': 'medium'},
        'Four of Pentacles': {'scale': 0.9, 'rotation': 135, 'curvature': 0.6, 'intensity': 'low'},
        'Five of Pentacles': {'scale': 0.75, 'rotation': 180, 'curvature': 0.7, 'intensity': 'low'},
        'Six of Pentacles': {'scale': 1.1, 'rotation': 225, 'curvature': 1.2, 'intensity': 'high'},
        'Seven of Pentacles': {'scale': 0.95, 'rotation': 270, 'curvature': 0.9, 'intensity': 'medium'},
        'Eight of Pentacles': {'scale': 1.0, 'rotation': 315, 'curvature': 0.8, 'intensity': 'medium'},
        'Nine of Pentacles': {'scale': 1.2, 'rotation': 0, 'curvature': 1.1, 'intensity': 'high'},
        'Ten of Pentacles': {'scale': 1.4, 'rotation': 45, 'curvature': 1.3, 'intensity': 'very_high'},
        'Page of Pentacles': {'scale': 1.05, 'rotation': 90, 'curvature': 1.4, 'intensity': 'medium'},
        'Knight of Pentacles': {'scale': 1.15, 'rotation': 135, 'curvature': 1.0, 'intensity': 'medium'},
        'Queen of Pentacles': {'scale': 1.25, 'rotation': 180, 'curvature': 1.2, 'intensity': 'high'},
        'King of Pentacles': {'scale': 1.3, 'rotation': 225, 'curvature': 0.9, 'intensity': 'high'}
    }

    # Check for Major Arcana first
    if tarot_card in major_arcana_modifiers:
        modifier = major_arcana_modifiers[tarot_card]
        # Apply scaling and rotation
        modified_points = []
        for point in points:
            x, y = point
            # Simple scaling centered on canvas
            x = 100 + (x - 100) * modifier['scale']
            y = 250 + (y - 250) * modifier['scale']
            modified_points.append([x, y])
        return modified_points, strokes

    # Check for Minor Arcana
    elif tarot_card in minor_arcana_modifiers:
        modifier = minor_arcana_modifiers[tarot_card]

        # Apply more complex transformations for Minor Arcana
        modified_points = []
        center_x, center_y = 100, 250

        for i, point in enumerate(points):
            x, y = point

            # Scale relative to center
            dx = x - center_x
            dy = y - center_y
            distance = (dx**2 + dy**2)**0.5
            scale_factor = modifier['scale']

            # Apply curvature effect
            curvature_factor = modifier['curvature']
            angle = i * 6.28 / len(points)  # Full rotation distributed across points

            # Add curvature distortion
            curve_offset_x = distance * curvature_factor * 0.1 * (angle * 0.1) ** 2
            curve_offset_y = distance * curvature_factor * 0.1 * (angle * 0.1) ** 3

            new_x = center_x + dx * scale_factor + curve_offset_x
            new_y = center_y + dy * scale_factor + curve_offset_y

            modified_points.append([new_x, new_y])

        return modified_points, strokes

    # Default modifier if card not found
    else:
        return points, strokes
