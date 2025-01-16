import init, { Game, Cell, Mapper } from "wasm-test";
import { Vector2d } from "./lib";
import { Block } from "./block";
import { COLOR_SCHEME } from "./colors";

const canvas = document.getElementById(
  "game-canvas",
) as HTMLCanvasElement | null;

const $speedRange = document.getElementById(
  "speed-range",
) as HTMLInputElement | null;

const $gameSize = document.getElementById(
  "size-range",
) as HTMLInputElement | null;

const $pauseButton = document.getElementById(
  "pause-button",
) as HTMLButtonElement | null;

if (!canvas) {
  throw new Error("Game canvas undefined");
}

if (!$speedRange) {
  throw new Error("Game controller undefined");
}

if (!$pauseButton || !$gameSize) {
  throw new Error("Game controller undefined");
}

let CELL_COUNT = 16;
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

let dragStart = new Vector2d(0, 0);
let panOffset = new Vector2d(0, 0);
let isDragging = false;
let clientMap = 0;
let isOutofBound = false;
let gameSpeed = 5;
let gamePause = false;

$speedRange.addEventListener("input", (event) => {
  gameSpeed = parseInt((event.target as HTMLInputElement).value);
});

$gameSize.addEventListener("input", (event) => {
  CELL_COUNT = parseInt((event.target as HTMLInputElement).value);
  console.log(CELL_COUNT);
  renderGame();
});

$pauseButton.addEventListener("click", () => {
  gamePause = !gamePause;
  $pauseButton.innerHTML = "Play";
  if (!gamePause) {
    $pauseButton.innerHTML = "Paused";
    renderGame();
  }
});

const render = () => {
  // Draw background
  ctx.fillStyle = COLOR_SCHEME.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(panOffset.x, panOffset.y);

  const blockList = Array.from(board).map((c, i) => {
    return new Block(
      (CELL_SIZE + CELL_MARGIN) * (i % CELL_COUNT),
      (CELL_SIZE + CELL_MARGIN) * Math.floor(i / CELL_COUNT),
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
  if (gamePause) return;

  game.tick();
  render();

  setTimeout(() => {
    requestAnimationFrame(renderGame);
  }, 1000 / gameSpeed);
};

renderGame();

canvas.addEventListener("mousemove", (event) => {
  const { clientX, clientY } = event;
  const client = new Vector2d(clientX, clientY).sub(panOffset);

  const normalizedClient = client
    .div(CELL_SIZE + CELL_MARGIN)
    .inject((x, y) => [Math.floor(x), Math.floor(y)])
    .inject((x, y) => {
      if (x > CELL_COUNT || x < 0 || y > CELL_COUNT || y < 0) {
        return [0, 0];
      }
      return [x, y];
    });

  isOutofBound = client.div(CELL_SIZE).x < 0 || client.div(CELL_SIZE).y < 0;
  clientMap = game.get_index(
    Mapper.new(normalizedClient.x, normalizedClient.y),
  );

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
  !isOutofBound && game.insert_cell(clientMap);
});
