"use client"

import { galleryWalls, type Wall } from "@/data/galleryWalls"
import { layoutArtworks } from "@/lib/layoutEngine"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"
import { useArtworkStore } from "@/store/useArtworkStore"

type ArtworkInput = {
  id: string
  title?: string
  artist?: string
  imageUrl: string
  wallId: string
  width_cm: number
  height_cm: number
}

type ArtworkLayout = ArtworkInput & {
  offsetX: number
  width_m: number
  height_m: number
}

type ArtworkRendererProps = {
  artworks: ArtworkInput[]
  spacing_cm?: number
  centerLine_cm?: number
}

function Frame({
  image,
  width,
  height,
  art
}: any) {

  const texture = useTexture(image) as THREE.Texture
  texture.colorSpace = THREE.SRGBColorSpace

  const open = useArtworkStore((state)=>state.open)

  const [hover,setHover] = useState(false)

  return (
    <group
      onPointerOver={(e)=>{
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={()=>setHover(false)}
      onClick={(e)=>{
        e.stopPropagation()

        open({
          id:art.id,
          title:art.title,
          artist:art.artist,
          imageUrl:art.imageUrl,
          width_cm:art.width_m*100,
          height_cm:art.height_m*100
        })
      }}
    >

      {/* frame */}
      <mesh position={[0,0,-0.02]}>
        <boxGeometry args={[width+0.08,height+0.08,0.04]} />

        <meshStandardMaterial
          color={hover ? "#3fd0ff" : "#111"}
          emissive={hover ? "#1a9cff" : "#000"}
          emissiveIntensity={hover ? 0.8 : 0}
        />

      </mesh>

      {/* artwork */}
      <mesh name="artwork">
        <planeGeometry args={[width,height]} />
        <meshBasicMaterial map={texture}/>
      </mesh>

    </group>
  )
}

export default function ArtworkRenderer({
  artworks,
  spacing_cm = 80,
  centerLine_cm = 150,
}: ArtworkRendererProps) {

  const { camera, scene } = useThree()

  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2(0, 0))

  useFrame(() => {
    mouse.current.set(0, 0)

    raycaster.current.setFromCamera(mouse.current, camera)

    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const obj = intersects[0].object

      if (obj.name === "artwork") {
        document.body.style.cursor = "pointer"
      } else {
        document.body.style.cursor = "default"
      }
    }
  })

  const spacing = spacing_cm / 100
  const centerLine = centerLine_cm / 100

  const walls: { wall: Wall; layout: ArtworkLayout[] }[] =
    galleryWalls.map((wall) => {

      const wallArts = artworks.filter((a) => a.wallId === wall.id)

      const layout = layoutArtworks(
        wall.length,
        wallArts,
        spacing
      ) as ArtworkLayout[]

      return { wall, layout }
    })

  return (
    <>
      {walls.map(({ wall, layout }) =>
        layout.map((art) => {

          const y = centerLine - art.height_m / 2
          const innerPosition: [number, number, number] = [
            art.offsetX,
            y,
            0.05,
          ]

          return (
            <group
              key={art.id}
              position={wall.position}
              rotation={wall.rotation}
            >
              <group position={innerPosition}>
                <Frame
                  art={art}
                  image={art.imageUrl}
                  width={art.width_m}
                  height={art.height_m}
                />
              </group>
            </group>
          )
        })
      )}
    </>
  )
}