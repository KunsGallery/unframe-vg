export function layoutArtworks(
  wallLength: number,
  artworks: any[],
  spacing: number
) {
  const widths = artworks.map(a => a.width_cm / 100)

  const totalWidth =
    widths.reduce((s, w) => s + w, 0) + spacing * (artworks.length - 1)

  const margin = Math.max((wallLength - totalWidth) / 2, 0)

  let cursor = -wallLength / 2 + margin

  return artworks.map((a, i) => {
    const w = widths[i]

    const x = cursor + w / 2

    cursor += w + spacing

    return {
      ...a,
      offsetX: x,
      width_m: w,
      height_m: a.height_cm / 100
    }
  })
}