import init, { Game } from "wasm-test";

await init();

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

if (!canvas) {
  throw new Error("Game canvas undefined");
}

const C_WIDTH = window.innerWidth;
const C_HEIGHT = window.innerWidth;
const CELL_SIZE = 32;

canvas.width = C_WIDTH;
canvas.height = C_HEIGHT;

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2D Context not supported from this browser");
}

ctx.fillStyle = "#2e242c";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const gm = Game.new(64);

for (let i = 0; i < C_WIDTH; ++i) {
  ctx.beginPath();
  ctx.strokeStyle = "#605052";
  ctx.moveTo(i * CELL_SIZE, 0);
  ctx.lineTo(i * CELL_SIZE, C_HEIGHT);
  ctx.stroke();

  ctx.beginPath();

  ctx.strokeStyle = "#605052";
  ctx.moveTo(0, i * CELL_SIZE);
  ctx.lineTo(C_HEIGHT, i * CELL_SIZE);
  ctx.stroke();
}
