"use client"

import { useState } from "react"
import { galleryWalls } from "@/data/galleryWalls"

export default function WallEditor() {

  const [selected,setSelected] = useState<any>(null)

  return (
    <div style={{
      position:"fixed",
      left:20,
      bottom:20,
      width:320,
      background:"rgba(0,0,0,0.85)",
      color:"white",
      padding:16,
      borderRadius:10,
      fontSize:12,
      zIndex:9999
    }}>

      <div style={{marginBottom:8}}>
        <b>Wall Editor</b>
      </div>

      {selected ? (
        <>
          <div>ID : {selected.id}</div>

          <div>
            position :
            {JSON.stringify(selected.position)}
          </div>

          <div>
            rotation :
            {JSON.stringify(selected.rotation)}
          </div>

          <button
            style={{
              marginTop:10,
              padding:"6px 10px"
            }}
            onClick={()=>{
              console.log(selected)
            }}
          >
            console.log wall
          </button>
        </>
      ) : (
        <div>벽을 클릭하세요</div>
      )}

    </div>
  )
}