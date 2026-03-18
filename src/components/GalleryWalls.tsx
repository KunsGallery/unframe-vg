"use client"

import { galleryWalls } from "@/data/galleryWalls"

export default function GalleryWalls() {
  return (
    <>
      {galleryWalls.map((wall) => (
        <mesh
          key={wall.id}
          position={wall.position}
          rotation={wall.rotation}
          castShadow={false}
          receiveShadow
        >
          <boxGeometry args={[wall.length, wall.height, wall.thickness]} />
          <meshStandardMaterial
            color={wall.color ?? "#efeae1"}
            roughness={0.96}
            metalness={0.01}
          />
        </mesh>
      ))}
    </>
  )
}