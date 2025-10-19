import React from 'react'; import React from 'react'; import React, { useMemo, useRef } from 'react'; import React, { useMemo, useRef } from 'react'; import { PointMaterial, Points } from '@react-three/drei';



interface UniversalSpaceBackgroundProps {

    enableNebula?: boolean;

    nebulaActive?: boolean;interface UniversalSpaceBackgroundProps {import { Canvas, useFrame } from '@react-three/fiber';

}

enableNebula ?: boolean;

export const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({

    enableNebula = true, nebulaActive?: boolean; import * as THREE from 'three'; import { Canvas, useFrame } from '@react-three/fiber'; import { Canvas, extend, useFrame } from '@react-three/fiber';

    nebulaActive = false

}) => { }

return (

    <div className="universal-black-void">

        {/* CSS-based starfield layers */}

        <div className="starfield-far" />export const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({

            <div className="starfield-mid" />

            <div className="starfield-near" />    enableNebula = true, interface Star { import * as THREE from 'three'; import React, {useMemo, useRef} from 'react';

            <div className="cosmic-dust" />

            nebulaActive = false

            {/* Optional cosmic nebula */}

            {enableNebula && (}) => {

                <div className={`cosmic-nebula ${nebulaActive ? 'active' : ''}`} />    position: [number, number, number];

            )}

    </div>    return (

    );

}; <div className="universal-black-void">    size: number;import * as THREE from 'three';



    export default UniversalSpaceBackground;            {/* CSS-based starfield layers */}

    <div className="starfield-far" />    brightness: number;

    <div className="starfield-mid" />

    <div className="starfield-near" />    twinkleSpeed: number;interface Star {

        <div className="cosmic-dust" />

    color: string;

    {/* Optional cosmic nebula */}

    {enableNebula && (}    position: [number, number, number];// Extend Three.js objects for JSX

    <div className={`cosmic-nebula ${nebulaActive ? 'active' : ''}`} />

            )}

</div>

    ); interface DustParticle {
    size: number; extend({ Points, PointMaterial });

};

position: [number, number, number];

export default UniversalSpaceBackground;
velocity: [number, number, number]; brightness: number;

size: number;

opacity: number; twinkleSpeed: number; interface Star {

    driftSpeed: number;

}    color: string; position: [number, number, number];



interface UniversalSpaceBackgroundProps { }    size: number;

starCount ?: number;

dustCount ?: number; brightness: number;

enableTwinkling ?: boolean;

enableDrifting ?: boolean; interface DustParticle {
    twinkleSpeed: number;

}

position: [number, number, number]; color: string;

export const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({

    starCount = 3000, velocity: [number, number, number];
}

    dustCount = 50,

    enableTwinkling = true, size: number;

enableDrifting = true

}) => {
    opacity: number; interface DustParticle {

        return(

        <div className = "universal-black-void" > driftSpeed: number; position: [number, number, number];

            {/* CSS-based starfield layers */ }

            <div className = "starfield-far" />}    velocity: [number, number, number];

            <div className="starfield-mid" />

            <div className="starfield-near" />    size: number;

    <div className="cosmic-dust" />

    interface UniversalSpaceBackgroundProps { opacity: number;

            {/* Dynamic 3D starfield */ }

    <Canvas starCount?: number; driftSpeed:number;

        camera={{ position: [0, 0, 1], fov: 75 }}

        style={{ dustCount?: number; }

                    position: 'absolute',

        top: 0, enableTwinkling ?: boolean;

    left: 0,

        width: '100%', enableDrifting ?: boolean; interface UniversalSpaceBackgroundProps {

        height: '100%',

        pointerEvents: 'none'
    }    starCount ?: number;

}}

            > dustCount ?: number;

                <DynamicStarField

                    starCount={starCount}export const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({    enableTwinkling?: boolean;

                    dustCount={dustCount}

                    enableTwinkling={enableTwinkling}    starCount = 3000,    enableDrifting?: boolean;

                    enableDrifting={enableDrifting}

                />    dustCount = 50,}

            </Canvas>

        </div > enableTwinkling = true,

    );

}; enableDrifting = trueexport const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({



    const DynamicStarField: React.FC < {}) => {
    starCount = 3000,

        starCount: number;

    dustCount: number; return (dustCount = 50,

        enableTwinkling: boolean;

    enableDrifting: boolean; <div className="universal-black-void">    enableTwinkling = true,

}> = ({starCount, dustCount, enableTwinkling, enableDrifting}) => {

    const starsRef = useRef<THREE.Points>(null);            {/* CSS-based starfield layers */}    enableDrifting = true

            const dustRef = useRef<THREE.Points>(null);

                <div className="starfield-far" />}) => {

    // Generate stars

    const stars = useMemo(() => {<div className="starfield-mid" />    return (

                const starArray: Star[] = [];

                const colors = ['#ffffff', '#e6f3ff', '#a855f7', '#ec4899', '#3b82f6'];            <div className="starfield-near" />        <div className="universal-black-void">



                    for (let i = 0; i < starCount; i++) {<div className="cosmic-dust" />            {/* CSS-based starfield layers */}

                    starArray.push({

                        position: [            <div className="starfield-far" />

                    (Math.random() - 0.5) * 200,

                    (Math.random() - 0.5) * 200,            {/* Dynamic 3D starfield */}            <div className="starfield-mid" />

                    (Math.random() - 0.5) * 200

                    ],            <Canvas            <div className="starfield-near" />

                    size: Math.random() * 2 + 0.5,

                    brightness: Math.random() * 0.8 + 0.2,                camera={{ position: [0, 0, 1], fov: 75 }}            <div className="cosmic-dust" />

                    twinkleSpeed: Math.random() * 2 + 1,

                    color: colors[Math.floor(Math.random() * colors.length)]                style={{

                    });

        }                    position: 'absolute',            {/* Dynamic 3D starfield */}

                    return starArray;

    }, [starCount]);                    top: 0,            <Canvas



                        // Generate dust particles                    left: 0,                camera={{ position: [0, 0, 1], fov: 75 }}

                        const dustParticles= useMemo(() => {

        const dustArray: DustParticle[] = [];                    width: '100%',                style={{



                        for(let i = 0; i<dustCount; i++) {height: '100%',                    position: 'absolute',

                    dustArray.push({

                        position: [                    pointerEvents: 'none'                    top: 0,

                    (Math.random() - 0.5) * 150,

                    (Math.random() - 0.5) * 150,                }}                    left: 0,

                    (Math.random() - 0.5) * 150

                ],            >                    width: '100%',

                    velocity: [

                    (Math.random() - 0.5) * 0.01,                <DynamicStarField height: '100%',

                    (Math.random() - 0.5) * 0.01,

                    (Math.random() - 0.5) * 0.01                    starCount={starCount}                    pointerEvents: 'none'

                    ],

                    size: Math.random() * 3 + 1,                    dustCount={dustCount}                }}

                    opacity: Math.random() * 0.5 + 0.1,

                    driftSpeed: Math.random() * 0.5 + 0.1                    enableTwinkling={enableTwinkling}            >

            });

        }                    enableDrifting={enableDrifting}                <DynamicStarField

                        return dustArray;

    }, [dustCount]);                />                    starCount={starCount}



    // Create star geometry and materials            </Canvas>                    dustCount={dustCount}

    const starGeometry = useMemo(() => {

        const geometry = new THREE.BufferGeometry();        </div>                    enableTwinkling={enableTwinkling}

            const positions = new Float32Array(stars.length * 3);

            const colors = new Float32Array(stars.length * 3);    );                    enableDrifting={enableDrifting}

            const sizes = new Float32Array(stars.length);

};                />

            for (let i = 0; i < stars.length; i++) {

            const star = stars[i];            </Canvas>

        positions[i * 3] = star.position[0];

        positions[i * 3 + 1] = star.position[1];const DynamicStarField: React.FC<{        </div>

    positions[i * 3 + 2] = star.position[2];

    starCount: number;    );

    const color = new THREE.Color(star.color);

    colors[i * 3] = color.r; dustCount: number;
};

colors[i * 3 + 1] = color.g;

colors[i * 3 + 2] = color.b; enableTwinkling: boolean;



sizes[i] = star.size; enableDrifting: boolean; const DynamicStarField: React.FC<{

}

}> = ({ starCount, dustCount, enableTwinkling, enableDrifting }) => {
    starCount: number;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); const starsRef = useRef<THREE.Points>(null); dustCount: number;

    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const dustRef = useRef<THREE.Points>(null); enableTwinkling: boolean;

    return geometry;

}, [stars]); enableDrifting: boolean;



// Create dust geometry and materials    // Generate stars}> = ({ starCount, dustCount, enableTwinkling, enableDrifting }) => {

const dustGeometry = useMemo(() => {

    const geometry = new THREE.BufferGeometry(); const stars = useMemo(() => {
        const starsRef = useRef<THREE.Points>(null);

        const positions = new Float32Array(dustParticles.length * 3);

        const opacities = new Float32Array(dustParticles.length); const starArray: Star[] = []; const dustRef = useRef<THREE.Points>(null);



        for (let i = 0; i < dustParticles.length; i++) {
            const colors = ['#ffffff', '#e6f3ff', '#a855f7', '#ec4899', '#3b82f6'];

            const dust = dustParticles[i];

            positions[i * 3] = dust.position[0];    // Generate stars

            positions[i * 3 + 1] = dust.position[1];

            positions[i * 3 + 2] = dust.position[2]; for (let i = 0; i < starCount; i++) {
                const stars = useMemo(() => {

                    opacities[i] = dust.opacity;

                }            starArray.push({
                    const starArray: Star[] = [];



                    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); position: [        const colors = ['#ffffff', '#e6f3ff', '#a855f7', '#ec4899', '#3b82f6'];

                    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

                    (Math.random() - 0.5) * 200,

        return geometry;

            }, [dustParticles]); (Math.random() - 0.5) * 200,        for (let i = 0; i < starCount; i++) {



                // Animation loop                    (Math.random() - 0.5) * 200            starArray.push({

                useFrame((state) => {

                    const time = state.clock.getElapsedTime();                ], position: [



        if (starsRef.current && enableTwinkling) {
                        size: Math.random() * 2 + 0.5, (Math.random() - 0.5) * 200,

            const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;

                        for (let i = 0; i < stars.length; i++) {
                            brightness: Math.random() * 0.8 + 0.2, (Math.random() - 0.5) * 200,

                const star = stars[i];

                            const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7; twinkleSpeed: Math.random() * 2 + 1, (Math.random() - 0.5) * 200

                            sizes[i] = star.size * star.brightness * twinkle;

                        } color: colors[Math.floor(Math.random() * colors.length)]                ],

                        starsRef.current.geometry.attributes.size.needsUpdate = true;

                    }
                }); size: Math.random() * 2 + 0.5,



        if (dustRef.current && enableDrifting) { } brightness: Math.random() * 0.8 + 0.2,

            const positions = dustRef.current.geometry.attributes.position.array as Float32Array;

                for (let i = 0; i < dustParticles.length; i++) {
                    return starArray; twinkleSpeed: Math.random() * 2 + 1,

                const dust = dustParticles[i];

                    positions[i * 3] += dust.velocity[0] * dust.driftSpeed;
                }, [starCount]); color: colors[Math.floor(Math.random() * colors.length)]

positions[i * 3 + 1] += dust.velocity[1] * dust.driftSpeed;

positions[i * 3 + 2] += dust.velocity[2] * dust.driftSpeed;            });



// Wrap around boundaries    // Generate dust particles        }

if (Math.abs(positions[i * 3]) > 100) positions[i * 3] *= -0.9;

if (Math.abs(positions[i * 3 + 1]) > 100) positions[i * 3 + 1] *= -0.9; const dustParticles = useMemo(() => {
    return starArray;

    if (Math.abs(positions[i * 3 + 2]) > 100) positions[i * 3 + 2] *= -0.9;

}        const dustArray: DustParticle[] = [];    }, [starCount]);

dustRef.current.geometry.attributes.position.needsUpdate = true;

        }

    });

for (let i = 0; i < dustCount; i++) {    // Generate dust particles

    return (

        <group>            dustArray.push({    const dustParticles = useMemo(() => {

            {/* Stars */ }

            < primitive                position: [        const dustArray: DustParticle[] = [];

            ref={starsRef}

            object={new THREE.Points((Math.random() - 0.5) * 150,

                starGeometry,

                new THREE.PointsMaterial({                    (Math.random() - 0.5) * 150,        for (let i = 0; i < dustCount; i++) {

                size: 1,

            sizeAttenuation: true,                    (Math.random() - 0.5) * 150            dustArray.push({

                vertexColors: true,

            transparent: true,                ],                position: [

            alphaTest: 0.001,

            blending: THREE.AdditiveBlending                velocity: [                    (Math.random() - 0.5) * 150,

                    })

                )}                    (Math.random() - 0.5) * 0.01,                    (Math.random() - 0.5) * 150,

            />

            (Math.random() - 0.5) * 0.01,                    (Math.random() - 0.5) * 150

            {/* Cosmic Dust */}

            <primitive                    (Math.random() - 0.5) * 0.01                ],

            ref={dustRef}

            object={new THREE.Points(                ],                velocity: [

            dustGeometry,

            new THREE.PointsMaterial({size: Math.random() * 3 + 1,                    (Math.random() - 0.5) * 0.01,

            size: 2,

            transparent: true,                opacity: Math.random() * 0.5 + 0.1,                    (Math.random() - 0.5) * 0.01,

            opacity: 0.6,

            color: '#a855f7',                driftSpeed: Math.random() * 0.5 + 0.1                    (Math.random() - 0.5) * 0.01

            blending: THREE.AdditiveBlending

                    })            });                ],

                )}

            />        }                size: Math.random() * 3 + 1,

        </group>

    ); return dustArray; opacity: Math.random() * 0.5 + 0.1,

};

    }, [dustCount]); driftSpeed: Math.random() * 0.5 + 0.1

export default UniversalSpaceBackground;
            });

// Create star geometry and materials        }

const starGeometry = useMemo(() => {
    return dustArray;

    const geometry = new THREE.BufferGeometry();
}, [dustCount]);

const positions = new Float32Array(stars.length * 3);

const colors = new Float32Array(stars.length * 3);    // Create star geometry and materials

const sizes = new Float32Array(stars.length); const starGeometry = useMemo(() => {

    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < stars.length; i++) {
        const positions = new Float32Array(stars.length * 3);

        const star = stars[i]; const colors = new Float32Array(stars.length * 3);

        positions[i * 3] = star.position[0]; const sizes = new Float32Array(stars.length);

        positions[i * 3 + 1] = star.position[1];

        positions[i * 3 + 2] = star.position[2]; stars.forEach((star, i) => {

            positions[i * 3] = star.position[0];

            const color = new THREE.Color(star.color); positions[i * 3 + 1] = star.position[1];

            colors[i * 3] = color.r; positions[i * 3 + 2] = star.position[2];

            colors[i * 3 + 1] = color.g;

            colors[i * 3 + 2] = color.b; const color = new THREE.Color(star.color);

            colors[i * 3] = color.r;

            sizes[i] = star.size; colors[i * 3 + 1] = color.g;

        }            colors[i * 3 + 2] = color.b;



        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); sizes[i] = star.size;

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    });

geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

return geometry; geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    }, [stars]); geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));



// Create dust geometry and materials        return geometry;

const dustGeometry = useMemo(() => { }, [stars]);

const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(dustParticles.length * 3);    // Create dust geometry and materials

const opacities = new Float32Array(dustParticles.length); const dustGeometry = useMemo(() => {

    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < dustParticles.length; i++) {
        const positions = new Float32Array(dustParticles.length * 3);

        const dust = dustParticles[i]; const opacities = new Float32Array(dustParticles.length);

        positions[i * 3] = dust.position[0];

        positions[i * 3 + 1] = dust.position[1]; dustParticles.forEach((dust, i) => {

            positions[i * 3 + 2] = dust.position[2]; positions[i * 3] = dust.position[0];

            opacities[i] = dust.opacity; positions[i * 3 + 1] = dust.position[1];

        }            positions[i * 3 + 2] = dust.position[2];

        opacities[i] = dust.opacity;

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    });

geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

return geometry; geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    }, [dustParticles]);

return geometry;

// Animation loop    }, [dustParticles]);

useFrame((state) => {

    const time = state.clock.getElapsedTime();    // Animation loop

    useFrame((state) => {

        if (starsRef.current && enableTwinkling) {
            const time = state.clock.getElapsedTime();

            const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;

            for (let i = 0; i < stars.length; i++) {
                if (starsRef.current && enableTwinkling) {

                    const star = stars[i]; const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;

                    const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7; stars.forEach((star, i) => {

                        sizes[i] = star.size * star.brightness * twinkle; const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;

                    }                sizes[i] = star.size * star.brightness * twinkle;

                    starsRef.current.geometry.attributes.size.needsUpdate = true;
                });

}            starsRef.current.geometry.attributes.size.needsUpdate = true;

        }

if (dustRef.current && enableDrifting) {

    const positions = dustRef.current.geometry.attributes.position.array as Float32Array; if (dustRef.current && enableDrifting) {

        for (let i = 0; i < dustParticles.length; i++) {
            const positions = dustRef.current.geometry.attributes.position.array as Float32Array;

            const dust = dustParticles[i]; dustParticles.forEach((dust, i) => {

                positions[i * 3] += dust.velocity[0] * dust.driftSpeed; positions[i * 3] += dust.velocity[0] * dust.driftSpeed;

                positions[i * 3 + 1] += dust.velocity[1] * dust.driftSpeed; positions[i * 3 + 1] += dust.velocity[1] * dust.driftSpeed;

                positions[i * 3 + 2] += dust.velocity[2] * dust.driftSpeed; positions[i * 3 + 2] += dust.velocity[2] * dust.driftSpeed;



                // Wrap around boundaries                // Wrap around boundaries

                if (Math.abs(positions[i * 3]) > 100) positions[i * 3] *= -0.9; if (Math.abs(positions[i * 3]) > 100) positions[i * 3] *= -0.9;

                if (Math.abs(positions[i * 3 + 1]) > 100) positions[i * 3 + 1] *= -0.9; if (Math.abs(positions[i * 3 + 1]) > 100) positions[i * 3 + 1] *= -0.9;

                if (Math.abs(positions[i * 3 + 2]) > 100) positions[i * 3 + 2] *= -0.9; if (Math.abs(positions[i * 3 + 2]) > 100) positions[i * 3 + 2] *= -0.9;

            }            });

        dustRef.current.geometry.attributes.position.needsUpdate = true; dustRef.current.geometry.attributes.position.needsUpdate = true;

    }
}

    });    });



return (    return (

    <group>        <group>

        {/* Stars */}            {/* Stars */}

        <primitive            <points ref={starsRef} geometry={starGeometry}>

            ref={starsRef}                <pointsMaterial

                object={new THREE.Points(size = { 1}

                    starGeometry, sizeAttenuation = { true}

                    new THREE.PointsMaterial({
                    vertexColors={ true}

                        size: 1, transparent={ true}

                        sizeAttenuation: true, alphaTest={ 0.001}

                        vertexColors: true, blending={ THREE.AdditiveBlending }

                        transparent: true,                />

                    alphaTest: 0.001,            </points>

        blending: THREE.AdditiveBlending

                    })            {/* Cosmic Dust */}

                )}            <points ref={dustRef} geometry={dustGeometry}>

            />                <pointsMaterial

                size={2}

                {/* Cosmic Dust */} transparent={true}

            <primitive opacity={0.6}

                ref={dustRef} color="#a855f7"

                object={new THREE.Points(blending = { THREE.AdditiveBlending }

                    dustGeometry, vertexColors = { false}

                    new THREE.PointsMaterial({                />

                    size: 2,            </points>

        transparent: true,        </group>

        opacity: 0.6,    );

                        color: '#a855f7',};

        blending: THREE.AdditiveBlending

                    })export default UniversalSpaceBackground;
                )}
            />
    </group>
);
};

export default UniversalSpaceBackground;