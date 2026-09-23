import { Player } from './player/player.js';
import { Rock, Boulder } from './objects/objects.js';

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

canvas.width = 1080;
canvas.height = 720;
ctx.imageSmoothingEnabled = false;

const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

const player = new Player(canvas.width / 2, canvas.height / 2);

const entities = [
    player,
    new Rock(300, 250, 1),
    new Rock(700, 400, 1),
    new Boulder(500, 0, 1)
];

let lastTime = 0;

function gameLoop(currentTime) {
    const dt = Math.min((currentTime - (lastTime || currentTime)) / 1000, 0.1);
    lastTime = currentTime;
    player.update(keys, dt);

    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    entities.sort((a, b) => a.sortY - b.sortY);

    entities.forEach(entity => entity.draw(ctx));

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);