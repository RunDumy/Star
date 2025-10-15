"use client";

import { Html, useProgress } from '@react-three/drei';
import { Suspense } from 'react';

interface CosmicLoaderProps {
    children: React.ReactNode;
}

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <div className="cosmic-spinner mb-4"></div>
                <p className="text-lg">Loading Cosmic Space... {progress.toFixed(0)}%</p>
                <div className="w-64 bg-gray-800 rounded-full h-2 mt-4">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </Html>
    );
};

export const CosmicLoader: React.FC<CosmicLoaderProps> = ({ children }) => {
    return (
        <Suspense fallback={<Loader />}>
            {children}
        </Suspense>
    );
};