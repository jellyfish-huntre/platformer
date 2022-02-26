interface BaseThing {
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
  pos: number
  direction: 1 | -1
}
