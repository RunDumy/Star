TRANSIT_TRAIT_MAP = {
    "Mars in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.25},
    "Sun in Leo": {"trait_name": "Creativity", "zodiac_sign": "Leo", "strength_boost": 0.2},
    "Mercury in Virgo": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.22},
    "Venus in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.2},
    "Jupiter in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.3},
    "Moon in Pisces": {"trait_name": "Creativity", "zodiac_sign": "Pisces", "strength_boost": 0.15},
    "Saturn in Virgo": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.25},
    "Neptune in Pisces": {"trait_name": "Creativity", "zodiac_sign": "Pisces", "strength_boost": 0.18},
    "Mars in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.22},
    "Sun in Gemini": {"trait_name": "Creativity", "zodiac_sign": "Gemini", "strength_boost": 0.17},
    "Mercury in Gemini": {"trait_name": "Precision", "zodiac_sign": "Gemini", "strength_boost": 0.2},
    "Venus in Cancer": {"trait_name": "Harmony", "zodiac_sign": "Cancer", "strength_boost": 0.18},
    "Moon in Cancer": {"trait_name": "Harmony", "zodiac_sign": "Cancer", "strength_boost": 0.15},
    "Jupiter in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.2},
    "Saturn in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.18},
    "Neptune in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.17},
    "Uranus in Gemini": {"trait_name": "Creativity", "zodiac_sign": "Gemini", "strength_boost": 0.2},
    "Uranus in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.22},
    "Uranus in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.18},
    "Uranus in Scorpio": {"trait_name": "Precision", "zodiac_sign": "Scorpio", "strength_boost": 0.19},
    "Pluto in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.25},
    "Pluto in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.2},
    "Pluto in Gemini": {"trait_name": "Precision", "zodiac_sign": "Gemini", "strength_boost": 0.18},
    "Pluto in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.23}
}

def test_transit_mappings_expansion():
    """Test that transit mappings include all 24 expanded entries"""
    assert len(TRANSIT_TRAIT_MAP) == 24

    # Test specific transit mappings
    assert "Jupiter in Libra" in TRANSIT_TRAIT_MAP
    assert TRANSIT_TRAIT_MAP["Jupiter in Libra"]["trait_name"] == "Harmony"
    assert abs(TRANSIT_TRAIT_MAP["Jupiter in Libra"]["strength_boost"] - 0.3) < 0.001

    assert "Moon in Pisces" in TRANSIT_TRAIT_MAP
    assert TRANSIT_TRAIT_MAP["Moon in Pisces"]["trait_name"] == "Creativity"

    assert "Saturn in Virgo" in TRANSIT_TRAIT_MAP
    assert TRANSIT_TRAIT_MAP["Saturn in Virgo"]["trait_name"] == "Precision"

def test_transit_trait_coverage():
    """Test that all traits are covered by multiple transits"""
    trait_coverage = {}
    for transit, mapping in TRANSIT_TRAIT_MAP.items():
        trait = mapping["trait_name"]
        if trait not in trait_coverage:
            trait_coverage[trait] = []
        trait_coverage[trait].append(transit)

    # Each trait should have multiple transits
    for trait, transits in trait_coverage.items():
        assert len(transits) >= 3, f"Trait {trait} has only {len(transits)} transits"

    print("Trait coverage:", {trait: len(transits) for trait, transits in trait_coverage.items()})

def test_strength_boost_ranges():
    """Test that strength boosts are within reasonable ranges"""
    for _, mapping in TRANSIT_TRAIT_MAP.items():
        boost = mapping["strength_boost"]
        assert 0.1 <= boost <= 0.3, f"Transit has unreasonable boost {boost}"

def test_zodiac_sign_coverage():
    """Test coverage of zodiac signs in transits"""
    signs_covered = set()
    for transit, mapping in TRANSIT_TRAIT_MAP.items():
        signs_covered.add(mapping["zodiac_sign"])

    expected_signs = {"Aries", "Leo", "Virgo", "Libra", "Pisces", "Scorpio", "Gemini", "Cancer"}
    assert signs_covered == expected_signs

if __name__ == "__main__":
    test_transit_mappings_expansion()
    test_transit_trait_coverage()
    test_strength_boost_ranges()
    test_zodiac_sign_coverage()
    print("✅ All transit expansion tests passed!")