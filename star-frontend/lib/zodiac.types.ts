/**
 * TypeScript Interfaces for STAR Multi-Zodiac System
 * Supports 5 Zodiac Traditions: Western, Chinese, Vedic, Mayan, Aztec
 * 76+ Zodiac Signs, 13 Galactic Tones, 304 Animations, Cosmic Signatures
 */

// ============= CORE ZODIAC SYSTEM TYPES =============

export type ZodiacSystemType = 'western' | 'chinese' | 'vedic' | 'mayan' | 'aztec';

export interface ZodiacSystem {
    id: string;
    name: string;
    type: ZodiacSystemType;
    description: string;
    sign_count: number;
    cultural_origin: string;
    calculation_method: string;
    is_active: boolean;
}

export interface ZodiacSign {
    id: string;
    system_type: ZodiacSystemType;
    name: string;
    symbol: string;
    element?: string;
    quality?: string;
    ruling_planet?: string;
    date_range?: string;
    personality_traits: string[];
    strengths: string[];
    challenges: string[];
    compatibility_signs: string[];
    colors: string[];
    gems: string[];
    description: string;
}

// ============= WESTERN ZODIAC SPECIFICS =============

export interface WesternZodiacSign extends ZodiacSign {
    system_type: 'western';
    element: 'fire' | 'earth' | 'air' | 'water';
    quality: 'cardinal' | 'fixed' | 'mutable';
    ruling_planet: string;
    house_rulership: number;
    degree_range: [number, number];
}

// ============= CHINESE ZODIAC SPECIFICS =============

export interface ChineseZodiacSign extends ZodiacSign {
    system_type: 'chinese';
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    yin_yang: 'yin' | 'yang';
    year_cycle: number;
    lucky_numbers: number[];
    unlucky_numbers: number[];
}

// ============= VEDIC/JYOTISH ZODIAC SPECIFICS =============

export interface VedicZodiacSign extends ZodiacSign {
    system_type: 'vedic';
    nakshatra?: string;
    pada?: number;
    deity?: string;
    guna: 'rajas' | 'tamas' | 'sattva';
    Sanskrit_name: string;
    ayurvedic_constitution: 'vata' | 'pitta' | 'kapha';
}

// ============= MAYAN ZODIAC SPECIFICS =============

export interface MayanZodiacSign extends ZodiacSign {
    system_type: 'mayan';
    day_sign_number: number;  // 1-20
    maya_name: string;
    direction: 'north' | 'south' | 'east' | 'west' | 'center';
    sacred_tree?: string;
    animal_spirit?: string;
    prophecy?: string;
}

// ============= AZTEC ZODIAC SPECIFICS =============

export interface AztecZodiacSign extends ZodiacSign {
    system_type: 'aztec';
    day_sign_number: number;  // 1-20
    nahuatl_name: string;
    teoxihuitl_position: number;
    associated_god?: string;
    ritual_color?: string;
    sacred_number?: number;
}

// ============= GALACTIC TONES (MAYAN/AZTEC) =============

export interface GalacticTone {
    id: string;
    tone_number: number;  // 1-13
    name: string;
    maya_name: string;
    keyword: string;
    energy_type: string;
    power_description: string;
    action_phrase: string;
    essence_phrase: string;
    chakra_association?: string;
    color_vibration: string;
    sacred_geometry?: string;
}

// ============= COSMIC SIGNATURES =============

export interface CosmicSignature {
    id: string;
    day_sign: MayanZodiacSign | AztecZodiacSign;
    galactic_tone: GalacticTone;
    kin_number: number;  // 1-260
    wavespell_position: number;  // 1-13
    castle_position: 'red' | 'white' | 'blue' | 'yellow' | 'green';
    signature_phrase: string;
    oracle_family: {
        guide: string;
        analog: string;
        antipode: string;
        occult: string;
    };
    meditation_focus: string;
}

// ============= MULTI-ZODIAC CALCULATION RESULTS =============

export interface MultiZodiacCalculation {
    birth_date: string;
    birth_time?: string;
    birth_location?: string;
    calculation_timestamp: string;
    total_signs: number;

    western: {
        sun_sign: WesternZodiacSign;
        moon_sign?: WesternZodiacSign;
        ascendant?: WesternZodiacSign;
        houses?: { [key: number]: WesternZodiacSign };
    };

    chinese: {
        year_sign: ChineseZodiacSign;
        month_sign?: ChineseZodiacSign;
        day_sign?: ChineseZodiacSign;
        hour_sign?: ChineseZodiacSign;
    };

    vedic: {
        rashi: VedicZodiacSign;
        nakshatra: string;
        pada: number;
        ascendant?: VedicZodiacSign;
        moon_sign?: VedicZodiacSign;
    };

    mayan: {
        day_sign: MayanZodiacSign;
        galactic_tone: GalacticTone;
        cosmic_signature: CosmicSignature;
        wavespell_day: number;
    };

    aztec: {
        day_sign: AztecZodiacSign;
        galactic_tone: GalacticTone;
        teoxihuitl_day: number;
        tonalpohualli_position: number;
    };

    cosmic_signature: CosmicSignature;
    synthesis_reading: string;
    compatibility_matrix: { [key: string]: number };
}

// ============= ZODIAC ANIMATIONS =============

export type AnimationType = 'like' | 'comment' | 'follow' | 'share';

export interface ZodiacAnimation {
    id: string;
    sign_id: string;
    system_type: ZodiacSystemType;
    animation_type: AnimationType;
    animation_name: string;
    css_class: string;
    duration_ms: number;
    trigger_phrase: string;
    particle_effects?: string[];
    sound_effect?: string;
    color_scheme: string[];
    model_3d_path?: string;
    is_premium?: boolean;
}

// ============= USER ZODIAC READINGS =============

export interface UserZodiacReading {
    id: string;
    user_id: string;
    calculation_results: MultiZodiacCalculation;
    favorite_system?: ZodiacSystemType;
    custom_interpretation?: string;
    sharing_preferences: {
        public: boolean;
        friends_only: boolean;
        systems_to_share: ZodiacSystemType[];
    };
    created_at: string;
    updated_at: string;
    reading_accuracy_rating?: number;
}

// ============= COMPATIBILITY ANALYSIS =============

export interface ZodiacCompatibility {
    id: string;
    person1_reading: UserZodiacReading;
    person2_reading: UserZodiacReading;
    system_compatibilities: {
        [K in ZodiacSystemType]: {
            score: number;  // 0-100
            interpretation: string;
            harmonious_aspects: string[];
            challenging_aspects: string[];
        };
    };
    overall_score: number;
    relationship_type: 'romantic' | 'friendship' | 'business' | 'family';
    strengths: string[];
    growth_areas: string[];
    advice: string;
    created_at: string;
}

// ============= DAILY ZODIAC GUIDANCE =============

export interface DailyZodiacGuidance {
    id: string;
    date: string;  // YYYY-MM-DD
    user_zodiac_profile: UserZodiacReading;
    guidance_by_system: {
        [K in ZodiacSystemType]: {
            daily_energy: string;
            focus_areas: string[];
            lucky_numbers?: number[];
            power_hours?: string[];
            colors_to_wear?: string[];
            affirmation: string;
        };
    };
    cosmic_weather: {
        planetary_transits: string[];
        moon_phase: string;
        galactic_tone_of_day: GalacticTone;
    };
    unified_guidance: string;
    action_recommendations: string[];
    meditation_focus: string;
}

// ============= ANIMATION STATISTICS =============

export interface AnimationStatistics {
    total_animations: number;  // Should be 304
    animations_by_system: {
        [K in ZodiacSystemType]: number;
    };
    animations_by_type: {
        [T in AnimationType]: number;
    };
    most_popular_animations: ZodiacAnimation[];
    user_animation_preferences: {
        [key: string]: number;  // sign_id -> usage_count
    };
    performance_metrics: {
        average_load_time_ms: number;
        cache_hit_rate: number;
        user_engagement_score: number;
    };
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ZodiacSystemsResponse extends ApiResponse<ZodiacSystem[]> {
    total_systems: number;
}

export interface MultiZodiacCalculationResponse extends ApiResponse<MultiZodiacCalculation> {
    systems_analyzed: number;
    total_signs: number;
    reading_id: string;
}

export interface ZodiacAnimationsResponse extends ApiResponse<ZodiacAnimation[]> {
    sign_id: string;
    total_animations: number;
    animation_types: AnimationType[];
}

export interface CosmicSignatureResponse extends ApiResponse<CosmicSignature> {
    kin_number: number;
    wavespell_day: number;
}

export interface GalacticTonesResponse extends ApiResponse<GalacticTone[]> {
    total_tones: number;
    current_tone?: GalacticTone;
}

export interface UserReadingsResponse extends ApiResponse<UserZodiacReading[]> {
    total_readings: number;
}

export interface CompatibilityResponse extends ApiResponse<ZodiacCompatibility> {
    relationship_type: string;
    overall_score: number;
}

export interface DailyGuidanceResponse extends ApiResponse<DailyZodiacGuidance> {
    date: string;
    cosmic_weather: any;
}

export interface AnimationStatsResponse extends ApiResponse<AnimationStatistics> {
    expected_total: number;  // 304
    completion_percentage: number;
}

// ============= COMPONENT PROPS TYPES =============

export interface MultiZodiacDisplayProps {
    userReading?: UserZodiacReading;
    selectedSystems?: ZodiacSystemType[];
    onSystemToggle?: (system: ZodiacSystemType) => void;
    showAnimations?: boolean;
    compactMode?: boolean;
}

export interface ZodiacSystemCardProps {
    system: ZodiacSystem;
    userSign?: ZodiacSign;
    isExpanded?: boolean;
    onToggle?: () => void;
    showAnimation?: boolean;
}

export interface CosmicSignatureViewProps {
    cosmicSignature: CosmicSignature;
    showDetails?: boolean;
    interactive?: boolean;
    onKinClick?: (kinNumber: number) => void;
}

export interface GalacticTonesWheelProps {
    tones: GalacticTone[];
    selectedTone?: GalacticTone;
    onToneSelect?: (tone: GalacticTone) => void;
    showLabels?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export interface ZodiacAnimationPlayerProps {
    animation: ZodiacAnimation;
    autoPlay?: boolean;
    loop?: boolean;
    onAnimationEnd?: () => void;
    showControls?: boolean;
}

export interface CompatibilityMeterProps {
    compatibility: ZodiacCompatibility;
    showDetails?: boolean;
    animated?: boolean;
}

// ============= UTILITY TYPES =============

export type ZodiacSignUnion =
    | WesternZodiacSign
    | ChineseZodiacSign
    | VedicZodiacSign
    | MayanZodiacSign
    | AztecZodiacSign;

export type ZodiacCalculationInput = {
    birth_date: string;
    birth_time?: string;
    birth_location?: string;
    timezone?: string;
    systems_to_calculate?: ZodiacSystemType[];
};

export type ZodiacAnimationTrigger = {
    user_id: string;
    action_type: AnimationType;
    zodiac_sign: ZodiacSignUnion;
    target_element?: string;
};

// ============= SEARCH AND FILTER TYPES =============

export interface ZodiacSearchFilters {
    systems?: ZodiacSystemType[];
    elements?: string[];
    date_range?: {
        start: string;
        end: string;
    };
    compatibility_threshold?: number;
    has_animations?: boolean;
}

export interface ZodiacSearchResult {
    signs: ZodiacSignUnion[];
    total_count: number;
    filtered_count: number;
    suggestions?: string[];
}

// All types and interfaces are exported inline above
