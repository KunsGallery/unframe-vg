"use client"

import { galleryWalls } from "@/data/galleryWalls"
import { useState } from "react"
import { TransformControls } from "@react-three/drei"

export default function WallDebug() {

  const [walls,setWalls] = useState(galleryWalls)
  const [selected,setSelected] = useState<any>(null)

  return (
    <>
      {walls.map((wall)=>{

        const isSelected = selected?.id === wall.id

        const mesh = (
          <mesh
            key={wall.id}
            position={wall.position}
            rotation={wall.rotation}
            onClick={(e)=>{
              e.stopPropagation()
              setSelected(wall)
            }}
          >
            <planeGeometry args={[wall.length,2.5]} />

            <meshBasicMaterial
              color={isSelected ? "#ff4444" : "#3fa9ff"}
              transparent
              opacity={0.35}
            />

          </mesh>
        )

        if(isSelected){

          return (
            <TransformControls
              key={wall.id}
              mode="translate"
              position={wall.position}
              rotation={wall.rotation}
              onObjectChange={(e:any)=>{

                const obj = e.target.object

                const updated = {
                  ...wall,
                  position:[obj.position.x,obj.position.y,obj.position.z] as [number,number,number],
                  rotation:[obj.rotation.x,obj.rotation.y,obj.rotation.z] as [number,number,number]
                }

                console.log("UPDATED WALL",updated)

                setWalls(prev =>
                  prev.map(w =>
                    w.id === wall.id ? updated : w
                  )
                )

                setSelected(updated)

              }}
            >
              {mesh}
            </TransformControls>
          )

        }

        return mesh

      })}
    </>
  )
}