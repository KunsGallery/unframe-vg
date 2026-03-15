export type Wall = {
  id: string
  length: number
  position: [number, number, number]
  rotation: [number, number, number]
}

const Y = 1.5

export const straightWalls: Wall[] = [

  // LEFT SIDE
  { id:"left_01", length:10, position:[-13,Y,-14] as [number,number,number], rotation:[0,Math.PI/2,0] as [number,number,number]},
  { id:"left_02", length:6 , position:[-13,Y,-6] as [number,number,number], rotation:[0,Math.PI/2,0] as [number,number,number]},
  { id:"left_03", length:12, position:[-13,Y,2] as [number,number,number], rotation:[0,Math.PI/2,0] as [number,number,number]},
  { id:"left_04", length:6, position:[-13,Y,10] as [number,number,number], rotation:[0,Math.PI/2,0] as [number,number,number]},
  { id:"left_05", length:8, position:[-13,Y,18] as [number,number,number], rotation:[0,Math.PI/2,0] as [number,number,number]},

  // RIGHT SIDE
  { id:"right_01", length:10, position:[13,Y,-14] as [number,number,number], rotation:[0,-Math.PI/2,0] as [number,number,number]},
  { id:"right_02", length:6, position:[13,Y,-6] as [number,number,number], rotation:[0,-Math.PI/2,0] as [number,number,number]},
  { id:"right_03", length:12, position:[13,Y,2] as [number,number,number], rotation:[0,-Math.PI/2,0] as [number,number,number]},
  { id:"right_04", length:6, position:[13,Y,10] as [number,number,number], rotation:[0,-Math.PI/2,0] as [number,number,number]},
  { id:"right_05", length:8, position:[13,Y,18] as [number,number,number], rotation:[0,-Math.PI/2,0] as [number,number,number]},

  // INFO WALL
  { id:"info_wall", length:15, position:[0,Y,-20] as [number,number,number], rotation:[0,0,0] as [number,number,number]}

]

// 원형홀
const circleRadius = 7
const segments = 12

const circumference = 2 * Math.PI * circleRadius
const length = circumference / segments

export const circleWalls: Wall[] = Array.from({ length:segments }).map((_,i)=>{

  const angle = (i/segments) * Math.PI*2

  return {
    id:`circle_${i+1}`,
    length,
    position:[
      Math.cos(angle)*circleRadius,
      Y,
      Math.sin(angle)*circleRadius
    ] as [number,number,number],
    rotation:[0,-angle+Math.PI/2,0] as [number,number,number]
  }

})

export const galleryWalls: Wall[] = [
  ...straightWalls,
  ...circleWalls
]