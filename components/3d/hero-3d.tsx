"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Float, Environment, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Globe } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type * as THREE from "three"

function FloatingBook({
  position,
  rotation,
}: { position: [number, number, number]; rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.01
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.7, 1.1, 0.02]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      </mesh>
    </Float>
  )
}

function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[3, 0, -2]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#A0522D" wireframe={true} transparent={true} opacity={0.6} />
      </mesh>
    </Float>
  )
}

function Scene3D() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />
      <Environment preset="sunset" />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#d2691e" />
      <pointLight position={[5, -5, -5]} intensity={0.6} color="#8b4513" />

      <FloatingBook position={[-2, 1, 0]} rotation={[0, 0.3, 0]} />
      <FloatingBook position={[2, -1, -1]} rotation={[0, -0.3, 0]} />
      <FloatingBook position={[-1, -2, 1]} rotation={[0, 0.8, 0]} />
      <FloatingBook position={[1, 2, -0.5]} rotation={[0, -0.5, 0]} />

      <RotatingGlobe />

      {/* Add floating particles */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[-3, 2, -1]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#d2691e" transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={1.5}>
        <mesh position={[3, -2, 1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#8b4513" transparent opacity={0.6} />
        </mesh>
      </Float>

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

export function Hero3D() {
  const { data: session } = useSession()
  const [heroContent, setHeroContent] = useState({
    title: "Welcome to Davel Library",
    subtitle: "Experience the future of library management with our interactive 3D interface, comprehensive book catalog, and community-driven features."
  })

  useEffect(() => {
    fetchHeroContent()
  }, [])

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setHeroContent({
          title: data.hero.title,
          subtitle: data.hero.subtitle
        })
      }
    } catch (error) {
      console.error('Error fetching hero content:', error)
    }
  }
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F5DC] via-white to-[#F5F5DC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/20 via-transparent to-[#D2691E]/20 dark:from-[#d2691e]/30 dark:to-[#f4a460]/30 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">{heroContent.title}</h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {heroContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!session && (
              <Link href="/apply">
                <Button size="lg" className="bg-[#8B4513] hover:bg-[#A0522D] dark:bg-[#d2691e] dark:hover:bg-[#f4a460] text-white px-8 py-3">
                  Apply for Membership
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/catalog">
              <Button
                variant="outline"
                size="lg"
                className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white dark:border-[#d2691e] dark:text-[#d2691e] dark:hover:bg-[#d2691e] dark:hover:text-white px-8 py-3 bg-transparent"
              >
                Browse Catalog
                <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-[#8B4513] dark:text-[#d2691e] mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">10,000+ Books</h3>
              <p className="text-gray-600 dark:text-gray-400">Digital and physical collection</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-[#A0522D] dark:text-[#f4a460] mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Active Community</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect with fellow readers</p>
            </div>
            <div className="text-center">
              <Globe className="h-8 w-8 text-[#D2691E] dark:text-[#ffd700] mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">24/7 Access</h3>
              <p className="text-gray-600 dark:text-gray-400">Available anytime, anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
