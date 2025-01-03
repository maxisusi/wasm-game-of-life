import init from "wasm-test";

await init();

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

// Debugger
const $mousePosition = document.getElementById("mouse-position");
const $dragStart = document.getElementById("drag-start");
const $magnitude = document.getElementById("magnitude");

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

let dragStart: number[] = [];

canvas.addEventListener("dragstart", (event) => {
  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  event.dataTransfer?.setDragImage(img, 0, 0);

  dragStart = [event.clientX, event.clientY];
});

const drawBackground = () => {
  ctx.fillStyle = "#2e242c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (dragStart.length !== 0) {
    ctx.fillStyle = "#777";
    ctx.fillRect(dragStart[0] - 5, dragStart[1] - 5, 10, 10);
    $dragStart!.innerHTML = `X: ${dragStart[0]} | Y: ${dragStart[1]}`;
  }
};

// Initial draw
drawBackground();

canvas.addEventListener("mousemove", (event) => {
  $mousePosition!.innerHTML = `Client X: ${event.clientX} | Client Y: ${event.clientY}`;
});

canvas.addEventListener("dragover", (event) => {
  const { clientX, clientY } = event;

  const magnitude = Math.sqrt(
    Math.pow(clientX - dragStart[0], 2) + Math.pow(clientY - dragStart[1], 2),
  );

  $magnitude!.innerHTML = `${magnitude}`;
  $mousePosition!.innerHTML = `Client X: ${event.clientX} | Client Y: ${event.clientY}`;

  drawBackground();

  ctx.beginPath();
  ctx.strokeStyle = "#777";
  ctx.moveTo(dragStart[0], dragStart[1]);
  ctx.lineTo(clientX, clientY);
  ctx.stroke();
});

canvas.addEventListener("dragend", () => {
  dragStart = [];

  $magnitude!.innerHTML = `NULL`;
  $dragStart!.innerHTML = `NULL`;

  drawBackground();
});
