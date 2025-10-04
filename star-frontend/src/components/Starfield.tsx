'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-expect-error - OrbitControls import path may vary by Three.js version
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-expect-error - Post-processing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// @ts-expect-error - Post-processing imports
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// @ts-expect-error - Post-processing imports
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// @ts-expect-error - Lensflare import
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

export default function Starfield() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 30));
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountElement.appendChild(rendererRef.current.domElement);

    // Post-processing setup
    composerRef.current = new EffectComposer(rendererRef.current);
    const renderPass = new RenderPass(scene, camera);
    composerRef.current.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Strength
      0.4, // Radius
      0.85 // Threshold
    );
    composerRef.current.addPass(bloomPass);

    // Starfield setup
    const starCount = 2000;
    const instancePositions = new Float32Array(starCount * 3);
    const instanceColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      instancePositions[i * 3] = (Math.random() - 0.5) * 1500;
      instancePositions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
      instancePositions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
      instanceColors[i * 3] = Math.random() * 0.5 + 0.5;
      instanceColors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      instanceColors[i * 3 + 2] = Math.random() * 0.5 + 0.5;
    }

    const baseGeometry = new THREE.SphereGeometry(0.01, 8, 8);
    const starsGeometry = new THREE.InstancedBufferGeometry();
    starsGeometry.attributes.position = baseGeometry.attributes.position;
    starsGeometry.attributes.normal = baseGeometry.attributes.normal;
    starsGeometry.attributes.uv = baseGeometry.attributes.uv;
    starsGeometry.index = baseGeometry.index;
    starsGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
    starsGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));
    starsGeometry.instanceCount = starCount;

    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 instancePosition;
        attribute vec3 instanceColor;
        varying vec3 vColor;
        void main() {
          vColor = instanceColor;
          vec3 pos = position + instancePosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vColor;
        void main() {
          float intensity = sin(uTime + gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01) * 0.3 + 0.7;
          gl_FragColor = vec4(vColor * intensity, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const starField = new THREE.Mesh(starsGeometry, starsMaterial);
    scene.add(starField);

    // Planet 1 setup
    const planet1Geometry = new THREE.SphereGeometry(3, 64, 64);
    const planet1Material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x1e90ff) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simple noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);

          // Add some surface variation
          float surfaceNoise = noise(vUv * 20.0 + uTime * 0.1) * 0.2;
          vec3 color = uColor * (0.8 + surfaceNoise) * (0.5 + diff * 0.5);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    const planet1 = new THREE.Mesh(planet1Geometry, planet1Material);
    scene.add(planet1);

    // Planet 1 atmosphere
    const planet1AtmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x1e90ff) },
        uIntensity: { value: 1.5 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
          gl_FragColor = vec4(uColor * fresnel * uIntensity, fresnel);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const planet1Atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 64, 64),
      planet1AtmosphereMaterial
    );
    planet1.add(planet1Atmosphere);

    // Planet 1 ring system
    const ringGeometry = new THREE.RingGeometry(4, 5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    planet1.add(ring);

    // Planet 2 setup
    const planet2Geometry = new THREE.SphereGeometry(2, 64, 64);
    const planet2Material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff4500) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simple noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);

          // Add some surface variation
          float surfaceNoise = noise(vUv * 15.0 + uTime * 0.05) * 0.3;
          vec3 color = uColor * (0.7 + surfaceNoise) * (0.4 + diff * 0.6);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    const planet2 = new THREE.Mesh(planet2Geometry, planet2Material);
    scene.add(planet2);

    // Planet 2 atmosphere
    const planet2AtmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff4500) },
        uIntensity: { value: 1.5 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
          gl_FragColor = vec4(uColor * fresnel * uIntensity, fresnel);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const planet2Atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 64, 64),
      planet2AtmosphereMaterial
    );
    planet2.add(planet2Atmosphere);

    // Planet 2 aurora effect
    const auroraCount = 200;
    const auroraPositions = new Float32Array(auroraCount * 3);
    for (let i = 0; i < auroraCount * 3; i += 3) {
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * 2 * Math.PI;
      const radius = 2.3;
      auroraPositions[i] = radius * Math.sin(theta) * Math.cos(phi);
      auroraPositions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      auroraPositions[i + 2] = radius * Math.cos(theta);
    }
    const auroraGeometry = new THREE.BufferGeometry();
    auroraGeometry.setAttribute('position', new THREE.BufferAttribute(auroraPositions, 3));
    const auroraMaterial = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 0.2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const aurora = new THREE.Points(auroraGeometry, auroraMaterial);
    planet2.add(aurora);

    // Nebula setup
    const nebulaCount = 1000;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaSizes = new Float32Array(nebulaCount);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount * 3; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 50 + Math.random() * 20;
      nebulaPositions[i] = radius * Math.sin(phi) * Math.cos(theta) + 15;
      nebulaPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      nebulaPositions[i + 2] = radius * Math.cos(phi) - 20;
      nebulaSizes[i / 3] = 5 + Math.random() * 5;
      nebulaColors[i] = 0.2 + Math.random() * 0.3;
      nebulaColors[i + 1] = 0.1 + Math.random() * 0.2;
      nebulaColors[i + 2] = 0.4 + Math.random() * 0.4;
    }

    const nebulaGeometry = new THREE.BufferGeometry();
    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaSizes, 1));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 color;
        attribute float size;
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vColor = color;
          vSize = size;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size;
        }
      `,
      fragmentShader: `
        // Simplex noise functions
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 =   v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        uniform float uTime;
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;

          float noise = snoise(vec3(uv * 10.0, uTime * 0.1)) * 0.5 + 0.5;
          float alpha = noise * 0.8 + 0.2;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Lens flare
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(null, 512, 0));
    lensflare.addElement(new LensflareElement(null, 512, 0));
    lensflare.addElement(new LensflareElement(null, 60, 0.6));
    lensflare.addElement(new LensflareElement(null, 70, 0.7));
    lensflare.addElement(new LensflareElement(null, 120, 0.9));
    lensflare.addElement(new LensflareElement(null, 70, 1));
    pointLight.add(lensflare);

    camera.position.z = 30;

    // Orbit controls
    controlsRef.current = new OrbitControls(camera, rendererRef.current.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.minDistance = 10;
    controlsRef.current.maxDistance = 100;
    controlsRef.current.enablePan = true;
    controlsRef.current.rotateSpeed = 0.5;

    // Click handler for planet zoom
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([planet1, planet2]);
      if (intersects.length > 0) {
        const target = intersects[0].object.position.clone();
        target.z += 8;
        cameraTargetRef.current.copy(target);
      }
    };
    window.addEventListener('click', onClick);

    // Animation loop
    const animate = (currentTime: number) => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Update shader uniforms
      starsMaterial.uniforms.uTime.value += 0.05;
      nebulaMaterial.uniforms.uTime.value += 0.02;
      planet1Material.uniforms.uTime.value += 0.01;
      planet2Material.uniforms.uTime.value += 0.015;

      // Starfield rotation
      starField.rotation.y += 0.05;

      // Planet 1 elliptical orbit
      const orbitSpeed1 = 0.2;
      planet1.position.set(
        12 * Math.cos(currentTime * 0.001 * orbitSpeed1),
        0,
        -20 + 8 * Math.sin(currentTime * 0.001 * orbitSpeed1)
      );
      planet1.rotation.y += 0.002;

      // Planet 2 elliptical orbit
      const orbitSpeed2 = 0.3;
      planet2.position.set(
        -10 * Math.cos(currentTime * 0.001 * orbitSpeed2),
        6 * Math.sin(currentTime * 0.001 * orbitSpeed2),
        -15
      );
      planet2.rotation.y += 0.003;

      // Aurora animation
      auroraMaterial.color.setHSL(
        (currentTime * 0.1) % 1,
        0.8,
        0.5
      );

      // Nebula animation
      nebula.position.x += Math.sin(currentTime * 0.001) * 0.05;
      nebula.position.y += Math.cos(currentTime * 0.0015) * 0.03;
      nebula.rotation.z += 0.001;

      // Smooth camera zoom
      camera.position.lerp(cameraTargetRef.current, 0.05);
      controlsRef.current?.update();

      composerRef.current?.render();
    };
    requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      composerRef.current?.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', onClick);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (rendererRef.current) {
        const rendererElement = rendererRef.current.domElement;
        if (mountElement.contains(rendererElement)) {
          mountElement.removeChild(rendererElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 mythic-cosmos-background"
    />
  );
}