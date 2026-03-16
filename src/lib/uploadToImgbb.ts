export async function uploadToImgbb(file: File) {

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY

  const formData = new FormData()
  formData.append("image", file)

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData
    }
  )

  const data = await res.json()

  return data.data.url
}