"use client";

import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "../../lib/AnalyticsContext";
import { useAuth } from "../../lib/AuthContext";
import { getAssetUrl } from "../../lib/storage";

const TribeStream: React.FC = () => {
    const [token, setToken] = useState("");
    const [channel, setChannel] = useState("stream");
    const [uid, setUid] = useState("");
    const [profile, setProfile] = useState<any>(null);
    const { user } = useAuth();
    const { trackEvent } = useAnalytics();
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<any>(null);

    const authToken = localStorage.getItem('token');
    const userId = user?.id;

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cosmic-profile`, {
            headers: { "Authorization": `Bearer ${authToken}` },
        })
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, [authToken]);

    const joinStream = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agora/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
            body: JSON.stringify({ channel, userId }),
        });
        const data = await response.json();
        if (data.status === "success") {
            setToken(data.token);
            setUid(data.userId);

            const client = createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;
            const [, localVideoTrack] = await createMicrophoneAndCameraTracks();
            await client.join("27d39aff6ec6469c86397e5043da3e51", channel, data.token, data.userId);

            localVideoTrack.play(localVideoRef.current);
            client.on("user-published", async (user: any, mediaType: string) => {
                await client.subscribe(user, mediaType);
                if (mediaType === "video") {
                    user.videoTrack.play(remoteVideoRef.current);
                }
            });

            const audio = new Audio(getAssetUrl('whoosh-flame-388763.mp3'));
            audio.play();
            trackEvent({ event_type: "tribe_stream_joined", metadata: { channel, userId } });
        }
    };

    const leaveStream = async () => {
        if (clientRef.current) {
            await clientRef.current.leave();
            clientRef.current = null;
            const audio = new Audio(getAssetUrl('whoosh-dark-tension-386134.mp3'));
            audio.play();
            trackEvent({ event_type: "tribe_stream_left", metadata: { channel, userId } });
        }
    };

    return (
        <div className="bg-gray-900 text-amber-100 min-h-screen p-8">
            <h1 className="text-3xl mb-4">Tribe Live Stream</h1>
            {profile?.customizations?.zodiacIcon && (
                <img
                    src={getAssetUrl(`icons8-${profile.customizations.zodiacIcon}-100.png`)}
                    alt="Zodiac Icon"
                    className="w-12 h-12 mb-2"
                />
            )}
            <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Channel Name"
                className="bg-gray-800 border border-amber-500 text-amber-100 p-2 mb-2"
            />
            <button onClick={joinStream} className="bg-amber-500 text-gray-900 px-4 py-2 mr-2">Join Stream</button>
            <button onClick={leaveStream} className="bg-purple-600 text-amber-100 px-4 py-2">Leave Stream</button>
            <div className="flex mt-4">
                <div ref={localVideoRef} className="w-1/2 h-64 bg-gray-800"></div>
                <div ref={remoteVideoRef} className="w-1/2 h-64 bg-gray-800"></div>
            </div>
        </div>
    );
};

export default TribeStream;