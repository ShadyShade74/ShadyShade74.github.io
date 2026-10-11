import { Renderer } from '../rendering/renderer.js';
import { Camera } from './camera.js';
import { InputHandler } from './input.js';
import { Player } from '../entities/player.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.input = new InputHandler(this.canvas, this.camera);

        this.player = new Player(0, 0);
        this.camera.follow(this.player);

        this.lastTime = 0;
        this.maxDelta = 0.1; // Zabezpieczenie przed przeskokami po zminimalizowaniu karty

        this.setupResize();
    }

    setupResize() {
        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.resize(width, height);
            this.camera.resize(width, height);
        };
        window.addEventListener('resize', resize);
        resize();
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(currentTime) {
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Ograniczenie maksymalnego kroku czasowego
        if (dt > this.maxDelta) {
            dt = this.maxDelta;
        }

        this.update(dt);
        this.render();

        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    update(dt) {
        this.player.update(dt, this.input);
        this.camera.update();
    }

    render() {
        this.renderer.clear('#121214');

        // Rysowanie testowej siatki świata
        this.renderer.drawDebugGrid(this.camera, 64);

        // Rysowanie gracza
        this.player.render(this.renderer, this.camera);

        // Prosty podgląd stanu staminy (pasek testowy)
        this.renderDebugHUD();
    }

    renderDebugHUD() {
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.fillStyle = '#222';
        ctx.fillRect(20, 20, 160, 12);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(20, 20, (this.player.stamina / this.player.maxStamina) * 160, 12);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(20, 20, 160, 12);
        ctx.restore();
    }
}