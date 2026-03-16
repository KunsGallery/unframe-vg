"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToImgbb } from "@/lib/uploadToImgbb"

const WALL_OPTIONS = [
  "left_01",
  "left_02",
  "left_03",
  "left_04",
  "left_05",
  "right_01",
  "right_02",
  "right_03",
  "right_04",
  "right_05",
  "info_wall",
]

export default function AdminPage() {

  const [title,setTitle] = useState("")
  const [artist,setArtist] = useState("")
  const [wallId,setWallId] = useState("left_01")
  const [widthCm,setWidthCm] = useState("")
  const [heightCm,setHeightCm] = useState("")
  const [order,setOrder] = useState("1")
  const [file,setFile] = useState<File | null>(null)
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    if(!file){
      setMessage("이미지를 먼저 선택해주세요.")
      return
    }

    if(!title || !artist || !widthCm || !heightCm){
      setMessage("제목, 작가명, 가로/세로(cm)를 입력해주세요.")
      return
    }

    try{

      setLoading(true)
      setMessage("이미지 업로드 중...")

      const imageUrl = await uploadToImgbb(file)

      setMessage("작품 정보 저장 중...")

      await addDoc(collection(db,"artworks"),{
        title,
        artist,
        wallId,
        width_cm:Number(widthCm),
        height_cm:Number(heightCm),
        order:Number(order),
        imageUrl,
        createdAt:serverTimestamp()
      })

      setMessage("업로드 완료!")

      setTitle("")
      setArtist("")
      setWidthCm("")
      setHeightCm("")
      setOrder("1")
      setFile(null)

    }catch(error){

      console.error(error)
      setMessage("업로드 중 오류가 발생했습니다.")

    }finally{

      setLoading(false)

    }

  }

  return(

    <main style={{padding:40,maxWidth:720,margin:"0 auto"}}>

      <h1 style={{marginBottom:24}}>Virtual Gallery Admin</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display:"grid",
          gap:16,
          padding:24,
          border:"1px solid #ddd",
          borderRadius:12
        }}
      >

        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          placeholder="작품 제목"
          style={{padding:12,fontSize:16}}
        />

        <input
          value={artist}
          onChange={(e)=>setArtist(e.target.value)}
          placeholder="작가명"
          style={{padding:12,fontSize:16}}
        />

        <select
          value={wallId}
          onChange={(e)=>setWallId(e.target.value)}
          style={{padding:12,fontSize:16}}
        >
          {WALL_OPTIONS.map(wall=>(
            <option key={wall} value={wall}>{wall}</option>
          ))}
        </select>

        <input
          value={widthCm}
          onChange={(e)=>setWidthCm(e.target.value)}
          placeholder="작품 가로(cm)"
          type="number"
          style={{padding:12,fontSize:16}}
        />

        <input
          value={heightCm}
          onChange={(e)=>setHeightCm(e.target.value)}
          placeholder="작품 세로(cm)"
          type="number"
          style={{padding:12,fontSize:16}}
        />

        <input
          value={order}
          onChange={(e)=>setOrder(e.target.value)}
          placeholder="벽 안에서의 순서"
          type="number"
          style={{padding:12,fontSize:16}}
        />

        {/* 파일 선택 */}
        <div style={{display:"flex",gap:10,alignItems:"center"}}>

          <input
            type="file"
            accept="image/*"
            onChange={(e)=>setFile(e.target.files?.[0] || null)}
          />

          {file && (
            <span style={{fontSize:14,color:"#555"}}>
              선택됨: {file.name}
            </span>
          )}

        </div>

        {/* 업로드 버튼 */}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding:14,
            fontSize:16,
            border:"none",
            borderRadius:10,
            background:loading?"#999":"#111",
            color:"#fff",
            cursor:loading?"not-allowed":"pointer"
          }}
        >
          {loading ? "업로드 중..." : "작품 등록"}
        </button>

        {message && (
          <p style={{margin:0,fontSize:14,color:"#333"}}>
            {message}
          </p>
        )}

      </form>

    </main>

  )

}