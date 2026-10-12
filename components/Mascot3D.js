'use client';

/**
 * "Lazy" — the LazyDev 3D mascot, built entirely from code (no model files).
 * A glossy vinyl-toy bunny in a pink hoodie. Variants:
 *   hero   → standing, waving, holding a coffee, browser windows floating behind
 *   lounge → sitting on a cloud with a rose-gold laptop (the lazy dev at work)
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const C = {
  fur: '#ffe9f2',
  inner: '#ff8cc0',
  hoodie: '#ff4fa3',
  hoodieDark: '#e0388a',
  bow: '#b892ff',
  eye: '#1d0a1f',
  blush: '#ff7fb5',
  roseGold: '#f2b8a6',
  peach: '#ffb59a',
  cloud: '#ffdcec',
};

// Pointer position across the whole window, shared by all scenes (-1..1)
const pointer = { x: 0, y: 0 };

function Glossy({ color, rough = 0.38, ...rest }) {
  return <meshPhysicalMaterial color={color} roughness={rough} clearcoat={1} clearcoatRoughness={0.18} {...rest} />;
}

function useHeartGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.3);
    s.bezierCurveTo(0, 0.33, -0.05, 0.45, -0.25, 0.45);
    s.bezierCurveTo(-0.55, 0.45, -0.55, 0.1, -0.55, 0.1);
    s.bezierCurveTo(-0.55, -0.1, -0.35, -0.32, 0, -0.5);
    s.bezierCurveTo(0.35, -0.32, 0.55, -0.1, 0.55, 0.1);
    s.bezierCurveTo(0.55, 0.1, 0.55, 0.45, 0.25, 0.45);
    s.bezierCurveTo(0.1, 0.45, 0, 0.33, 0, 0.3);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.18, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 8, curveSegments: 24,
    });
    g.center();
    return g;
  }, []);
}

function Heart({ position, scale = 0.4, color = C.hoodie, speed = 2 }) {
  const geo = useHeartGeometry();
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.8 + position[0]) * 0.6;
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} geometry={geo} position={position} scale={scale}>
        <Glossy color={color} rough={0.25} />
      </mesh>
    </Float>
  );
}

function Mug(props) {
  const heart = useHeartGeometry();
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.13, 0.3, 32]} />
        <Glossy color={C.peach} />
      </mesh>
      <mesh position={[0.16, 0, 0]}>
        <torusGeometry args={[0.075, 0.025, 12, 24]} />
        <Glossy color={C.peach} />
      </mesh>
      <mesh position={[0, 0.146, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 24]} />
        <meshStandardMaterial color="#6b3b2a" roughness={0.3} />
      </mesh>
      <mesh geometry={heart} position={[0, 0, 0.15]} scale={0.09}>
        <Glossy color={C.hoodie} />
      </mesh>
    </group>
  );
}

function Arm({ side, rotation, armRef, children }) {
  return (
    <group ref={armRef} position={[side * 0.58, -0.2, 0]} rotation={rotation}>
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.13, 0.38, 8, 16]} />
        <Glossy color={C.hoodie} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <Glossy color={C.fur} />
      </mesh>
      {children}
    </group>
  );
}

function Ear({ side, rotation }) {
  return (
    <group position={[side * 0.32, 1.55, -0.1]} rotation={rotation}>
      <mesh>
        <capsuleGeometry args={[0.17, 0.8, 8, 20]} />
        <Glossy color={C.fur} />
      </mesh>
      <mesh position={[0, -0.02, 0.1]} scale={[1, 1, 0.45]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        <Glossy color={C.inner} />
      </mesh>
    </group>
  );
}

function Head({ headRef, eyesRef }) {
  return (
    <group ref={headRef} position={[0, 0.1, 0]}>
      <mesh position={[0, 0.65, 0]} scale={[1.08, 0.95, 0.98]}>
        <sphereGeometry args={[0.82, 48, 48]} />
        <Glossy color={C.fur} />
      </mesh>
      <Ear side={-1} rotation={[0, 0, 0.18]} />
      <Ear side={1} rotation={[-0.25, 0, -0.42]} />

      {/* bow */}
      <group position={[0.42, 1.28, 0.2]} rotation={[0, 0, -0.35]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.16, 0, 0]} rotation={[0, 0, s * 0.35]} scale={[1, 0.65, 0.45]}>
            <sphereGeometry args={[0.19, 24, 24]} />
            <Glossy color={C.bow} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <Glossy color={C.bow} />
        </mesh>
      </group>

      {/* eyes (group scales on Y to blink) */}
      <group ref={eyesRef} position={[0, 0.68, 0]}>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.3, 0, 0.73]}>
            <mesh scale={[0.85, 1.1, 0.5]}>
              <sphereGeometry args={[0.14, 32, 32]} />
              <meshPhysicalMaterial color={C.eye} roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[0.045, 0.06, 0.06]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.04, -0.05, 0.065]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* blush */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.52, 0.48, 0.6]} rotation={[0, s * 0.55, 0]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color={C.blush} transparent opacity={0.75} roughness={0.6} />
        </mesh>
      ))}

      {/* nose + smile */}
      <mesh position={[0, 0.54, 0.79]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <Glossy color={C.hoodie} />
      </mesh>
      <mesh position={[0, 0.47, 0.765]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.06, 0.016, 8, 24, Math.PI]} />
        <meshStandardMaterial color={C.eye} />
      </mesh>
    </group>
  );
}

function Body({ lounge }) {
  return (
    <>
      <mesh position={[0, -0.55, 0]} scale={[0.7, 0.8, 0.62]}>
        <sphereGeometry args={[1, 48, 48]} />
        <Glossy color={C.hoodie} />
      </mesh>
      {/* hood */}
      <mesh position={[0, 0.1, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.16, 16, 40]} />
        <Glossy color={C.hoodie} />
      </mesh>
      {/* drawstrings */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.12, -0.17, 0.52]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.3, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {!lounge && (
        <RoundedBox args={[0.7, 0.32, 0.1]} radius={0.05} position={[0, -0.75, 0.56]} rotation={[-0.25, 0, 0]}>
          <Glossy color={C.hoodieDark} />
        </RoundedBox>
      )}
      {/* feet */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={lounge ? [s * 0.36, -1.18, 0.72] : [s * 0.3, -1.35, 0.18]}
          scale={[0.24, 0.15, 0.32]}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <Glossy color={C.fur} />
        </mesh>
      ))}
    </>
  );
}

function Laptop(props) {
  const heart = useHeartGeometry();
  return (
    <group {...props}>
      <RoundedBox args={[1.15, 0.06, 0.78]} radius={0.025}>
        <meshPhysicalMaterial color={C.roseGold} metalness={0.75} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <group position={[0, 0.03, -0.36]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[1.15, 0.78, 0.05]} radius={0.025} position={[0, 0.39, 0]}>
          <meshPhysicalMaterial color={C.roseGold} metalness={0.75} roughness={0.25} clearcoat={1} />
        </RoundedBox>
        <mesh geometry={heart} position={[0, 0.4, 0.04]} scale={0.2}>
          <meshStandardMaterial color="#ffffff" emissive={C.hoodie} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Cloud() {
  const puffs = [
    [0, 0, 0, 0.9], [-0.8, -0.05, 0.1, 0.65], [0.8, -0.05, 0.1, 0.65],
    [-0.4, 0.05, 0.45, 0.6], [0.4, 0.05, 0.45, 0.6], [0, -0.05, -0.4, 0.7],
  ];
  return (
    <group position={[0, -1.5, 0.2]}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[r, 32, 32]} />
          <Glossy color={C.cloud} rough={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Bunny({ pose }) {
  const root = useRef();
  const head = useRef();
  const eyes = useRef();
  const waveArm = useRef();
  const lounge = pose === 'lounge';

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const damp = THREE.MathUtils.damp;
    if (head.current) {
      head.current.rotation.y = damp(head.current.rotation.y, pointer.x * 0.55, 4, dt);
      head.current.rotation.x = damp(head.current.rotation.x, -pointer.y * 0.25 + (lounge ? 0.12 : 0), 4, dt);
      head.current.rotation.z = Math.sin(t * 1.3) * 0.05;
    }
    if (eyes.current) eyes.current.scale.y = t % 3.8 < 0.13 ? 0.12 : 1;
    if (waveArm.current) waveArm.current.rotation.z = 2.2 + Math.sin(t * 5) * 0.3;
    if (root.current) root.current.rotation.y = damp(root.current.rotation.y, pointer.x * 0.2, 3, dt);
  });

  return (
    <group ref={root}>
      <Head headRef={head} eyesRef={eyes} />
      <Body lounge={lounge} />
      {lounge ? (
        <>
          <Arm side={-1} rotation={[-1.15, 0, 0.35]} />
          <Arm side={1} rotation={[-1.15, 0, -0.35]} />
          <Laptop position={[0, -0.82, 1.05]} />
          <Cloud />
        </>
      ) : (
        <>
          <Arm side={1} rotation={[0, 0, 2.2]} armRef={waveArm} />
          <Arm side={-1} rotation={[-1.0, 0, 0.4]}>
            <Mug position={[0, -0.66, 0.16]} rotation={[1.0, 0, -0.4]} />
          </Arm>
        </>
      )}
    </group>
  );
}

function BrowserPanel({ position, rotation, accent }) {
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.8}>
      <group position={position} rotation={rotation}>
        <RoundedBox args={[1.9, 1.3, 0.06]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial color="#2a1231" roughness={0.3} clearcoat={1} />
        </RoundedBox>
        {['#ff5f8f', '#ffbd6b', '#c9a7ff'].map((c, i) => (
          <mesh key={c} position={[-0.8 + i * 0.09, 0.55, 0.035]}>
            <circleGeometry args={[0.025, 16]} />
            <meshBasicMaterial color={c} />
          </mesh>
        ))}
        <mesh position={[-0.25, 0.25, 0.035]}>
          <planeGeometry args={[1.1, 0.14]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        <mesh position={[-0.4, 0.06, 0.035]}>
          <planeGeometry args={[0.8, 0.07]} />
          <meshBasicMaterial color="#ffd6ea" transparent opacity={0.55} />
        </mesh>
        <mesh position={[-0.6, -0.1, 0.035]}>
          <planeGeometry args={[0.4, 0.11]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {[-0.58, 0, 0.58].map((x) => (
          <mesh key={x} position={[x, -0.4, 0.035]}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshBasicMaterial color="#45204f" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Scene({ variant }) {
  const hero = variant === 'hero';
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff2f8" />
      <pointLight position={[-3, 1, 2.5]} intensity={18} color="#ff4fa3" />
      <pointLight position={[2.5, 2, -2.5]} intensity={28} color="#b892ff" />

      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, -2]} scale={[10, 5, 1]} color="#ffe0ef" />
        <Lightformer intensity={3} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[5, 3, 1]} color="#ff4fa3" />
        <Lightformer intensity={2.5} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} color="#b892ff" />
        <Lightformer intensity={1.5} position={[0, 0, 5]} scale={[6, 3, 1]} color="#ffffff" />
      </Environment>

      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={hero ? 0.5 : 0.35}>
        <group position={[0, hero ? -0.1 : 0.05, 0]} scale={hero ? 1 : 0.95}>
          <Bunny pose={hero ? 'wave' : 'lounge'} />
        </group>
      </Float>

      {hero ? (
        <>
          <BrowserPanel position={[-2.3, 0.9, -1.6]} rotation={[0, 0.4, 0]} accent="#ff4fa3" />
          <BrowserPanel position={[2.3, 0.1, -1.8]} rotation={[0, -0.4, 0]} accent="#b892ff" />
          <Heart position={[-1.7, -0.7, 0.6]} scale={0.32} />
          <Heart position={[1.75, 1.45, 0.2]} scale={0.24} color={C.bow} speed={2.6} />
          <Heart position={[1.5, -1.0, 0.8]} scale={0.18} color={C.peach} speed={3} />
        </>
      ) : (
        <>
          <Heart position={[-1.6, 1.0, 0]} scale={0.28} />
          <Heart position={[1.6, 0.6, 0.2]} scale={0.2} color={C.bow} speed={2.6} />
          <Mug position={[1.45, -0.55, 0.4]} rotation={[0.2, -0.5, 0.15]} scale={1.3} />
        </>
      )}

      <Sparkles count={45} scale={[6, 4, 3]} size={3.5} speed={0.35} color="#ffc2e0" opacity={0.9} />
      <ContactShadows position={[0, hero ? -1.55 : -1.85, 0]} opacity={0.55} scale={7} blur={2.6} far={3} color="#3a0a2a" />
    </>
  );
}

export default function Mascot3D({ variant = 'hero', active = true }) {
  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.25, 7.2], fov: 35 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene variant={variant} />
    </Canvas>
  );
}
