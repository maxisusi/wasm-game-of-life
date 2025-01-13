import init, { Game } from "wasm-test";
import { Block, Vector2d } from "./vector";
import { COLOR_SCHEME } from "./colors";

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;
// Debugger
const $mousePosition = document.getElementById("mouse-position");
const $zoom = document.getElementById("zoom");

if (!canvas) {
  throw new Error("Game canvas undefined");
}

const wasm = await init();
const game = Game.new(8);

const cells = new Uint8Array(wasm.memory.buffer, game.get_array(), 64);
const C_WIDTH = window.innerWidth;
const C_HEIGHT = window.innerWidth;

canvas.width = C_WIDTH;
canvas.height = C_HEIGHT;

const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("2D Context not supported from this browser");
}

let zoom = 1;
let dragStart = new Vector2d(0, 0);
let panOffset = new Vector2d(0, 0);
let isDragging = false;

const render = () => {
  // Draw background
  ctx.fillStyle = COLOR_SCHEME.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(panOffset.x, panOffset.y);

  const blockList = Array.from(cells).map((c, i) => {
    return new Block(
      100 * (i % 8),
      100 * Math.floor(i / 8),
      50,
      50,
      ctx,
      c === 1 ? COLOR_SCHEME.cell.alive : COLOR_SCHEME.cell.dead,
    );
  });

  blockList.forEach((e) => e.draw());
  ctx.restore();
};

const renderGame = () => {
  game.tick();
  render();

  setTimeout(() => {
    requestAnimationFrame(renderGame);
  }, 1000 / 5);
};

renderGame();

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
