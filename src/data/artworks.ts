export type Artwork = {
  id: string
  title: string
  artist: string
  image: string
  position: [number, number, number]
}

export const artworks: Artwork[] = [
  {
    id: "dreaming-island",
    title: "Dreaming Island",
    artist: "Artist Name",
    image: "/artworks/painting1.webp",
    position: [-2, 1.6, -4.9]
  },
  {
    id: "mind-spectrum",
    title: "Mind Spectrum",
    artist: "Artist Name",
    image: "/artworks/painting1.webp",
    position: [0, 1.6, -4.9]
  },
  {
    id: "return-innocent",
    title: "Return to Innocent",
    artist: "Artist Name",
    image: "/artworks/painting1.webp",
    position: [2, 1.6, -4.9]
  }
]