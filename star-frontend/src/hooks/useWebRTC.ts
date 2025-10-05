import { useCollaboration } from "@/contexts/CollaborationContext";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

interface WebRTCPeer {
  peer: Peer.Instance;
  userId: string;
}

export function useWebRTC(roomId: string) {
  const [peers, setPeers] = useState<WebRTCPeer[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { currentUser } = useCollaboration();

  const createPeer = useCallback((initiator: boolean, targetUserId: string, channel: any) => {
    const peer = new Peer({ initiator, trickle: false, stream: localStreamRef.current });
    peer.on("signal", (data: any) => {
      channel.send({
        type: "broadcast",
        event: initiator ? "offer" : "answer",
        payload: { from: currentUser.id, to: targetUserId, signal: data },
      });
    });
    peer.on("stream", (stream: any) => {
      setPeers((prev) => [...prev.filter((p) => p.userId !== targetUserId), { peer, userId: targetUserId }]);
    });
    return peer;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !supabase) return;

    const initWebRTC = async () => {
      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const channel = supabase.channel(`webrtc:${roomId}`);

        channel
          .on("broadcast", { event: "offer" }, ({ payload }) => {
            if (payload.from !== currentUser.id) {
              const peer = createPeer(false, payload.from, channel);
              peer.signal(payload.signal);
            }
          })
          .on("broadcast", { event: "answer" }, ({ payload }) => {
            if (payload.to === currentUser.id) {
              const peer = peers.find((p) => p.userId === payload.from)?.peer;
              if (peer) peer.signal(payload.signal);
            }
          })
          .subscribe();

        channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
          newPresences.forEach((presence: any) => {
            if (presence.userId !== currentUser.id) {
              createPeer(true, presence.userId, channel);
            }
          });
        });

        return () => {
          supabase.removeChannel(channel);
          localStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
      } catch (error) {
        console.error("WebRTC Error:", error);
      }
    };

    initWebRTC();
  }, [currentUser, roomId, createPeer]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted((prev) => !prev);
    }
  };

  return { peers, isMuted, toggleMute };
}