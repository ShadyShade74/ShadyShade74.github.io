import { Player }       from './player/player.js';
import { Rock, Boulder } from './objects/objects.js';
import { Debug }        from './debug.js';
const canvas = document.querySelector('#canvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1080;
canvas.height = 720;
ctx.imageSmoothingEnabled = false;
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup',   (e) => keys[e.code] = false);

const debug = new Debug();
const player = new Player(canvas.width / 2, canvas.height / 2);
const entities = [
    player,
    new Rock(300, 250, 1),
    new Rock(700, 400, 1.2),
    new Boulder(460, 120, 1)
];
let lastTime = 0;
function gameLoop(ts) {
    const dt = Math.min((ts - (lastTime || ts)) / 1000, 0.1);
    lastTime = ts;
    player.update(keys, dt, entities);

    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    entities.sort((a, b) => a.sortY - b.sortY);
    entities.forEach(e => e.draw(ctx));

    debug.draw(ctx, entities);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);