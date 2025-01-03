import init from "wasm-test";

await init();

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

// Debugger
const $mousePosition = document.getElementById("mouse-position");
const $dragStart = document.getElementById("drag-start");
const $magnitude = document.getElementById("magnitude");
const $displacement = document.getElementById("displacement-vector");
const $dbgBlock = document.getElementById("debug-block");

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
let initialBlockPosition = [100, 100];
let currentBlockPosition = [...initialBlockPosition];

const render = (x?: number, y?: number) => {
  // Draw background
  ctx.fillStyle = "#2e242c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (x && y) drawLine(x, y);

  ctx.fillStyle = "#777";
  ctx.fillRect(currentBlockPosition[0], currentBlockPosition[1], 50, 50);
};

const drawLine = (x: number, y: number) => {
  if (dragStart.length !== 0) {
    ctx.fillStyle = "#777";
    ctx.fillRect(dragStart[0] - 5, dragStart[1] - 5, 10, 10);
    $dragStart!.innerHTML = `X: ${dragStart[0]} | Y: ${dragStart[1]}`;

    ctx.beginPath();
    ctx.strokeStyle = "#777";
    ctx.moveTo(dragStart[0], dragStart[1]);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};

render();
$dbgBlock!.innerHTML = `X: ${currentBlockPosition[0]} | Y: ${currentBlockPosition[1]}`;

canvas.addEventListener("mousemove", (event) => {
  $mousePosition!.innerHTML = `Client X: ${event.clientX} | Client Y: ${event.clientY}`;
});

canvas.addEventListener("dragover", (event) => {
  const { clientX, clientY } = event;

  const magnitude = Math.sqrt(
    Math.pow(clientX - dragStart[0], 2) + Math.pow(clientY - dragStart[1], 2),
  );

  const displacement = [clientX - dragStart[0], clientY - dragStart[1]];

  $magnitude!.innerHTML = `${magnitude}`;
  $mousePosition!.innerHTML = `Client X: ${clientX} | Client Y: ${clientY}`;
  $displacement!.innerHTML = `X: ${displacement[0]} | Y: ${displacement[1]}`;
  $dbgBlock!.innerHTML = `X: ${currentBlockPosition[0].toFixed(2)} | Y: ${currentBlockPosition[1].toFixed(2)}`;

  currentBlockPosition = [
    initialBlockPosition[0] + displacement[0],
    initialBlockPosition[1] + displacement[1],
  ];

  render();
});

canvas.addEventListener("dragend", (event) => {
  // const { clientX, clientY } = event;

  dragStart = [];
  initialBlockPosition = currentBlockPosition;

  $magnitude!.innerHTML = `NULL`;
  $dragStart!.innerHTML = `NULL`;
  $displacement!.innerHTML = `NULL`;

  $dbgBlock!.innerHTML = `X: ${currentBlockPosition[0].toFixed(2)} | Y: ${currentBlockPosition[1].toFixed(2)}`;

  render();
});

canvas.addEventListener("dragstart", (event) => {
  dragStart = [event.clientX, event.clientY];

  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  event.dataTransfer?.setDragImage(img, 0, 0);
});
