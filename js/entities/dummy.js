import { Entity } from './entity.js';
// Co wypada po rozbiciu drewnianego manekina:
const DUMMY_LOOT_TABLE = [
  { itemId: 'wood', chance: 1.0, min: 1, max: 3 },
  { itemId: 'bread', chance: 0.8, min: 1, max: 2 },
  { itemId: 'iron_ingot', chance: 0.35, min: 1, max: 1 },
  { itemId: 'diamond', chance: 0.99, min: 1, max: 5 }
];

export class Dummy extends Entity {
  constructor(x = 2050, y = 1960) {
    super(x, y, {
      maxHp: 100,
      collisionBox: { radiusX: 18, radiusY: 9, offsetX: 0, offsetY: -3 },
      hurtbox: { radiusX: 22, radiusY: 36, offsetX: 0, offsetY: -38 },
      lootTable: DUMMY_LOOT_TABLE // <-- DEDYKOWANY LOOT!
    });

    this.targetHeight = 80;
    this.wobbleAngle = 0;
    this.wobbleSpeed = 0;
    this.sprite = new Image();
    this.sprite.src = 'assets/objects/enviroment/dummy.png';
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };
  }

  // Własna reakcja na cios (chwianie):
  onHit(amount, attackerAngle, hitInfo) {
    const wobbleDir = Math.cos(attackerAngle) !== 0 ? Math.sign(Math.cos(attackerAngle)) : 1;
    this.wobbleSpeed = wobbleDir * 3.8;
  }

  update(dt) {
    if (this.isDestroyed) return;

    // 1. Bazowa fizyka Entity (odrzut, hitFlash, odliczanie Fade-outu po śmierci):
    this.updateBase(dt);

    // 2. Chwianie manekina:
    if (Math.abs(this.wobbleAngle) > 0.001 || Math.abs(this.wobbleSpeed) > 0.001) {
      const spring = 320;
      const damping = 22;
      const force = -spring * this.wobbleAngle - damping * this.wobbleSpeed;
      this.wobbleSpeed += force * dt;
      this.wobbleAngle += this.wobbleSpeed * dt;
      this.wobbleAngle = Math.max(-0.14, Math.min(0.14, this.wobbleAngle));
    } else {
      this.wobbleAngle = 0;
      this.wobbleSpeed = 0;
    }
  }

  draw(ctx, heightmap) {
    if (this.isDestroyed) return;

    const proj = heightmap ? heightmap.toScreen(this.x, this.y) : { screenX: this.x, screenY: this.y };
    const screenX = proj.screenX;
    const screenY = proj.screenY;

    ctx.save();

    // OBSŁUGA PŁYNNEGO FADE-OUTU PO ŚMIERCI (przezroczystość):
    ctx.globalAlpha = this.deathFade;

    // Pivot w podstawie:
    ctx.translate(screenX, screenY - 4);
    ctx.rotate(this.wobbleAngle);
    ctx.translate(-screenX, -(screenY - 4));

    if (this.spriteLoaded && this.sprite.naturalHeight > 0) {
      const scale = this.targetHeight / this.sprite.naturalHeight;
      const destW = this.sprite.naturalWidth * scale;
      const destH = this.targetHeight;

      if (this.hitFlashTimer > 0) {
        ctx.filter = 'brightness(2)';
      }

      ctx.drawImage(
        this.sprite,
        Math.round(screenX - destW / 2),
        Math.round(screenY - destH + 4),
        Math.round(destW),
        Math.round(destH)
      );
    } else {
      this.drawFallback(ctx, screenX, screenY);
    }

    ctx.restore();

    // Pasek HP nad manekinem (jeśli oberwał):
    ctx.save();
    ctx.globalAlpha = this.deathFade;
    this.drawHpBar(ctx, screenX, screenY, -84, 34);
    ctx.restore();
  }

  drawFallback(ctx, screenX, screenY) {
    const isFlashing = this.hitFlashTimer > 0;
    ctx.fillStyle = isFlashing ? '#ffffff' : '#6b4f35';
    ctx.fillRect(screenX - 7, screenY - 58, 14, 56);
    ctx.strokeStyle = '#3e2a1b';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - 7, screenY - 58, 14, 56);

    ctx.fillStyle = isFlashing ? '#ffffff' : '#855e3c';
    ctx.fillRect(screenX - 24, screenY - 48, 48, 10);
    ctx.strokeRect(screenX - 24, screenY - 48, 48, 10);

    ctx.fillStyle = isFlashing ? '#ffffff' : '#d4af37';
    ctx.beginPath();
    ctx.arc(screenX, screenY - 64, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}