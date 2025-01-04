import init from "wasm-test";
import { Block, Vector2d } from "./vector";

await init();

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

// Debugger
const $mousePosition = document.getElementById("mouse-position");
const $dragStart = document.getElementById("drag-start");
const $magnitude = document.getElementById("magnitude");
const $displacement = document.getElementById("displacement-vector");
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

let dragStart = new Vector2d(0, 0);
const block = new Block(100, 100, 50, 50, ctx);

let zoom = 1;

const render = (x?: number, y?: number) => {
  // Draw background
  ctx.fillStyle = "#2e242c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (x && y) drawLine(x, y);
  block.draw();
};

const drawLine = (x: number, y: number) => {
  const bPos = dragStart.sub(5);
  new Block(bPos.x, bPos.y, 10, 10, ctx).draw();

  $dragStart!.innerHTML = `X: ${dragStart.x} | Y: ${dragStart.y}`;

  ctx.beginPath();
  ctx.strokeStyle = "#777";
  ctx.moveTo(dragStart.x, dragStart.y);
  ctx.lineTo(x, y);
  ctx.stroke();
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
});

canvas.addEventListener("dragover", (event) => {
  const { clientX, clientY } = event;

  const client = new Vector2d(clientX, clientY);
  const magnitude = client.sub(dragStart).magnitude();
  const displacement = client.sub(dragStart);

  $magnitude!.innerHTML = `${magnitude}`;
  $mousePosition!.innerHTML = `Client X: ${clientX} | Client Y: ${clientY}`;
  $displacement!.innerHTML = `X: ${displacement.x} | Y: ${displacement.y}`;

  block.updatePosition(block.transform.initialPosition.add(displacement));

  render(clientX, clientY);
});

canvas.addEventListener("dragend", () => {
  dragStart = new Vector2d(0, 0);

  block.resetInitialPosition();

  $magnitude!.innerHTML = `NULL`;
  $dragStart!.innerHTML = `NULL`;
  $displacement!.innerHTML = `NULL`;

  render();
});

canvas.addEventListener("dragstart", (event) => {
  dragStart = new Vector2d(event.clientX, event.clientY);

  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  event.dataTransfer?.setDragImage(img, 0, 0);
});
