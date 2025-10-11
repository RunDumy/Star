'use client';

import { useCallback, useEffect, useRef } from 'react';
import Particles from 'react-tsparticles';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadFull } from 'tsparticles';
import { supabase } from '../lib/supabase.js';

export default function StarBackground({ children }: Readonly<{ children: React.ReactNode }>) {
  const mountRef = useRef<HTMLDivElement>(null);
  const auraMeshesRef = useRef<THREE.Mesh[]>([]);
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    // Planets
    const planets = [
      { name: 'venus', size: 0.9, color: 0xf472b6, position: [6, 0, 0], orbitSpeed: 0.02 },
      { name: 'mars', size: 0.5, color: 0xdc2626, position: [10, 0, 0], orbitSpeed: 0.015 },
      { name: 'jupiter', size: 1.8, color: 0xfb923c, position: [13, 0, 0], orbitSpeed: 0.01 },
    ];

    const planetMeshes: THREE.Mesh[] = planets.map(planet => {
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: planet.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(planet.position[0], planet.position[1], planet.position[2]);
      scene.add(mesh);
      return mesh;
    });

    // Stars Background
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(5000 * 3);
    for (let i = 0; i < 15000; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Constellation Lines (including Scorpio)
    const constellations: Record<string, { start: number[]; end: number[] }[]> = {
      'Libra': [
        { start: [6, 2, 0], end: [7, 3, 1] },
        { start: [7, 3, 1], end: [8, 2, 0] },
        { start: [8, 2, 0], end: [7, 1, -1] },
      ],
      'Aries': [
        { start: [5, 1, 0], end: [6, 2, 1] },
        { start: [6, 2, 1], end: [7, 1, 0] },
      ],
      'Scorpio': [
        { start: [5, 2, 1], end: [6, 3, 0] }, // Antares to head
        { start: [6, 3, 0], end: [7, 2, -1] }, // Head to tail
        { start: [7, 2, -1], end: [6.5, 1, -0.5] }, // Tail curve
        { start: [6.5, 1, -0.5], end: [6, 0, 0] }, // Tail to stinger
      ],
      'default': [
        { start: [6, 2, 0], end: [8, 3, 1] },
        { start: [8, 3, 1], end: [7, 2, -1] },
      ],
    };

    let activeConstellation: { start: number[]; end: number[] }[] = constellations['default'];
    const constellationLines: THREE.Line[] = [];
    let zodiac = 'default';
    let isScorpio = false;

    // Scorpio Aura materials (for Scorpio users)
    const auraMaterials: THREE.MeshBasicMaterial[] = planets.map(() => {
      return new THREE.MeshBasicMaterial({
        color: 0xf7dc6f, // .zodiac-scorpio color
        transparent: true,
        opacity: 0,
      });
    });

    async function updateConstellation() {
      // Clear existing lines
      constellationLines.forEach(line => scene.remove(line));
      constellationLines.length = 0;

      // Clear existing aura meshes
      auraMeshesRef.current.forEach(mesh => scene.remove(mesh));
      auraMeshesRef.current = [];

      // Fetch user zodiac
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('zodiac_sign')
          .eq('user_id', user.id)
          .single();
        zodiac = profile?.zodiac_sign || 'default';
        isScorpio = zodiac === 'Scorpio';
      }

      // Create constellation lines
      activeConstellation = constellations[zodiac] || constellations['default'];
      activeConstellation.forEach(({ start, end }) => {
        const material = new THREE.LineBasicMaterial({
          color: zodiac === 'Scorpio' ? 0xf7dc6f : 0x8b5cf6,
          linewidth: 2,
        });
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...start),
          new THREE.Vector3(...end),
        ]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        constellationLines.push(line);
      });

      // Create aura meshes for Scorpio users
      if (isScorpio) {
        const newAuraMeshes = planets.map((planet, i) => {
          const auraGeometry = new THREE.SphereGeometry(planet.size * 1.3, 32, 32);
          const auraMesh = new THREE.Mesh(auraGeometry, auraMaterials[i]);
          scene.add(auraMesh);
          return auraMesh;
        });
        auraMeshesRef.current = newAuraMeshes;
      }
    }
    updateConstellation();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    camera.position.z = 20;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      // Orbit planets
      planetMeshes.forEach((mesh, i) => {
        const { orbitSpeed } = planets[i];
        mesh.position.x = planets[i].position[0] * Math.cos(Date.now() * orbitSpeed * 0.001);
        mesh.position.z = planets[i].position[0] * Math.sin(Date.now() * orbitSpeed * 0.001);
      });
      // Pulse constellation lines
      constellationLines.forEach(line => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.001);
      });
      // Scorpio aura animation
      auraMeshesRef.current.forEach((auraMesh, i) => {
        const material = auraMesh.material as THREE.MeshBasicMaterial;
        material.opacity = isScorpio ? 0.3 + 0.2 * Math.sin(Date.now() * 0.002) : 0;
        auraMesh.position.copy(planetMeshes[i].position);
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle Click for Analytics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = async (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes);
      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const planetName = planets[planetMeshes.indexOf(intersectedMesh)].name;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('analytics_events').insert({
            user_id: user.id,
            event_type: 'constellation_reveal',
            event_data: { planet: planetName, zodiac: zodiac },
            created_at: new Date().toISOString(),
          });
        }
      }
    };
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', onClick);
      currentMount?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="relative min-h-screen starry-background mythic-cosmos-background" aria-label="Cosmic Background with Constellations">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ['#ffffff', '#facc15', '#3b82f6'] },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1 } },
            size: { value: 3, random: true },
            move: { enable: true, speed: 0.5, direction: 'none', random: true, outModes: { default: 'out' } },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
              onClick: { enable: true, mode: 'push' },
            },
            modes: { repulse: { distance: 100 }, push: { quantity: 4 } },
          },
          detectRetina: true,
        }}
      />
      <div className="comet" />
      <div ref={mountRef} className="fixed inset-0 -z-10" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
