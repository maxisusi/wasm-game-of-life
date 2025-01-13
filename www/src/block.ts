import { EntityElement, Vector2d } from "./lib";

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
    color?: string,
  ) {
    super(new Vector2d(x, y), ctx);

    this.width = width;
    this.height = height;
    this.color = color || this.color;
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
