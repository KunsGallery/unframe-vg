"use client"

import { galleryWalls } from "@/data/galleryWalls"

export default function WallDebug() {

  return (
    <>
      {galleryWalls.map((wall)=>(
        <group
          key={wall.id}
          position={wall.position}
          rotation={wall.rotation}
        >

          <mesh>

            <planeGeometry args={[wall.length, 3]} />

            <meshBasicMaterial
              color="cyan"
              transparent
              opacity={0.25}
            />

          </mesh>

        </group>
      ))}
    </>
  )

}