export type Wall = {
  id: string
  length: number
  position: [number, number, number]
  rotation: [number, number, number]
}

const Y = 1.5

export const galleryWalls = [

  // LEFT SIDE
  { id:"left_01", length:9, position:[-0.09,Y,0.44] as [number,number,number], rotation:[0,1.5708,0] as [number,number,number]},
  { id:"left_02", length:6, position:[3.02,Y,-4.53] as [number,number,number], rotation:[0,0,0] as [number,number,number]},
  { id:"left_03", length:12, position:[5.93,Y,-10.656] as [number,number,number], rotation:[0,1.5708,0] as [number,number,number]},
  { id:"left_04", length:6, position:[2.941,Y,-16.431] as [number,number,number], rotation:[0,3.1416,0] as [number,number,number]},
  { id:"left_05", length:8, position:[-0.12,Y,-20.4] as [number,number,number], rotation:[0,1.5708,0] as [number,number,number]},

  // RIGHT SIDE
  { id:"right_01", length:9, position:[-14.97,Y,0.4] as [number,number,number], rotation:[0,-1.5708,0] as [number,number,number]},
  { id:"right_02", length:6, position:[-17.95,Y,-4.51] as [number,number,number], rotation:[0,0,0] as [number,number,number]},
  { id:"right_03", length:12, position:[-20.85,Y,-10.35] as [number,number,number], rotation:[0,-1.5708,0] as [number,number,number]},
  { id:"right_04", length:6, position:[-18.02,Y,-16.43] as [number,number,number], rotation:[0,-3.1416,0] as [number,number,number]},
  { id:"right_05", length:8, position:[-14.88,Y,-20.4] as [number,number,number], rotation:[0,-1.5708,0] as [number,number,number]},

  // INFO WALL
  { id:"info_wall", length:15, position:[-7.49,Y,5.11] as [number,number,number], rotation:[0,0,0] as [number,number,number]}

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