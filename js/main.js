import { Input } from './core/input.js';
import { Camera } from './core/camera.js';
import { ChunkManager } from './world/chunkManager.js';
import { Player } from './entities/player.js';
import { Dummy } from './entities/dummy.js';
import { rollLoot } from './items/lootTable.js';
import { DroppedItem } from './items/droppedItem.js';

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

    // Przedmioty na ziemi i interakcja
    this.droppedItems = [];
    this.activeInteractable = null;
    this.lootNotifications = [];

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

    // 1. Manekin i wypadanie lootu
    this.dummy.update(dt);
    if (this.dummy.isDead && !this.dummy.lootDropped) {
      this.dummy.lootDropped = true;
      const rolled = rollLoot(this.dummy.lootTable);
      for (const item of rolled) {
        this.droppedItems.push(new DroppedItem(this.dummy.x, this.dummy.y, item));
      }
    }

    // 2. Interakcja ze światem pod klawiszem [E]
    this.activeInteractable = null;
    let closestDist = Infinity;

    for (let i = this.droppedItems.length - 1; i >= 0; i--) {
      const item = this.droppedItems[i];
      item.update(dt);

      const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
      if (dist < item.interactionRadius && dist < closestDist) {
        closestDist = dist;
        this.activeInteractable = item;
      }
    }

    // Zebranie przedmiotów pod 'E'
    if (this.input.isJustPressed('KeyE') && this.activeInteractable) {
      for (let i = this.droppedItems.length - 1; i >= 0; i--) {
        const item = this.droppedItems[i];
        const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
        
        if (dist < item.interactionRadius) {
          this.lootNotifications.push({
            text: `+${item.count} ${item.name}`,
            color: item.color,
            life: 2.2,
            y: 80
          });
          this.droppedItems.splice(i, 1);
        }
      }
      this.activeInteractable = null;
    }

    // Aktualizacja powiadomień lootu
    for (let i = this.lootNotifications.length - 1; i >= 0; i--) {
      const notif = this.lootNotifications[i];
      notif.life -= dt;
      notif.y -= 15 * dt;
      if (notif.life <= 0) {
        this.lootNotifications.splice(i, 1);
      }
    }

    // 3. Sprawdzenie ciosu ostrza w manekina
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

    // 1. WŁĄCZENIE KAMERY ŚWIATA:
    this.camera.apply(this.ctx);

    // Dynamiczne byty w świecie:
    const entitiesToDraw = [this.player];
    if (this.dummy && !this.dummy.isDestroyed) {
      entitiesToDraw.push(this.dummy);
    }
    entitiesToDraw.push(...this.droppedItems);

    // Rysowanie świata z Y-Sortingiem:
    this.world.draw(this.ctx, this.camera, entitiesToDraw);

    // Dymek interakcji [E] (nad przedmiotem w świecie):
    if (this.activeInteractable) {
      this.drawInteractionPrompt(this.ctx, this.activeInteractable);
    }

    // Cyfry obrażeń w świecie:
    this.drawDamageNumbers(this.ctx);

    // Tryb debugowania F3:
    if (this.debugMode) {
      this.world.drawDebug(this.ctx, this.camera, [this.player]);
      this.player.drawDebug(this.ctx);
      if (this.dummy && !this.dummy.isDestroyed) {
        this.dummy.drawDebug(this.ctx);
      }
    }
    
    // 2. WYŁĄCZENIE KAMERY ŚWIATA:
    this.camera.restore(this.ctx);

    // 3. Rysowanie interfejsu (na stałe na ekranie):
    this.drawCleanHUD();

    if (this.debugMode) {
      this.drawDebugPanel();
    }

    // Powiadomienia o łupie na ekranie:
    this.ctx.save();
    for (let i = 0; i < this.lootNotifications.length; i++) {
      const notif = this.lootNotifications[i];
      const alpha = Math.min(1, notif.life);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = notif.color;
      this.ctx.font = 'bold 14px "Segoe UI", sans-serif';
      this.ctx.fillText(notif.text, 32, notif.y + i * 22);
    }
    this.ctx.restore();
  }

  drawInteractionPrompt(ctx, interactable) {
    const proj = this.world.heightmap.toScreen(interactable.x, interactable.y);
    const x = proj.screenX;
    const y = proj.screenY - 26;

    ctx.save();
    const promptText = interactable.getPrompt();

    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    const textW = ctx.measureText(promptText).width;
    const badgeW = 20;
    const totalW = textW + badgeW + 16;

    // Ciemne tło dymka
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x - totalW / 2, y - 10, totalW, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Złoty znaczek [E]
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(x - totalW / 2 + 4, y - 7, 14, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('E', x - totalW / 2 + 11, y + 4);

    // Tekst akcji
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(promptText, x - totalW / 2 + 22, y + 4);

    ctx.restore();
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