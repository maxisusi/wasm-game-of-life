export class Vector2d {
  x: number;
  y: number;

  static right = new Vector2d(1, 0);
  static left = new Vector2d(-1, 0);
  static top = new Vector2d(0, 1);
  static bottom = new Vector2d(0, -1);

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  inject(fn: (x: number, y: number) => [number, number]): Vector2d {
    return new Vector2d(...fn(this.x, this.y));
  }

  add(value: Vector2d | number): Vector2d {
    if (value instanceof Vector2d)
      return new Vector2d(this.x + value.x, this.y + value.y);
    else return new Vector2d(this.x + value, this.y + value);
  }

  mul(value: Vector2d | number): Vector2d {
    if (value instanceof Vector2d)
      return new Vector2d(this.x * value.x, this.y * value.y);
    else return new Vector2d(this.x * value, this.y * value);
  }

  sub(value: Vector2d | number): Vector2d {
    if (value instanceof Vector2d)
      return new Vector2d(this.x - value.x, this.y - value.y);
    else return new Vector2d(this.x - value, this.y - value);
  }

  div(value: Vector2d | number): Vector2d {
    if (value instanceof Vector2d)
      return new Vector2d(this.x / value.x, this.y / value.y);
    else return new Vector2d(this.x / value, this.y / value);
  }

  abs(): Vector2d {
    return new Vector2d(Math.abs(this.x), Math.abs(this.y));
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalized(): Vector2d {
    return this.div(this.magnitude());
  }

  isOrigin(): boolean {
    if (this.x === 0 && this.y === 0) return true;
    else return false;
  }
}

export interface ITransform {
  initialPosition: Vector2d;
  position: Vector2d;
}

export abstract class EntityElement {
  protected ctx: CanvasRenderingContext2D;
  transform: ITransform;

  constructor(position: Vector2d, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.transform = {
      initialPosition: position,
      position: position,
    };
  }

  draw(zoom: number, clientX: number, clientY: number): void {}
}
