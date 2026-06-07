"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface RoomData {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  occupied: number;
  rent: number;
  color: string;
  details: string;
}

const mockRooms: RoomData[] = [
  { id: "1", name: "Premium Single (R1)", floor: 1, capacity: 1, occupied: 1, rent: 12000, color: "#10b981", details: "Ac, Private Balcony, Attached Bath" },
  { id: "2", name: "Double Sharing (R2)", floor: 1, capacity: 2, occupied: 1, rent: 8500, color: "#0284c7", details: "Ac, Attached Bath, Study Table" },
  { id: "3", name: "Triple Sharing (R3)", floor: 1, capacity: 3, occupied: 3, rent: 7000, color: "#d97706", details: "Attached Bath, Individual Wardrobes" },
  { id: "4", name: "Premium Single (R4)", floor: 2, capacity: 1, occupied: 0, rent: 12500, color: "#10b981", details: "Ac, Balcony, Premium View" },
  { id: "5", name: "Double Sharing (R5)", floor: 2, capacity: 2, occupied: 2, rent: 8800, color: "#0284c7", details: "Ac, Fitted wardrobes, Attached Bath" },
  { id: "6", name: "Triple Sharing (R6)", floor: 2, capacity: 3, occupied: 2, rent: 7200, color: "#d97706", details: "Attached Bath, Balcony" },
  { id: "7", name: "Double Sharing (R7)", floor: 3, capacity: 2, occupied: 1, rent: 9000, color: "#0284c7", details: "Ac, Penthouse floor, Attached Bath" },
  { id: "8", name: "Triple Sharing (R8)", floor: 3, capacity: 3, occupied: 3, rent: 7500, color: "#d97706", details: "Spacious Room, Attached Bath" },
  { id: "9", name: "Premium Single (R9)", floor: 3, capacity: 1, occupied: 1, rent: 13000, color: "#10b981", details: "Executive suite, Balcony, Ac" },
];

interface CameraKeyframe {
  progress: number;
  pos: [number, number, number];
  target: [number, number, number];
  rotY: number;
}

const cameraKeyframes: CameraKeyframe[] = [
  { progress: 0.0, pos: [5.2, 3.5, 8.5], target: [0, -0.6, 0], rotY: -Math.PI / 4 }, // Hero
  { progress: 0.25, pos: [-4.0, 1.8, 4.8], target: [-2.8, -0.8, 0], rotY: -Math.PI / 8 }, // Problems
  { progress: 0.50, pos: [0, 1.4, 7.2], target: [0, 0, 0], rotY: 0 }, // Solution
  { progress: 0.75, pos: [3.8, 1.2, 3.8], target: [2.8, 0.6, 0], rotY: Math.PI / 8 }, // Features
  { progress: 1.0, pos: [0, 8.5, 11.5], target: [0, -1.2, 0], rotY: -Math.PI / 4 }, // Pricing
];

function interpolateKeyframes(p: number): { pos: THREE.Vector3; target: THREE.Vector3; rotY: number } {
  const progress = Math.max(0, Math.min(1, p));
  let k1 = cameraKeyframes[0];
  let k2 = cameraKeyframes[cameraKeyframes.length - 1];

  for (let i = 0; i < cameraKeyframes.length - 1; i++) {
    if (progress >= cameraKeyframes[i].progress && progress <= cameraKeyframes[i + 1].progress) {
      k1 = cameraKeyframes[i];
      k2 = cameraKeyframes[i + 1];
      break;
    }
  }

  const range = k2.progress - k1.progress;
  const rawT = range === 0 ? 0 : (progress - k1.progress) / range;
  const t = rawT * rawT * (3 - 2 * rawT); // Smoothstep

  const pos = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...k1.pos),
    new THREE.Vector3(...k2.pos),
    t
  );
  
  const target = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...k1.target),
    new THREE.Vector3(...k2.target),
    t
  );

  const rotY = k1.rotY + (k2.rotY - k1.rotY) * t;

  return { pos, target, rotY };
}

function Bed3D({ position, color }: { position: [positionX: number, positionY: number, positionZ: number]; color: string }) {
  return (
    <group position={position}>
      {/* Bed frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.2, 1.6]} />
        <meshStandardMaterial color="#64748b" roughness={0.6} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.85, 0.15, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.25, -0.55]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Blanket */}
      <mesh position={[0, 0.18, 0.3]} castShadow>
        <boxGeometry args={[0.86, 0.12, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function RoomBox({
  room,
  activeRoom,
  setActiveRoom,
  hoveredRoom,
  setHoveredRoom,
}: {
  room: RoomData;
  activeRoom: RoomData | null;
  setActiveRoom: (r: RoomData) => void;
  hoveredRoom: string | null;
  setHoveredRoom: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isActive = activeRoom?.id === room.id;
  const isHovered = hoveredRoom === room.id;

  const yPos = (room.floor - 1) * 2.6 - 2.0;
  const gridIndex = (parseInt(room.id) - 1) % 3;
  const xPos = (gridIndex - 1) * 2.8;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const offset = isHovered ? Math.sin(time * 5) * 0.04 : 0;
      meshRef.current.position.y = yPos + offset;
    }
  });

  const getBedPositions = (capacity: number): [number, number, number][] => {
    if (capacity === 1) return [[0, -0.3, 0]];
    if (capacity === 2) return [[-0.6, -0.3, 0], [0.6, -0.3, 0]];
    return [[-0.7, -0.3, -0.3], [0, -0.3, 0.3], [0.7, -0.3, -0.3]];
  };

  const bedPositions = getBedPositions(room.capacity);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[xPos, yPos, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveRoom(room);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setHoveredRoom(room.id);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
          setHoveredRoom(null);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.5, 2.0, 2.2]} />
        <meshPhysicalMaterial
          color={isActive ? "#10b981" : isHovered ? "#34d399" : "#ffffff"}
          transparent
          opacity={isActive ? 0.40 : isHovered ? 0.30 : 0.18}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.85}
          thickness={1.5}
          ior={1.45}
        />

        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(2.5, 2.0, 2.2)]} />
          <lineBasicMaterial
            attach="material"
            color={isActive ? "#059669" : isHovered ? "#10b981" : "#475569"}
            linewidth={2}
          />
        </lineSegments>

        {bedPositions.map((pos, idx) => {
          const isOccupied = idx < room.occupied;
          const bedColor = isOccupied ? "#ef4444" : "#10b981";
          return <Bed3D key={idx} position={pos} color={bedColor} />;
        })}

        {(isHovered || isActive) && (
          <Html position={[0, 1.2, 0]} center distanceFactor={8} pointerEvents="none">
            <div className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl border border-slate-800 whitespace-nowrap flex flex-col gap-0.5 select-none leading-none z-50">
              <span className="text-emerald-400 font-extrabold">{room.name}</span>
              <span className="text-slate-400 font-semibold">
                Beds: {room.occupied}/{room.capacity} occupied
              </span>
              <span className="text-amber-400 font-black">₹{room.rent.toLocaleString()}/mo</span>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

function ClutterGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRefs = useRef<THREE.Group>(null);
  const isVisible = scrollProgress < 0.45;
  const opacity = isVisible ? Math.max(0, 1 - (scrollProgress / 0.4)) : 0;
  const scatter = scrollProgress * 15;

  useFrame(() => {
    if (meshRefs.current && isVisible) {
      meshRefs.current.rotation.y = scrollProgress * 2.0;
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={meshRefs} position={[-2.8, -0.8, 0]}>
      {[...Array(6)].map((_, i) => {
        const theta = (i / 6) * Math.PI * 2;
        const radius = 1.8 + Math.sin(i * 1.5) * 0.4;
        const x = Math.cos(theta) * radius + (i % 2 ? scatter : -scatter);
        const y = Math.sin(i * 0.8) * 0.6 + scatter * 0.5;
        const z = Math.sin(theta) * radius + (i % 3 ? -scatter : scatter);

        return (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.6, 0.1, 0.4]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#ef4444" : "#475569"}
              roughness={0.7}
              transparent
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FloorPlates() {
  return (
    <group position={[0, -2.1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>
      <gridHelper args={[12, 12, "#475569", "#334155"]} position={[0, 0.01, 0]} />
    </group>
  );
}

function SceneController({
  scrollProgress,
  activeRoom,
  setActiveRoom,
  hoveredRoom,
  setHoveredRoom,
}: {
  scrollProgress: number;
  activeRoom: RoomData | null;
  setActiveRoom: (r: RoomData) => void;
  hoveredRoom: string | null;
  setHoveredRoom: (id: string | null) => void;
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(5.2, 3.5, 8.5));
  const targetLookAt = useRef(new THREE.Vector3(0, -0.6, 0));
  const targetBuildingRotY = useRef(-Math.PI / 4);
  const currentBuildingRotY = useRef(-Math.PI / 4);
  
  const buildingGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // 1. Interpolate keyframe vectors based on scroll progress
    const { pos, target, rotY } = interpolateKeyframes(scrollProgress);
    
    // If a room is active, override lookAt target to lock onto that room
    if (activeRoom) {
      const gridIndex = (parseInt(activeRoom.id) - 1) % 3;
      const targetX = (gridIndex - 1) * 2.8;
      const targetY = (activeRoom.floor - 1) * 2.6 - 2.0;
      targetLookAt.current.set(targetX, targetY, 0);
    } else {
      targetLookAt.current.copy(target);
    }
    
    targetCamPos.current.copy(pos);
    targetBuildingRotY.current = rotY;

    // 2. Smoothly lerp camera position and building rotation (buttery smooth lerping)
    camera.position.lerp(targetCamPos.current, 0.038);
    
    // Smoothly calculate lookAt
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    state.camera.getWorldDirection(currentLookAt);
    const targetDir = new THREE.Vector3().subVectors(targetLookAt.current, camera.position).normalize();
    const smoothDir = new THREE.Vector3().lerpVectors(currentLookAt, targetDir, 0.038);
    camera.lookAt(camera.position.clone().add(smoothDir));

    // Rotate building group
    currentBuildingRotY.current = THREE.MathUtils.lerp(currentBuildingRotY.current, targetBuildingRotY.current, 0.038);
    if (buildingGroupRef.current) {
      buildingGroupRef.current.rotation.y = currentBuildingRotY.current;
    }
  });

  return (
    <group>
      <group ref={buildingGroupRef}>
        {mockRooms.map((room) => (
          <RoomBox
            key={room.id}
            room={room}
            activeRoom={activeRoom}
            setActiveRoom={setActiveRoom}
            hoveredRoom={hoveredRoom}
            setHoveredRoom={setHoveredRoom}
          />
        ))}
        <FloorPlates />
      </group>
      <ClutterGrid scrollProgress={scrollProgress} />
    </group>
  );
}

export default function ThreeDScene({ scrollProgress }: { scrollProgress: number }) {
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Booting WebGL Canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [5.2, 3.5, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        {/* Bright daylight lighting */}
        <ambientLight intensity={1.15} color="#ffffff" />
        
        {/* Soft colorful glows to keep it looking premium */}
        <pointLight position={[6, 4, -4]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-6, 3, 4]} intensity={1.5} color="#34d399" />
        <pointLight position={[0, -2, 5]} intensity={1.0} color="#fbbf24" />
        
        {/* Directional sunlight for clean shadows */}
        <directionalLight
          position={[12, 18, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />

        <SceneController
          scrollProgress={scrollProgress}
          activeRoom={activeRoom}
          setActiveRoom={setActiveRoom}
          hoveredRoom={hoveredRoom}
          setHoveredRoom={setHoveredRoom}
        />
      </Canvas>

      {/* Floating Room Info Overlay */}
      {activeRoom && (
        <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:w-[320px] bg-white/95 backdrop-blur-xl border border-slate-200/80 p-5 rounded-2xl shadow-2xl transition-all duration-300 z-10 flex flex-col gap-3 select-none text-slate-800">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase leading-none">
              {activeRoom.name}
            </h4>
            <button
              onClick={() => setActiveRoom(null)}
              className="text-slate-400 hover:text-slate-700 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <div className="flex flex-col bg-slate-550/5 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-extrabold uppercase">Floor</span>
              <span className="text-slate-800 font-black text-xs">{activeRoom.floor}</span>
            </div>
            <div className="flex flex-col bg-slate-550/5 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-extrabold uppercase">Rent</span>
              <span className="text-emerald-650 font-black text-xs">₹{activeRoom.rent.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col bg-slate-550/5 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] gap-1 font-bold">
            <span className="text-slate-400 font-extrabold uppercase">Beds Availability</span>
            <div className="flex items-center justify-between">
              <span className="text-slate-800 font-black">
                {activeRoom.occupied} / {activeRoom.capacity} Beds Booked
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                activeRoom.occupied === activeRoom.capacity
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}>
                {activeRoom.occupied === activeRoom.capacity ? "Full" : "Available"}
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-semibold text-[10px] leading-relaxed">
            <strong className="text-slate-700">Features: </strong> {activeRoom.details}
          </p>
        </div>
      )}
    </div>
  );
}
