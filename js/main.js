import { Input } from './core/input.js';
import { Camera } from './core/camera.js';
import { ChunkManager } from './world/chunkManager.js';
import { Player } from './entities/player.js';
import { Dummy } from './entities/dummy.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas') || document.querySelector('canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1280;
    this.canvas.height = 720;

    this.input = new Input(this.canvas);
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.world = new ChunkManager(4096, 4096);
    this.camera.setWorldBounds(0, 0, this.world.worldWidth, this.world.worldHeight);

    // Gracz i Kukła treningowa
    this.player = new Player(1910, 1960);
    this.dummy = new Dummy(2040, 1960);

    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;

    this.debugMode = false;
    this.fps = 60;
    this.lastTime = 0;

    // Pływające cyfry obrażeń
    this.damageNumbers = [];

    this.loop = this.loop.bind(this);
  }

  start() {
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame(this.loop);
    });
  }

  loop(currentTime) {
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt > 0.1) dt = 0.1;
    this.fps = Math.round(1 / (dt || 0.016));

    this.update(dt);
    this.draw();

    this.input.endFrame();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.input.isJustPressed('F3')) {
      this.debugMode = !this.debugMode;
    }

    this.input.updateWorldPosition(this.camera.x, this.camera.y);
    this.player.update(dt, this.input, this.world);
    this.dummy.update(dt);

    // Sprawdzenie ciosu ostrza w manekina
    this.player.checkCombatCollisions([this.dummy], (hitInfo) => {
      this.damageNumbers.push({
        x: hitInfo.x,
        y: hitInfo.y - 10,
        amount: hitInfo.damage,
        life: 0.8,
        maxLife: 0.8,
        vy: -45
      });
    });

    // Aktualizacja cyfr obrażeń
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const num = this.damageNumbers[i];
      num.life -= dt;
      num.y += num.vy * dt;
      num.vy += 35 * dt;
      if (num.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }

    const proj = this.world.heightmap.toScreen(this.player.x, this.player.y);
    this.camera.follow(proj.screenX, proj.screenY, dt);
  }

  draw() {
    this.ctx.fillStyle = '#0a140a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.camera.apply(this.ctx);
    
    // Y-sorting: gracz i manekin
    this.world.draw(this.ctx, this.camera, [this.player, this.dummy]);

    // Cyfry obrażeń
    this.drawDamageNumbers(this.ctx);

    if (this.debugMode) {
      this.world.drawDebug(this.ctx, this.camera, [this.player, this.dummy]);
      this.player.drawDebug(this.ctx);
      this.dummy.drawDebug(this.ctx);
    }
    
    this.camera.restore(this.ctx);

    // Twój czysty HUD
    this.drawCleanHUD();

    if (this.debugMode) {
      this.drawDebugPanel();
    }
  }

  drawDamageNumbers(ctx) {
    ctx.save();
    for (const num of this.damageNumbers) {
      const alpha = Math.max(0, num.life / num.maxLife);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 3;
      ctx.strokeText(`-${num.amount}`, Math.round(num.x), Math.round(num.y));
      ctx.fillText(`-${num.amount}`, Math.round(num.x), Math.round(num.y));
    }
    ctx.restore();
  }

  // Twój oryginalny, minimalistyczny HUD
  drawCleanHUD() {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 20, 0.75)';
    ctx.beginPath();
    ctx.roundRect(24, 24, 220, 44, 6);
    ctx.fill();

    const hpPercent = Math.max(0, this.player.hp / this.player.maxHp);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(32, 32, 204, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(32, 32, hpPercent * 204, 12);

    const staminaPercent = Math.max(0, this.player.stamina / this.player.maxStamina);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(32, 48, 204, 10);
    ctx.fillStyle = this.player.isRunning ? '#38bdf8' : '#10b981';
    ctx.fillRect(32, 48, staminaPercent * 204, 10);

    ctx.restore();
  }

  drawDebugPanel() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(this.canvas.width - 240, 24, 216, 80, 6);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.fillText('debug mode (f3)', this.canvas.width - 224, 44);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`fps: ${this.fps}`, this.canvas.width - 224, 62);
    ctx.fillText(`player: x:${Math.round(this.player.x)} y:${Math.round(this.player.y)}`, this.canvas.width - 224, 78);
    const box = this.player.collisionBox;
    ctx.fillText(`collision: ${box.radiusX}x${box.radiusY}`, this.canvas.width - 224, 94);
    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});