import {Player} from './player/player.js'
const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext('2d')

canvas.width = 1080;
canvas.height = 720;

const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

const player = new Player(canvas.width / 2 - 16, canvas.height / 2 - 24);

let lastTime = 0;

function gameLoop(currentTime){

    const dt = Math.min((currentTime - (lastTime || currentTime)) / 1000, 0.1);
    lastTime = currentTime;


    player.update(keys, dt);


    ctx.fillStyle = '#0b8515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw(ctx);

    requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)