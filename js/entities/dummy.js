export class Dummy {
    constructor(x = 2050, y = 1960) {
        this.x = x;
        this.y = y;
        // Docelowa wysokość w świecie gry (dopasowana do wzrostu gracza = 80px)
        this.targetHeight = 80;
        // Dopasowana kolizja stóp (czerwona w F3)
        this.collisionBox = {
            radiusX: 18,
            radiusY: 9,
            offsetX: 0,
            offsetY: -3
        };
        // Dopasowany hurtbox tułowia (błękitny w F3)
        this.hurtbox = {
            radiusX: 22,
            radiusY: 36,
            offsetX: 0,
            offsetY: -38
        };
        this.maxHp = 100;
        this.hp = 100;
        this.wobbleAngle = 0;
        this.wobbleSpeed = 0;
        this.hitFlashTimer = 0;
        this.sprite = new Image();
        this.sprite.src = 'assets/objects/enviroment/dummy.png';
        this.spriteLoaded = false;
        this.sprite.onload = () => { this.spriteLoaded = true; };
        this.knockbackVx = 0;
        this.knockbackVy = 0;
    }

    update(dt) {
    // 1. Fizyczny odrzut po ziemi
    if (Math.abs(this.knockbackVx) > 1 || Math.abs(this.knockbackVy) > 1) {
      this.x += this.knockbackVx * dt;
      this.y += this.knockbackVy * dt;
      const friction = 14;
      this.knockbackVx -= this.knockbackVx * friction * dt;
      this.knockbackVy -= this.knockbackVy * friction * dt;
    } else {
      this.knockbackVx = 0;
      this.knockbackVy = 0;
    }
    // 2. Sztywna sprężyna (szybki powrót do pionu)
    if (Math.abs(this.wobbleAngle) > 0.001 || Math.abs(this.wobbleSpeed) > 0.001) {
      const spring = 320; // sztywniejsze drewno
      const damping = 22; // szybsze zatrzymanie
      const force = -spring * this.wobbleAngle - damping * this.wobbleSpeed;
      this.wobbleSpeed += force * dt;
      this.wobbleAngle += this.wobbleSpeed * dt;
      // Blokada maksymalnego odchylenia (maks 8 stopni):
      this.wobbleAngle = Math.max(-0.14, Math.min(0.14, this.wobbleAngle));
    } else {
      this.wobbleAngle = 0;
      this.wobbleSpeed = 0;
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
  }

    takeDamage(amount, attackerAngle, knockback = 140) {
    this.hp = Math.max(0, this.hp - amount);
    // Fizyczny odrzut (przesunięcie w tył)
    this.knockbackVx = Math.cos(attackerAngle) * knockback;
    this.knockbackVy = Math.sin(attackerAngle) * knockback;
    // STONOWANE CHWIANIE: Lekkie, sztywne drgnięcie zamiast dzikiego bujania
    const wobbleDir = Math.cos(attackerAngle) !== 0 ? Math.sign(Math.cos(attackerAngle)) : 1;
    this.wobbleSpeed = wobbleDir * 3.8; // zredukowane z 14.0!
    this.hitFlashTimer = 0.12;
    if (this.hp <= 0) {
      this.hp = this.maxHp;
    }
  }

    draw(ctx, heightmap) {
        const proj = heightmap ? heightmap.toScreen(this.x, this.y) : { screenX: this.x, screenY: this.y };
        const screenX = proj.screenX;
        const screenY = proj.screenY;
        ctx.save();
        ctx.translate(screenX, screenY - 4);
        ctx.rotate(this.wobbleAngle);
        ctx.translate(-screenX, -(screenY - 4));
        if (this.spriteLoaded && this.sprite.naturalHeight > 0) {
            // AUTOMATYCZNE DOPASOWANIE:
            // Kod sam dzieli targetHeight przez rzeczywistą wysokość obrazka (np. 80 / 475)
            const scale = this.targetHeight / this.sprite.naturalHeight;
            const destW = this.sprite.naturalWidth * scale;  // ok. 65 px
            const destH = this.targetHeight;                 // 80 px

            if (this.hitFlashTimer > 0) {
                ctx.filter = 'brightness(2)';
            }
            // Rysujemy zakotwiczone w stopach:
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

    drawDebug(ctx) {
        ctx.save();
        // Czerwony collisionBox stóp
        const cBox = this.collisionBox;
        ctx.beginPath();
        ctx.ellipse(this.x + cBox.offsetX, this.y + cBox.offsetY, cBox.radiusX, cBox.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Błękitny hurtbox tułowia
        const hBox = this.hurtbox;
        ctx.beginPath();
        ctx.ellipse(this.x + hBox.offsetX, this.y + hBox.offsetY, hBox.radiusX, hBox.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#bae6fd';
        ctx.font = '10px monospace';
        ctx.fillText('dummy hurtbox', this.x - 38, this.y + hBox.offsetY - hBox.radiusY - 6);

        ctx.restore();
    }
}