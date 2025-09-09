"use client"

import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, PerspectiveCamera, Text } from "@react-three/drei"
import type * as THREE from "three"

function FloatingBook({
  position,
  rotation,
  color = "#8B4513",
  size = 1,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  color?: string
  size?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002
      meshRef.current.position.x += Math.cos(state.clock.elapsedTime + position[1]) * 0.001
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={[size, size, size]}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color={color} />
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.7, 1.1, 0.02]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
        {/* Book spine */}
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </mesh>
    </Float>
  )
}

function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x += 0.001
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[4, 0, -3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#A0522D" wireframe={true} transparent={true} opacity={0.4} />
      </mesh>
    </Float>
  )
}

function FloatingParticles() {
  const particles = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (particles.current) {
      particles.current.children.forEach((child, index) => {
        child.rotation.y += 0.01 + index * 0.001
        child.position.y += Math.sin(state.clock.elapsedTime + index) * 0.01
      })
    }
  })

  return (
    <group ref={particles}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={2 + i * 0.5} rotationIntensity={0.5} floatIntensity={1 + i * 0.2}>
          <mesh position={[Math.sin(i) * 3, Math.cos(i) * 2, -1 + i * 0.5]}>
            <sphereGeometry args={[0.05 + i * 0.01, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#d2691e" : "#8b4513"} 
              transparent 
              opacity={0.6 + i * 0.05} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function Scene3D() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <Environment preset="sunset" />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#d2691e" />
      <pointLight position={[5, -5, -5]} intensity={0.6} color="#8b4513" />

      {/* Floating Books */}
      <FloatingBook position={[-2, 1, 0]} rotation={[0, 0.3, 0]} color="#8B4513" />
      <FloatingBook position={[2, -1, -1]} rotation={[0, -0.3, 0]} color="#A0522D" />
      <FloatingBook position={[-1, -2, 1]} rotation={[0, 0.8, 0]} color="#D2691E" />
      <FloatingBook position={[1, 2, -0.5]} rotation={[0, -0.5, 0]} color="#CD853F" />
      <FloatingBook position={[-3, 0, 0.5]} rotation={[0, 1.2, 0]} color="#B8860B" size={0.8} />
      <FloatingBook position={[3, 1, -0.8]} rotation={[0, -1.0, 0]} color="#DAA520" size={0.9} />

      <RotatingGlobe />
      <FloatingParticles />

      {/* 3D Text */}
      <Text
        font="/fonts/Geist-Bold.ttf"
        fontSize={0.8}
        position={[-2, 0, 0]}
        anchorX="left"
        color="#8B4513"
      >
        DAVEL
      </Text>
    </>
  )
}

export function FloatingBooks() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
    </div>
  )
}
