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

export interface Transform {
  initialPosition: Vector2d;
  position: Vector2d;
}

export abstract class EntityElement {
  protected ctx: CanvasRenderingContext2D;
  transform: Transform;

  constructor(position: Vector2d, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.transform = {
      initialPosition: position,
      position: position,
    };
  }

  draw(zoom: number, clientX: number, clientY: number): void {}

  updatePosition(newPosition: Vector2d): void {
    this.transform = {
      ...this.transform,
      position: newPosition,
    };
  }

  resetInitialPosition(): void {
    this.transform = {
      ...this.transform,
      initialPosition: this.transform.position,
    };
  }
}

export class Block extends EntityElement {
  private color = "#777";
  width: number;
  height: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
  ) {
    super(new Vector2d(x, y), ctx);

    this.width = width;
    this.height = height;
  }

  draw() {
    this.ctx.fillStyle = this.color;

    this.ctx.fillRect(
      this.transform.position.x,
      this.transform.position.y,
      this.width,
      this.height,
    );
  }
}
