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

canvas.addEventListener("dragstart", (event) => {
  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  event.dataTransfer?.setDragImage(img, 0, 0);

  dragStart = [event.clientX, event.clientY];
});

let currentBlock = [100, 100];

$dbgBlock!.innerHTML = `X: ${currentBlock[0]} | Y: ${currentBlock[1]}`;

const drawBackground = () => {
  // Draw background
  ctx.fillStyle = "#2e242c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawDragLine();

  ctx.fillStyle = "#777";
  ctx.fillRect(currentBlock[0], currentBlock[1], 50, 50);
};

const drawDragLine = () => {
  // Draw drag line
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

let prevDisplacement = [0, 0];

canvas.addEventListener("dragover", (event) => {
  console.log("dragover trigger");
  const { clientX, clientY } = event;

  const magnitude = Math.sqrt(
    Math.pow(clientX - dragStart[0], 2) + Math.pow(clientY - dragStart[1], 2),
  );

  const displacement = [clientX - dragStart[0], clientY - dragStart[1]];

  let curDisplacement = [
    displacement[0] - prevDisplacement[0],
    displacement[1] - prevDisplacement[1],
  ];

  console.log(curDisplacement);

  $magnitude!.innerHTML = `${magnitude}`;
  $mousePosition!.innerHTML = `Client X: ${clientX} | Client Y: ${clientY}`;
  $displacement!.innerHTML = `X: ${displacement[0]} | Y: ${displacement[1]}`;
  $dbgBlock!.innerHTML = `X: ${currentBlock[0]} | Y: ${currentBlock[1]}`;

  currentBlock = [
    currentBlock[0] + displacement[0] / 100,
    currentBlock[1] + displacement[1] / 100,
  ];

  drawBackground();

  ctx.beginPath();
  ctx.strokeStyle = "#777";
  ctx.moveTo(dragStart[0], dragStart[1]);
  ctx.lineTo(clientX, clientY);
  ctx.stroke();
});

canvas.addEventListener("dragend", (event) => {
  dragStart = [];

  $magnitude!.innerHTML = `NULL`;
  $dragStart!.innerHTML = `NULL`;
  $displacement!.innerHTML = `NULL`;

  $dbgBlock!.innerHTML = `X: ${currentBlock[0]} | Y: ${currentBlock[1]}`;

  drawBackground();
});
