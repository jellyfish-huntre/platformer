import cloneDeep from 'lodash/cloneDeep'

export class World {
  state: State

  constructor() {
    this.state = cloneDeep(INITIAL_STATE)
  }

  addThing(thing: Thing) {
    this.state.things.push(thing)
  }

  addPlane(plane: Plane) {
    this.state.planes.push(plane)
  }

  loop() {
    const currTick = Date.now()
    const timePassed = currTick - this.state.prevTick

    for (const thing of this.state.things) {
      this.updateThing(thing, timePassed)
    }

    this.state.prevTick = currTick
  }

  reset() {
    this.state.gravityX = 0
    this.state.gravityY = GRAVITY
    this.state.things = []
    this.state.planes = []
  }

  private updateThing(thing: Thing, timePassed: number) {
    // Update velocities and positions.
    const prevVelY = thing.velY
    thing.velY += this.state.gravityY * timePassed
    thing.posY += ((prevVelY + thing.velY) / 2) * timePassed

    const prevVelX = thing.velX
    thing.velX += this.state.gravityX * timePassed
    thing.posX += ((prevVelX + thing.velX) / 2) * timePassed

    // Account for collisions with planes.
    for (const plane of this.state.planes) {
      const { axis, direction, pos } = plane
      const box = getBoundingBox(thing)

      const relevantPos = getRelevantPos(plane, thing)
      const overlap = (relevantPos - pos) * direction < 0

      // NOTE: Simplified rebound simulation.
      if (overlap) {
        const depth = relevantPos - pos
        const reversedRelevantPos = pos - depth

        if (axis === 'x') {
          thing.velY *= -1 * thing.elasticity
          thing.posY = reversedRelevantPos + thing.posY - relevantPos
        } else {
          thing.velX *= -1 * thing.elasticity

          thing.posX = reversedRelevantPos + thing.posX - relevantPos
        }
      }
    }
  }
}

const getBoundingBox = (thing: Thing): BoundingBox => {
  switch (thing.type) {
    case 'ball':
      return {
        top: thing.posY + thing.size / 2,
        bottom: thing.posY - thing.size / 2,
        left: thing.posX - thing.size / 2,
        right: thing.posX + thing.size / 2,
      }
    default:
      return {
        top: thing.posY,
        bottom: thing.posY,
        left: thing.posX,
        right: thing.posX,
      }
  }
}

const getRelevantPos = (plane: Plane, thing: Thing): number => {
  const { axis, direction } = plane
  const box = getBoundingBox(thing)

  if (axis === 'x' && direction === 1) {
    return box.bottom
  }
  if (axis === 'x' && direction === -1) {
    return box.top
  }
  if (axis === 'y' && direction === 1) {
    return box.left
  }
  // NOTE: if (axis === 'y' && direction === -1)
  return box.right
}

export interface BoundingBox {
  top: number
  bottom: number
  left: number
  right: number
}

export interface BaseThing {
  type: string
  posX: number
  posY: number
  velX: number
  velY: number
}

export interface BallThing extends BaseThing {
  type: 'ball'
  elasticity: number
  size: number
}

export type Thing = BallThing

export type Axis = 'x' | 'y'

export interface Plane {
  axis: Axis
  direction: 1 | -1
  pos: number
}

export type State = {
  gravityX: number
  gravityY: number
  planes: Plane[]
  prevTick: number
  things: Thing[]
}

export const GRAVITY = 10 / 1000 / 1000 // meters / millisecond / millisecond

const INITIAL_STATE = {
  gravityX: 0,
  gravityY: GRAVITY,
  things: [],
  planes: [],
  prevTick: Date.now(),
}
