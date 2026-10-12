export class Entity {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;

    // Statystyki życia
    this.maxHp = config.maxHp || 100;
    this.hp = this.maxHp;
    this.isDead = false;

    // Płynne znikanie po śmierci (Fade-out)
    this.deathFade = 1.0;          // od 1.0 (widoczny) do 0.0 (znika)
    this.deathFadeSpeed = 1.2;     // jak szybko zanika (ok. 0.8 sekundy)
    this.isDestroyed = false;      // flaga do usunięcia ze świata po zniknięciu

    // Pudełka fizyki (opcjonalne w zależności od bytu)
    this.collisionBox = config.collisionBox || null;
    this.hurtbox = config.hurtbox || null;

    // Fizyka odrzutu (Knockback) i mignięcie po ciosie
    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.knockbackFriction = config.knockbackFriction || 14;
    this.hitFlashTimer = 0;
    this.lootTable = config.lootTable || null;
  }

  // Uniwersalna metoda otrzymywania ciosu
  takeDamage(amount, attackerAngle = 0, knockback = 0, hitInfo = {}) {
    if (this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashTimer = 0.12;

    // Fizyczny odrzut
    if (knockback > 0) {
      this.knockbackVx = Math.cos(attackerAngle) * knockback;
      this.knockbackVy = Math.sin(attackerAngle) * knockback;
    }

    // Wywołanie specyficznej reakcji danego bytu (np. chwianie manekina, ucieczka zwierza)
    this.onHit(amount, attackerAngle, hitInfo);

    // Sprawdzenie zgonu
    if (this.hp <= 0) {
      this.die();
    }
  }

  // Co się dzieje przy trafieniu (nadpisywane przez konkretne byty)
  onHit(amount, attackerAngle, hitInfo) {}

  // Śmierć bytu
  die(onDropLootCallback) {
    if (this.isDead) return;
    this.isDead = true;
    // NATYCHMIAST KASUJEMY HITBOXY PO ŚMIERCI:
    // Gracz może swobodnie przejść przez miejsce śmierci i nie może już bić trupa:
    this.collisionBox = null;
    this.hurtbox = null;
    if (this.lootTable && onDropLootCallback) {
      onDropLootCallback(this.lootTable, this.x, this.y);
    }
    this.onDeath();
  }

  // Dodatkowa reakcja na śmierć (np. dźwięk, drop)
  onDeath() {}

  // Bazowa pętla fizyki dla każdego bytu (odrzut + fade-out)
  updateBase(dt) {
    // 1. Tarcie i przesuwanie odrzutu
    if (Math.abs(this.knockbackVx) > 1 || Math.abs(this.knockbackVy) > 1) {
      this.x += this.knockbackVx * dt;
      this.y += this.knockbackVy * dt;
      this.knockbackVx -= this.knockbackVx * this.knockbackFriction * dt;
      this.knockbackVy -= this.knockbackVy * this.knockbackFriction * dt;
    } else {
      this.knockbackVx = 0;
      this.knockbackVy = 0;
    }

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    // 2. Obsługa płynnego Fade-outu po śmierci
    if (this.isDead) {
      this.deathFade -= this.deathFadeSpeed * dt;
      if (this.deathFade <= 0) {
        this.deathFade = 0;
        this.isDestroyed = true; // byt zniknął całkowicie
      }
    }
  }

  // Rysowanie paska HP nad głową (jeśli byt oberwał)
  drawHpBar(ctx, screenX, screenY, barOffsetY = -45, barWidth = 32) {
    if (this.isDead || this.hp >= this.maxHp) return;

    const hpPercent = Math.max(0, this.hp / this.maxHp);
    const barHeight = 4;
    const startX = screenX - barWidth / 2;
    const startY = screenY + barOffsetY;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(startX, startY, barWidth, barHeight);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(startX, startY, hpPercent * barWidth, barHeight);
  }

  // Automatyczny debug F3 dla każdego bytu
  drawDebug(ctx) {
    if (this.isDestroyed) return;
    ctx.save();

    if (this.collisionBox) {
      ctx.beginPath();
      ctx.ellipse(this.x + this.collisionBox.offsetX, this.y + this.collisionBox.offsetY, this.collisionBox.radiusX, this.collisionBox.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (this.hurtbox) {
      ctx.beginPath();
      ctx.ellipse(this.x + this.hurtbox.offsetX, this.y + this.hurtbox.offsetY, this.hurtbox.radiusX, this.hurtbox.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}