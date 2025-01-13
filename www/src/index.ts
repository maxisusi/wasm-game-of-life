import init, { Game, Cell, Mapper } from "wasm-test";
import { Vector2d } from "./lib";
import { Block } from "./block";
import { COLOR_SCHEME } from "./colors";

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

const $mousePosition = document.getElementById("mouse-position");
const $zoom = document.getElementById("zoom");

if (!canvas) {
  throw new Error("Game canvas undefined");
}

const CELL_COUNT = 16;
const CELL_SIZE = 50;
const CELL_MARGIN = 1;

const C_WIDTH = window.innerWidth;
const C_HEIGHT = window.innerWidth;

const wasm = await init();
const game = Game.new(CELL_COUNT);

const board = new Uint8Array(
  wasm.memory.buffer,
  game.get_array(),
  Math.pow(CELL_COUNT, 2),
);

const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("2D Context not supported from this browser");
}

canvas.width = C_WIDTH;
canvas.height = C_HEIGHT;

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

  const blockList = Array.from(board).map((c, i) => {
    return new Block(
      (CELL_SIZE + CELL_MARGIN) * Math.floor(i / CELL_COUNT),
      (CELL_SIZE + CELL_MARGIN) * (i % CELL_COUNT),
      CELL_SIZE,
      CELL_SIZE,
      ctx,
      c === Cell.Alive ? COLOR_SCHEME.cell.alive : COLOR_SCHEME.cell.dead,
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
  const { clientX, clientY } = event;
  const client = new Vector2d(clientX, clientY).sub(panOffset);
  const normalizedClient = client
    .div(CELL_SIZE)
    .inject((x, y) => [Math.floor(x), Math.floor(y)])
    .inject((x, y) => {
      if (x > CELL_COUNT || x < 0 || y > CELL_COUNT || y < 0) {
        return [0, 0];
      }
      return [x, y];
    });

  const map = game.get_index(
    Mapper.new(normalizedClient.x, normalizedClient.y),
  );

  console.log(map);

  $mousePosition!.innerHTML = `Client X: ${clientX} | Client Y: ${clientY}`;

  if (isDragging) {
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
