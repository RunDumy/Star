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
