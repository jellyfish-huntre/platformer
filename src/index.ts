import './index.scss'

import { Thing, Plane, Axis } from './types'

const canvas: HTMLCanvasElement | null = document.querySelector('#canvas')
if (!canvas) throw new Error('No canvas detected.')
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('Could not get 2D context from canvas.')

let state: State = {
  things: [
    {
      type: 'ball',
      posX: 0,
      posY: 50,
      size: 1,
      velX: 0,
      velY: 0,
      elasticity: 1,
    },
  ],
  planes: [
    {
      axis: 'x',
      pos: 0,
      direction: 1,
    },
  ],
  prevTick: Date.now(),
}

const convertDimension = (axis: Axis, units: number): number => {
  if (axis === 'x') {
    const ratio = units / cameraWidth
    return canvas.width * ratio
  }
  if (axis === 'y') {
    const ratio = units / cameraHeight
    return canvas.height * ratio
  }
  throw new Error('Invalid axis: ' + axis)
}

const convertPosition = (axis: Axis, pos: number): number => {
  if (axis === 'x') {
    return convertDimension('x', pos - CAMERA.left)
  }
  if (axis === 'y') {
    return convertDimension('y', CAMERA.top - pos)
  }
  throw new Error('Invalid axis: ' + axis)
}

const startup = () => {
  canvas.height = Math.min(
    MAX_CANVAS_SIZE,
    (cameraHeight / cameraWidth) * MAX_CANVAS_SIZE
  )
  canvas.width = Math.min(
    MAX_CANVAS_SIZE,
    (cameraWidth / cameraHeight) * MAX_CANVAS_SIZE
  )
}

const main = () => {
  const currTick = Date.now()
  const timePassed = currTick - state.prevTick

  for (const thing of state.things) {
    console.log(thing.velY)
    updateThing(thing, timePassed)
  }

  state.prevTick = currTick
}

const updateThing = (thing: Thing, timePassed: number) => {
  const prevVelY = thing.velY
  thing.velY += GRAVITY * timePassed
  thing.posY += ((prevVelY + thing.velY) / 2) * timePassed

  for (const plane of state.planes) {
    const thingPos = plane.axis === 'x' ? thing.posY : thing.posX
    const overlap = (thingPos - plane.pos) * plane.direction < 0

    // NOTE: Simplified rebound simulation.
    if (overlap) {
      if (plane.axis === 'x') {
        thing.velY *= -1 * thing.elasticity
        thing.posY = (2 * plane.pos - thingPos) * thing.elasticity
      } else {
        thing.velX *= -1 * thing.elasticity
        thing.posX = (2 * plane.pos - thingPos) * thing.elasticity
      }
    }
  }
}

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const thing of state.things) {
    renderThing(thing)
  }
}

const renderThing = (thing: Thing) => {
  if (thing.type === 'ball') {
    ctx.beginPath()
    ctx.ellipse(
      convertPosition('x', thing.posX),
      convertPosition('y', thing.posY),
      convertDimension('x', thing.size / 2),
      convertDimension('y', thing.size / 2),
      0,
      0,
      2 * Math.PI
    )
    ctx.stroke()
    return
  }

  throw new Error('Invalid object type: ' + thing.type)
}

type State = {
  things: Thing[]
  planes: Plane[]
  prevTick: number
}

const CAMERA = {
  top: 100,
  bottom: 0,
  left: -50,
  right: 50,
}

const cameraHeight = CAMERA.top - CAMERA.bottom
const cameraWidth = CAMERA.right - CAMERA.left

const GRAVITY = -10 / 1000 / 1000 // meters / millisecond / millisecond

const MAIN_TICK_INTERVAL_MS = 1000 / 60

const MAX_CANVAS_SIZE = 600

const RENDER_TICK_INTERVAL_MS = 1000 / 60

startup()
render()

setInterval(main, MAIN_TICK_INTERVAL_MS)
setInterval(render, RENDER_TICK_INTERVAL_MS)
