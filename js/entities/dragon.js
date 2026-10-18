import { Entity } from './entity.js';
export class Dragon extends Entity {
  constructor(x = 2250, y = 1960) {
    super(x, y, {
      maxHp: 800,
      // Dopasowane pudełka pod mniejszy rozmiar (180px):
      collisionBox: { radiusX: 44, radiusY: 18, offsetX: 0, offsetY: -8 },
      hurtbox: { radiusX: 56, radiusY: 52, offsetX: 0, offsetY: -72 }
    });
    this.bossName = 'OBSYDIANOWY SMOK';
    this.isBoss = true;
    // MNIEJSZY ROZMIAR W ŚWIECIE (zmniejszone z 240px do 180px):
    this.targetSize = 180;
    this.facing = 1;
    this.ghostHp = this.hp;
    this.sprite = new Image();
    this.sprite.src = 'assets/entities/dragon/spritesheet.png';
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };
    this.frameSize = 1024;
    this.animTime = 0;
    
    // WOLNIEJSZA ANIMACJA: spokojny, głęboki oddech (zmniejszone z 3.5 do 1.6):
    this.animSpeed = 1.6;
    this.animFrame = 0;
  }

  // Super Armor: Ciosy gracza nie odpychają smoka
  takeDamage(amount, attackerAngle, knockback, hitInfo = {}) {
    if (this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashTimer = 0.14;

    this.knockbackVx = 0;
    this.knockbackVy = 0;

    if (this.hp <= 0) {
      this.die();
    }
  }

  update(dt, player) {
    if (this.isDestroyed) return;

    this.updateBase(dt);

    // Animacja oddechu i pulsującego blasku na piersi:
    if (!this.isDead) {
      this.animTime += dt * this.animSpeed;
      // Pętla po 4 klatkach (0, 1, 2, 3)
      this.animFrame = Math.floor(this.animTime) % 4;
    }

    // Płynne opadanie cienia paska bossa (Ghost Bar):
    if (this.ghostHp > this.hp) {
      this.ghostHp -= 75 * dt;
      if (this.ghostHp < this.hp) this.ghostHp = this.hp;
    }

    // Smok zawsze patrzy w stronę gracza:
    if (player && !this.isDead) {
      this.facing = player.x < this.x ? -1 : 1;
    }
  }

  draw(ctx, heightmap) {
    if (this.isDestroyed) return;

    const proj = heightmap ? heightmap.toScreen(this.x, this.y) : { screenX: this.x, screenY: this.y };
    const screenX = proj.screenX;
    const screenY = proj.screenY;

    ctx.save();
    ctx.globalAlpha = this.deathFade;

    // 1. Cień pod łapami smoka
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY - 5, 46, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rysowanie Spritesheeta z Twojego pliku:
    if (this.spriteLoaded && this.sprite.complete && this.sprite.naturalWidth > 0) {
      const scale = this.targetSize / this.frameSize;
      const destW = this.targetSize;
      const destH = this.targetSize;

      // Współrzędne w klatce 2x2:
      // Klatka 0: (col:0, row:0), Klatka 1: (col:1, row:0)
      // Klatka 2: (col:0, row:1), Klatka 3: (col:1, row:1)
      const col = this.animFrame % 2;
      const row = Math.floor(this.animFrame / 2);

      const srcX = col * this.frameSize;
      const srcY = row * this.frameSize;

      ctx.save();
      // Kotwica w stopach:
      ctx.translate(screenX, screenY);
      // Lustrzane odbicie w zależności od pozycji gracza:
      ctx.scale(this.facing, 1);

      if (this.hitFlashTimer > 0) {
        ctx.filter = 'brightness(2) contrast(1.5)';
      }

      // Łapy dotykają ziemi na ~95% wysokości klatki:
      ctx.drawImage(
        this.sprite,
        srcX, srcY, this.frameSize, this.frameSize,
        Math.round(-destW / 2),
        Math.round(-destH * 0.94),
        destW,
        destH
      );

      ctx.restore();
    }

    ctx.restore();
  }

  // Epicki Pasek Bossa na górze ekranu
  drawBossHealthBar(ctx, canvasWidth) {
    if (this.isDestroyed || this.deathFade <= 0.05) return;

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.deathFade);

    const barWidth = 480;
    const barHeight = 14;
    const startX = (canvasWidth - barWidth) / 2;
    const startY = 32;

    // Ciemne tło ramki
    ctx.fillStyle = 'rgba(10, 12, 22, 0.9)';
    ctx.fillRect(startX - 6, startY - 20, barWidth + 12, barHeight + 28);
    ctx.strokeStyle = '#38bdf8'; // Błękitne obsydianowe okucie
    ctx.lineWidth = 2;
    ctx.strokeRect(startX - 6, startY - 20, barWidth + 12, barHeight + 28);

    // Tytuł Bossa
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.bossName, canvasWidth / 2, startY - 5);

    // Tło paska
    ctx.fillStyle = 'rgba(20, 25, 45, 0.85)';
    ctx.fillRect(startX, startY, barWidth, barHeight);

    // Ghost Bar (opadający cień obrażeń)
    const ghostPercent = Math.max(0, this.ghostHp / this.maxHp);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(startX, startY, ghostPercent * barWidth, barHeight);

    // Właściwy pasek HP (głęboki błękit z gradientem)
    const hpPercent = Math.max(0, this.hp / this.maxHp);
    const grad = ctx.createLinearGradient(startX, 0, startX + barWidth, 0);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
    ctx.fillRect(startX, startY, hpPercent * barWidth, barHeight);

    ctx.restore();
  }
}