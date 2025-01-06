import init from "wasm-test";
import { Block, Vector2d } from "./vector";

await init();

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

// Debugger
const $mousePosition = document.getElementById("mouse-position");
const $zoom = document.getElementById("zoom");

if (!canvas) {
  throw new Error("Game canvas undefined");
}

const C_WIDTH = window.innerWidth;
const C_HEIGHT = window.innerWidth;

canvas.width = C_WIDTH;
canvas.height = C_HEIGHT;

const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("2D Context not supported from this browser");
}

const blockList = Array.from({ length: 8 }).map(
  (_, i) => new Block(200 * (i + 1), 100, 50, 50, ctx),
);

let zoom = 1;
let dragStart = new Vector2d(0, 0);
let panOffset = new Vector2d(0, 0);
let isDragging = false;

const render = () => {
  // Draw background
  ctx.fillStyle = "#2e242c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(panOffset.x, panOffset.y);

  blockList.forEach((e) => e.draw());
  ctx.restore();

  // Draw lines from block to mouse
};

render();
$zoom!.innerHTML = `${zoom}x`;

canvas.addEventListener("wheel", (event) => {
  if (event.deltaY <= 0) zoom += 1;
  else if (zoom > 1) {
    zoom -= 1;
  }
  $zoom!.innerHTML = `${zoom}x`;
  render();
});

canvas.addEventListener("mousemove", (event) => {
  $mousePosition!.innerHTML = `Client X: ${event.clientX} | Client Y: ${event.clientY}`;
  if (isDragging) {
    const { clientX, clientY } = event;

    const client = new Vector2d(clientX, clientY).sub(panOffset);
    const offset = client.sub(dragStart);

    panOffset = panOffset.add(offset);

    render();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  dragStart = new Vector2d(0, 0);

  render();
});

canvas.addEventListener("mousedown", (event) => {
  isDragging = true;
  dragStart = new Vector2d(event.clientX, event.clientY).sub(panOffset);
});
