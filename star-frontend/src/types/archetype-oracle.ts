export interface TarotData {
  card: string;
  meaning: string;
  shadow: string;
}

export interface PlanetaryData {
  planet: string;
  element: string;
  color: string;
  sound: string;
  geometry: string;
}

export interface NumerologyData {
  number: number;
  meaning?: {
    name: string;
    vibration: string;
  };
  karmic_debt?: {
    reduces_to: number;
    lesson: string;
  };
}

export interface ArchetypalPersona {
  life_path: string;
  destiny: string;
  soul_urge: string;
  personality: string;
  birth_day: string;
}

export interface PoeticScrolls {
  life_path: string;
  destiny: string;
  soul_urge: string;
  personality: string;
  birth_day: string;
}

export interface CosmicUIProperties {
  colors: {
    primary: string;
    secondary: string;
    glow: string;
  };
  animation: string;
  gradient: string;
  glow_effect: string;
  constellation_pattern: string;
}

export interface EmotionalResonance {
  frequency: string;
  primary_emotions: string[];
  secondary_emotions: string[];
  resonance_strength: number;
  harmony_suggestion: string;
}

export interface TailwindClasses {
  card_bg: string;
  text_color: string;
  accent_color: string;
  button_classes: string;
  glow_effect: string;
}

export interface ResonanceMap {
  life_path: PlanetaryData & {
    number: number;
    poetic_description?: string;
    karmic_ritual?: {
      ritual: string;
    };
  };
  destiny: PlanetaryData & {
    number: number;
    poetic_description?: string;
    karmic_ritual?: {
      ritual: string;
    };
  };
  soul_urge: PlanetaryData & {
    number: number;
    poetic_description?: string;
    karmic_ritual?: {
      ritual: string;
    };
  };
  personality: PlanetaryData & {
    number: number;
    poetic_description?: string;
    karmic_ritual?: {
      ritual: string;
    };
  };
  birth_day: PlanetaryData & {
    number: number;
    poetic_description?: string;
    karmic_ritual?: {
      ritual: string;
    };
  };
}

export interface CosmicProfile {
  numerology: {
    life_path: NumerologyData;
    destiny: NumerologyData;
    soul_urge: NumerologyData;
    personality: NumerologyData;
    birth_day: NumerologyData;
  };
  tarot: {
    life_path: TarotData;
    destiny: TarotData;
    soul_urge: TarotData;
    personality: TarotData;
    birth_day: TarotData;
  };
  planetary: {
    life_path: PlanetaryData;
    destiny: PlanetaryData;
    soul_urge: PlanetaryData;
    personality: PlanetaryData;
    birth_day: PlanetaryData;
  };
  archetypal_persona: ArchetypalPersona;
  poetic_scrolls: PoeticScrolls;
  cosmic_ui?: {
    life_path: CosmicUIProperties;
    destiny: CosmicUIProperties;
    soul_urge: CosmicUIProperties;
    personality: CosmicUIProperties;
    birth_day: CosmicUIProperties;
  };
  emotional_resonance?: {
    life_path: EmotionalResonance;
    destiny: EmotionalResonance;
    soul_urge: EmotionalResonance;
    personality: EmotionalResonance;
    birth_day: EmotionalResonance;
  };
  tailwind_classes?: {
    life_path: TailwindClasses;
    destiny: TailwindClasses;
    soul_urge: TailwindClasses;
    personality: TailwindClasses;
    birth_day: TailwindClasses;
  };
}

export interface SymbolicSpread {
  past: {
    card: TarotData;
    interpretation: string;
  };
  present: {
    card: TarotData;
    interpretation: string;
  };
  future: {
    card: TarotData;
    interpretation: string;
  };
}

export interface SymbolicSpreadResult {
  spread: SymbolicSpread;
  numerology_reference: NumerologyData;
}

export interface PersonalCycle {
  personal_year: {
    number: number;
    meaning: {
      name: string;
      vibration: string;
    };
    tarot: TarotData;
  };
  daily_vibration: {
    number: number;
    meaning: {
      name: string;
      vibration: string;
    };
    tarot: TarotData;
    message: string;
  };
}

export interface KarmicInsight {
  number: number;
  lesson: string;
  tarot: TarotData;
  ritual: string;
  message: string;
}

export interface KarmicInsightsResult {
  karmic_insights: KarmicInsight[];
  message?: string;
}

export interface OracleInput {
  full_name: string;
  birth_date: string;
  tradition?: string;
}

export interface PublicOracleData {
  cosmic_profile: CosmicProfile;
  symbolic_spread: SymbolicSpreadResult;
  resonance_map: ResonanceMap;
  cycle_tracker: PersonalCycle;
  karmic_insights: KarmicInsightsResult;
  user_info: OracleInput;
}

export interface ArchetypeProfileCardProps {
  aspect: keyof ArchetypalPersona;
  profileData: CosmicProfile;
  onExploreClick?: (aspect: keyof ArchetypalPersona) => void;
}

export interface CosmicProfileGridProps {
  profileData: CosmicProfile;
  onCardClick?: (aspect: keyof ArchetypalPersona) => void;
}

export interface ResonanceMapProps {
  resonanceMap: ResonanceMap;
  cosmicUI?: {
    life_path: CosmicUIProperties;
    destiny: CosmicUIProperties;
    soul_urge: CosmicUIProperties;
    personality: CosmicUIProperties;
    birth_day: CosmicUIProperties;
  };
}

export interface PoeticScrollProps {
  text?: string;
  content?: PoeticScrolls;
  cosmicUI?: CosmicUIProperties;
  delay?: number;
}
