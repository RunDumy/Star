"use client";

import { Html } from '@react-three/drei';
import { useState } from 'react';

interface ArchaeologyToolkitProps {
  position?: [number, number, number];
}

export const ArchaeologyToolkit: React.FC<ArchaeologyToolkitProps> = ({
  position = [15, 0, 0]
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'resonance', name: 'Resonance Scanner', icon: '📡' },
    { id: 'zodiac', name: 'Zodiac Filter', icon: '♋' },
    { id: 'emotional', name: 'Emotional Excavator', icon: '🧠' }
  ];

  return (
    <Html position={position} center>
      <div className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[200px]">
        <h3 className="text-purple-300 font-semibold mb-3 text-sm">Archaeology Toolkit</h3>

        <div className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                activeTool === tool.id
                  ? 'bg-purple-600/30 border border-purple-400/50'
                  : 'hover:bg-purple-600/20'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="text-xs text-purple-200">{tool.name}</span>
            </button>
          ))}
        </div>

        {activeTool && (
          <div className="mt-3 p-2 bg-purple-900/20 rounded border border-purple-500/20">
            <div className="text-xs text-purple-300">
              {activeTool === 'resonance' && 'Scanning for emotional resonance patterns...'}
              {activeTool === 'zodiac' && 'Filtering by zodiac alignments...'}
              {activeTool === 'emotional' && 'Excavating emotional layers...'}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};