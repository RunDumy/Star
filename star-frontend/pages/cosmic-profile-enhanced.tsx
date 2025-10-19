'use client';

import UniversalSpaceLayout from "@/components/UniversalSpaceLayout";
import { useAuth } from "@/lib/AuthContext";
import { getAssetUrl, getChineseZodiacIconUrl, getElementIconUrl, getZodiacIconUrl } from "@/lib/storage";
import { useEffect, useState } from "react";

export async function getServerSideProps() {
    return {
        props: {},
    };
}

const CosmicProfileEnhanced: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [tribes, setTribes] = useState<string[]>([]);
    const [privacySettings, setPrivacySettings] = useState({
        profile: "private",
        zodiac: "private",
        archetype: "private",
        achievements: "private",
        tribes: "private",
    });
    const [customizations, setCustomizations] = useState({
        zodiacIcon: "",
        chineseZodiacIcon: "",
        elementIcon: "",
        lunarPhaseIcon: "",
        planetIcon: "",
        seasonIcon: "",
    });
    const { user } = useAuth();
    const token = globalThis.window ? localStorage.getItem('token') : null;
    const userId = user?.id;

    const iconOptions = {
        zodiac: ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
        chineseZodiac: ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"],
        element: ["air", "earth", "fire", "water"],
        lunarPhase: ["new-moon", "waxing-crescent", "first-quarter", "waxing-gibbous", "full-moon", "waning-gibbous", "last-quarter", "waning-crescent"],
        planet: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
        season: ["spring", "summer", "autumn", "winter"],
    };

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cosmic-profile`, {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setProfile(data.profile);
                    setPrivacySettings(data.profile.privacySettings || {
                        profile: "private",
                        zodiac: "private",
                        archetype: "private",
                        achievements: "private",
                        tribes: "private",
                    });
                    setCustomizations(data.profile.customizations || {
                        zodiacIcon: data.profile.zodiacSigns?.western.toLowerCase() || "aries",
                        chineseZodiacIcon: data.profile.zodiacSigns?.chinese.toLowerCase() || "rat",
                        elementIcon: data.profile.zodiacSigns?.element?.toLowerCase() || "fire",
                        lunarPhaseIcon: "new-moon",
                        planetIcon: "sun",
                        seasonIcon: "spring",
                    });
                }
            });

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tribes`, {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setTribes(data.tribes || []));
    }, [token, userId]);

    const updatePrivacy = async (key: string, value: "public" | "tribe" | "private") => {
        if (!token) return;
        const newSettings = { ...privacySettings, [key]: value };
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cosmic-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ privacySettings: newSettings, customizations }),
        });
        setPrivacySettings(newSettings);
    };

    const updateCustomization = async (key: string, value: string) => {
        if (!token) return;
        const newCustomizations = { ...customizations, [key]: value };
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cosmic-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ privacySettings, customizations: newCustomizations }),
        });
        setCustomizations(newCustomizations);
    };

    const joinTribe = async (tribe: string) => {
        if (confirm(`Do you consent to join the ${tribe} tribe? Your zodiac data may be shared with tribe members.`)) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tribes/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ tribe, consent: true }),
            });
        }
    };

    const startQuest = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/quests/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ questType: "hero_journey" }),
        });
    };

    return (
        <UniversalSpaceLayout currentPage="Profile Realm">
            <div className="relative z-10 text-amber-100 p-8">
                <h1 className="text-3xl mb-4">{profile?.zodiacSigns?.western} Profile</h1>
                {privacySettings.zodiac !== "private" && (
                    <div className="flex items-center mb-2">
                        <img
                            src={getZodiacIconUrl(customizations.zodiacIcon)}
                            alt="Zodiac Icon"
                            className="w-12 h-12 mr-2"
                        />
                        <img
                            src={getChineseZodiacIconUrl(customizations.chineseZodiacIcon)}
                            alt="Chinese Zodiac Icon"
                            className="w-12 h-12 mr-2"
                        />
                        <img
                            src={getElementIconUrl(customizations.elementIcon)}
                            alt="Element Icon"
                            className="w-12 h-12 mr-2"
                        />
                        <p>Zodiac: {profile?.zodiacSigns?.western}, {profile?.zodiacSigns?.chinese}, Moon: {profile?.zodiacSigns?.lunarPhase}</p>
                    </div>
                )}
                {privacySettings.archetype !== "private" && <p>Archetype: {profile?.archetype?.primary}</p>}
                {privacySettings.tribes !== "private" && <p>Tribes: {tribes.join(", ")}</p>}
                {privacySettings.achievements !== "private" && (
                    <p>Achievements: {profile?.achievements?.map((a: any) => a.type).join(", ")}</p>
                )}
                <div className="mt-4">
                    <h2 className="text-xl mb-2">Privacy Settings</h2>
                    {Object.keys(privacySettings).map((key) => (
                        <div key={key} className="mb-2">
                            <label className="mr-2 capitalize">{key} Visibility:</label>
                            <select
                                value={privacySettings[key as keyof typeof privacySettings]}
                                onChange={(e) => updatePrivacy(key, e.target.value as "public" | "tribe" | "private")}
                                className="bg-gray-800 border border-amber-500 text-amber-100 p-2"
                                title={`${key} visibility`}
                            >
                                <option value="public">Public</option>
                                <option value="tribe">Tribe Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <h2 className="text-xl mb-2">Customize Your Profile</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(iconOptions).map((category) => (
                            <div key={category} className="mb-2">
                                <label className="mr-2 capitalize">{category} Icon:</label>
                                <select
                                    value={customizations[`${category}Icon` as keyof typeof customizations]}
                                    onChange={(e) => updateCustomization(`${category}Icon`, e.target.value)}
                                    className="bg-gray-800 border border-amber-500 text-amber-100 p-2 w-full"
                                    title={`${category} icon selection`}
                                >
                                    {iconOptions[category as keyof typeof iconOptions].map((icon) => (
                                        <option key={icon} value={icon}>{icon.replace("-", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="relative mt-4 w-32 h-48">
                        <img src={getAssetUrl('blank_tarot.png')} alt="Profile Preview" className="absolute w-32 h-48" />
                        {customizations.zodiacIcon && (
                            <img
                                src={getZodiacIconUrl(customizations.zodiacIcon).replace('-100.png', '-50.png')}
                                alt="Zodiac Icon"
                                className="absolute w-8 h-8 top-4 left-4"
                            />
                        )}
                        {customizations.elementIcon && (
                            <img
                                src={getElementIconUrl(customizations.elementIcon).replace('-100.png', '-50.png')}
                                alt="Element Icon"
                                className="absolute w-8 h-8 top-4 right-4"
                            />
                        )}
                        {customizations.planetIcon && (
                            <img
                                src={getAssetUrl(`icons8-${customizations.planetIcon}-50.png`)}
                                alt="Planet Icon"
                                className="absolute w-8 h-8 bottom-4 left-4"
                            />
                        )}
                    </div>
                </div>
                <button onClick={() => joinTribe(`${profile?.zodiacSigns?.western} Souls`)} className="bg-amber-500 text-gray-900 px-4 py-2 mt-4">
                    Join {profile?.zodiacSigns?.western} Tribe
                </button>
                <button onClick={startQuest} className="bg-amber-500 text-gray-900 px-4 py-2 mt-4 ml-2">Begin Hero's Journey</button>
                <button
                    onClick={() => alert("Your zodiac and archetype data are used to personalize tribes, quests, and feeds. You can control visibility in settings.")}
                    className="bg-purple-600 text-amber-100 px-2 py-1 mt-2"
                >
                    Why this data?
                </button>
            </div>
        </UniversalSpaceLayout>
    );
};

export default CosmicProfileEnhanced;