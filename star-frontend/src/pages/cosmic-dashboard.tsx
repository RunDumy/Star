"use client";

import { FloatingPostIslands } from "@/components/cosmic/feed/FloatingPostIslands";
import { MirrorChamber } from "@/components/cosmic/mirror/MirrorChamber";
import { ThoughtOrbSystem } from "@/components/cosmic/orbs/ThoughtOrbSystem";
import { SocialConstellation } from "@/components/cosmic/social/SocialConstellation";
import { useAuth } from "@/lib/AuthContext";
import { useStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CosmicDashboard() {
  const { user } = useAuth();
  const { posts, orbs, connections, setPosts, setOrbs, setConnections } = useStore();
  const [activeRealm, setActiveRealm] = useState("feed");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch posts
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`, {
        headers: { Authorization: `Bearer ${user.id}` },
      })
        .then((res) => res.json())
        .then((data) => setPosts(data.posts));

      // Fetch connections
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/connections`, {
        headers: { Authorization: `Bearer ${user.id}` },
      })
        .then((res) => res.json())
        .then((data) => setConnections(data.connections));
    }
  }, [user, setPosts, setConnections]);

  // Performance optimization: clean up willChange after transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      // This would normally clean up willChange, but since it's inline, it's handled by React
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeRealm]);

  const realms = [
    { id: "feed", label: "Post Islands", icon: "🪐" },
    { id: "orbs", label: "Thought Orbs", icon: "💭" },
    { id: "mirror", label: "Reflection", icon: "🪞" },
    { id: "social", label: "Constellation", icon: "🧭" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🌌</div>
              <h1 className="text-xl font-bold text-white">STAR Cosmic Interface</h1>
            </div>
            <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
              {realms.map((realm) => (
                <button
                  key={realm.id}
                  onClick={() => {
                    if (activeRealm !== realm.id) {
                      setIsTransitioning(true);
                      // Add haptic feedback if available
                      if (navigator.vibrate) {
                        navigator.vibrate(50);
                      }
                      setTimeout(() => {
                        setActiveRealm(realm.id);
                        setIsTransitioning(false);
                      }, 400);
                    }
                  }}
                  className={`px-4 py-2 rounded-md transition-all ${activeRealm === realm.id
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "text-cyan-200 hover:bg-cyan-500/20"
                    }`}
                >
                  <span className="mr-2">{realm.icon}</span>
                  {realm.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-16">
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center relative">
              {/* Cosmic background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }, (_, i) => `star-${i}`).map((starId) => (
                  <motion.div
                    key={starId}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    initial={{
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                      opacity: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-4 relative z-10"
              >
                🌌
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-cyan-300 text-xl font-semibold mb-4 relative z-10"
              >
                Traversing Cosmic Realms...
              </motion.div>
              <div className="flex justify-center space-x-2 relative z-10">
                {['a', 'b', 'c', 'd', 'e'].map((key, i) => (
                  <motion.div
                    key={key}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {activeRealm === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: 90 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", damping: 20, stiffness: 100 }
              }}
              className="will-change-transform-opacity"
            >
              <FloatingPostIslands posts={posts} />
            </motion.div>
          )}
          {activeRealm === "orbs" && (
            <motion.div
              key="orbs"
              initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateX: 90 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", damping: 20, stiffness: 100 }
              }}
              className="will-change-transform-opacity"
            >
              <ThoughtOrbSystem orbs={orbs} onOrbCreate={(orb) => setOrbs([...orbs, { ...orb, id: Date.now().toString(), timestamp: new Date().toISOString(), responses: [] }])} />
            </motion.div>
          )}
          {activeRealm === "mirror" && (
            <motion.div
              key="mirror"
              initial={{ opacity: 0, scale: 0.8, rotateZ: -180 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateZ: 180 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", damping: 20, stiffness: 100 }
              }}
              className="will-change-transform-opacity"
            >
              <MirrorChamber />
            </motion.div>
          )}
          {activeRealm === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: -90 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", damping: 20, stiffness: 100 }
              }}
              className="will-change-transform-opacity"
            >
              <SocialConstellation connections={connections} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}