import { CAMERA, GRAVITY } from './constants'
import './index.scss'
import { Thing, Axis } from './p1-5'
import p2 from 'p2'

const canvas: HTMLCanvasElement | null = document.querySelector('#canvas')
if (!canvas) throw new Error('No canvas detected.')
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('Could not get 2D context from canvas.')

const world = new p2.World({
  gravity: [0, -9.82],
})

const ballBody = new p2.Body({
  mass: 5,
  position: [0, 50],
})

const ballShape = new p2.Circle({ radius: 0.5 })
ballBody.addShape(ballShape)
world.addBody(ballBody)

const ballMaterial = new p2.Material()
ballShape.material = ballMaterial

const groundBody = new p2.Body({
  mass: 0,
})

const groundShape = new p2.Plane()
groundBody.addShape(groundShape)
world.addBody(groundBody)

const groundMaterial = new p2.Material()
groundShape.material = groundMaterial

const groundvsBall = new p2.ContactMaterial(groundMaterial, ballMaterial, {
  friction: 0.5,
  restitution: Math.sqrt(Math.sqrt(1 / 2)),
})

world.addContactMaterial(groundvsBall)
world.defaultContactMaterial.restitution = Math.sqrt(1 / 2)

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

  const resetButtonEl = document.querySelector('#reset')
  resetButtonEl?.addEventListener('click', reset)

  const addBallButtonEl = document.querySelector('#add-ball')
  addBallButtonEl?.addEventListener('click', addRandomBall)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      world.gravity = [0, -9.82]
    }
    if (event.key === 'ArrowLeft') {
      world.gravity = [-9.82, 0]
    }
    if (event.key === 'ArrowRight') {
      world.gravity = [9.82, 0]
    }
    if (event.key === 'ArrowUp') {
      world.gravity = [0, 9.82]
    }
  })
}

const reset = () => {
  world.clear()
  world.addBody(groundBody)
  world.addContactMaterial(groundvsBall)
}

const addRandomBall = () => {
  const randomBallBody = new p2.Body({
    mass: Math.random() * 5,
    position: [Math.random() * 100 - 50, Math.random() * 100],
  })

  const randomBallShape = new p2.Circle({
    radius: Math.random() * MAX_BALL_SIZE,
  })

  randomBallBody.addShape(randomBallShape)
  randomBallShape.material = ballMaterial
  world.addBody(randomBallBody)
}

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const body of world.bodies) {
    renderThing(body)
  }
}

const renderThing = (body: p2.Body) => {
  for (const shape of body.shapes) {
    if (shape instanceof p2.Circle) {
      ctx.beginPath()
      ctx.ellipse(
        convertPosition('x', body.interpolatedPosition[0]),
        convertPosition('y', body.interpolatedPosition[1]),
        convertDimension('x', shape.radius),
        convertDimension('y', shape.radius),
        0,
        0,
        2 * Math.PI
      )
      ctx.stroke()
    }
    // throw new Error('Invalid shape: ' + shape)
  }
}

const cameraHeight = CAMERA.top - CAMERA.bottom
const cameraWidth = CAMERA.right - CAMERA.left

const MAIN_TICK_INTERVAL_MS = 1000 / 60

const MAX_BALL_SIZE = 4

const MAX_CANVAS_SIZE = 600

const RENDER_TICK_INTERVAL_MS = 1000 / 60

startup()
render()

let lastMainStep = Date.now()
setInterval(() => {
  const deltaTimeMs = Date.now() - lastMainStep
  world.step(MAIN_TICK_INTERVAL_MS / 1000, deltaTimeMs / 1000)
  lastMainStep = Date.now()
}, MAIN_TICK_INTERVAL_MS)

setInterval(render, RENDER_TICK_INTERVAL_MS)
