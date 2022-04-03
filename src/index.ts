import { CAMERA, GRAVITY } from './constants'
import './index.scss'
import { Thing, Axis, World } from './p1-5'

const canvas: HTMLCanvasElement | null = document.querySelector('#canvas')
if (!canvas) throw new Error('No canvas detected.')
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('Could not get 2D context from canvas.')

const world = new World()

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

  reset()
  const resetButtonEl = document.querySelector('#reset')
  resetButtonEl?.addEventListener('click', reset)

  const addBallButtonEl = document.querySelector('#add-ball')
  addBallButtonEl?.addEventListener('click', addRandomBall)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      // world.state.gravityX = 0
      world.state.gravityY = GRAVITY
    }
    if (event.key === 'ArrowLeft') {
      world.state.gravityX = GRAVITY
      // world.state.gravityY = 0
    }
    if (event.key === 'ArrowRight') {
      world.state.gravityX = -GRAVITY
      // world.state.gravityY = 0
    }

    if (event.key === 'ArrowUp') {
      // world.state.gravityX = 0
      world.state.gravityY = -GRAVITY
    }
  })
}

const reset = () => {
  world.reset()
  world.addThing({
    type: 'ball',
    posX: 0,
    posY: 50,
    size: 1,
    velX: 0,
    velY: 0,
    elasticity: Math.sqrt(1 / 2),
    // elasticity: 1,
  })
  world.addPlane({
    axis: 'x',
    direction: 1,
    pos: 0,
  })
}

const addRandomBall = () => {
  world.addThing({
    type: 'ball',
    posX: CAMERA.left + Math.random() * cameraWidth,
    posY: CAMERA.bottom + Math.random() * cameraHeight,
    size: Math.ceil(Math.random() * MAX_BALL_SIZE),
    velX: 0,
    velY: 0,
    elasticity: Math.sqrt(1 / 2),
  })
}

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const thing of world.state.things) {
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

const cameraHeight = CAMERA.top - CAMERA.bottom
const cameraWidth = CAMERA.right - CAMERA.left

const MAIN_TICK_INTERVAL_MS = 1000 / 60

const MAX_BALL_SIZE = 4

const MAX_CANVAS_SIZE = 600

const RENDER_TICK_INTERVAL_MS = 1000 / 60

startup()
render()

setInterval(() => world.loop(), MAIN_TICK_INTERVAL_MS)
setInterval(render, RENDER_TICK_INTERVAL_MS)
