import init, { Game } from "wasm-test";

await init();

const pre = document.getElementById("game-of-life-canvas");

if (!pre) {
  throw new Error("No <pre> element inside html");
}

const t = Game.new(64);

pre.textContent = t.render();

setInterval(() => {
  pre.textContent = t.render();
  t.tick();
}, 300);
