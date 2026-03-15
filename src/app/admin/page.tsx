"use client"

import { useState } from "react"

export default function AdminPage() {

  const [title, setTitle] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [wall, setWall] = useState("left_A")

  const submit = () => {

    const data = {
      title,
      width_cm: Number(width),
      height_cm: Number(height),
      wallId: wall
    }

    console.log("UPLOAD", data)

  }

  return (
    <div style={{ padding: 40 }}>

      <h1>Artwork Upload</h1>

      <input
        placeholder="title"
        onChange={e => setTitle(e.target.value)}
      />

      <input
        placeholder="width cm"
        onChange={e => setWidth(e.target.value)}
      />

      <input
        placeholder="height cm"
        onChange={e => setHeight(e.target.value)}
      />

      <select onChange={e => setWall(e.target.value)}>
        <option>left_A</option>
        <option>left_B</option>
        <option>right_A</option>
        <option>right_B</option>
        <option>bottom_A</option>
        <option>bottom_B</option>
        <option>circle_1</option>
        <option>circle_2</option>
        <option>circle_3</option>
      </select>

      <button onClick={submit}>upload</button>

    </div>
  )
}