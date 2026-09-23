const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext('2d')

canvas.width = 1080;
canvas.height = 720;

let lastTime = 0;
function gameLoop(currentTime){
    const dt = Math.min((currentTime - (lastTime || currentTime)) / 1000, 0.1);
    lastTime = currentTime;
    
    requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)