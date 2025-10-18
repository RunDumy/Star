// Cosmic Intelligence Types for STAR Platform

export interface LunarGuidance {
    moon_phase: string;
    moon_mansion: string;
    mansion_meaning: string;
    void_of_course: boolean;
    illumination: string;
    lunar_day: number;
    best_activities: string[];
    meditation_focus: string;
    mantras: string[];
    element_emphasis: string;
    cosmic_weather: string;
}

export interface MentorGuidance {
    mentor: string;
    archetype: string;
    mood: string;
    response: string;
    lunar_influence: string;
    symbolic_animal: string;
    elemental_affirmation: string;
    ritual_suggestion: string;
    timestamp: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'lunar_cycle' | 'elemental_sequence' | 'mythological_archetype';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    duration_days: number;
    lunar_phase_alignment: string[];
    elemental_focus: string[];
    success_criteria: string[];
    rewards: {
        cosmic_energy: number;
        badges: string[];
        mentor_sessions: number;
    };
    progress: {
        current_step: number;
        total_steps: number;
        completed_at?: string;
        success_probability: number;
    };
    created_at: string;
    expires_at?: string;
}

export interface QuestStep {
    id: string;
    title: string;
    description: string;
    type: 'meditation' | 'ritual' | 'reflection' | 'action' | 'social';
    duration_minutes?: number;
    lunar_requirement?: string;
    elemental_requirement?: string;
    completion_criteria: string[];
    hints: string[];
    completed: boolean;
    completed_at?: string;
}

export interface CosmicStats {
    user_id: string;
    total_quests_completed: number;
    current_active_quests: number;
    mentor_sessions: number;
    lunar_cycles_tracked: number;
    cosmic_energy_level: number;
    elemental_balance: Record<string, number>;
    zodiac_compatibility_score: number;
    engagement_streak: number;
    achievements_unlocked: string[];
    last_activity: string;
}

export interface MentorSession {
    id: string;
    mentor_name: string;
    question: string;
    guidance: MentorGuidance;
    user_reflections?: string[];
    follow_up_questions?: string[];
    created_at: string;
    archived: boolean;
}

export interface LunarEvent {
    id: string;
    event_type: 'new_moon' | 'full_moon' | 'void_of_course' | 'eclipse' | 'mansion_transition';
    title: string;
    description: string;
    significance: string;
    recommended_actions: string[];
    elemental_focus: string;
    timestamp: string;
    duration_hours?: number;
}

export interface CosmicAchievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'quests' | 'mentors' | 'lunar' | 'social' | 'spiritual';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlocked_at: string;
    progress?: {
        current: number;
        required: number;
    };
}