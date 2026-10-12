export class DroppedItem {
  constructor(x, y, itemData) {
    this.x = x;
    this.y = y;
    this.id = itemData.id;
    this.name = itemData.name;
    this.color = itemData.color || '#fbbf24';
    this.count = itemData.count || 1;

    // Maksymalny rozmiar ikonki na ziemi w pikselach:
    this.maxSize = itemData.size || 22; // <-- NAPRAWIONA ZMIENNA!

    this.sprite = null;
    if (itemData.icon) {
      this.sprite = new Image();
      this.sprite.src = itemData.icon;
    }

    // Zasięg, w którym pojawia się dymek interakcji [E]
    this.interactionRadius = 45;

    const angle = Math.random() * Math.PI * 2;
    const speed = 35 + Math.random() * 45;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.animTime = Math.random() * 5;
  }

  // Tekst dymku interakcji
  getPrompt() {
    return `Podnieś: ${this.name} (${this.count})`;
  }

  update(dt) {
    this.animTime += dt * 4;
    if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx -= this.vx * 8 * dt;
      this.vy -= this.vy * 8 * dt;
    }
  }

  draw(ctx, heightmap) {
    const proj = heightmap ? heightmap.toScreen(this.x, this.y) : { screenX: this.x, screenY: this.y };
    const screenX = proj.screenX;
    const screenY = proj.screenY;

    const floatY = Math.sin(this.animTime) * 2.5;

    ctx.save();

    // 1. Cień na ziemi pod przedmiotem:
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const itemCenterY = screenY - 10 + floatY;

    // 2. Rysowanie grafiki przedmiotu:
    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      const maxDim = Math.max(this.sprite.naturalWidth, this.sprite.naturalHeight);
      const scale = this.maxSize / maxDim; // Teraz działa poprawnie!
      const destW = Math.round(this.sprite.naturalWidth * scale);
      const destH = Math.round(this.sprite.naturalHeight * scale);

      ctx.imageSmoothingEnabled = false;

      // Efekt stosu jeśli count > 1:
      if (this.count > 1) {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(this.sprite, Math.round(screenX - destW / 2 + 3), Math.round(itemCenterY - destH / 2 - 3), destW, destH);
        ctx.globalAlpha = 1.0;
      }

      // Główny przedmiot:
      ctx.drawImage(this.sprite, Math.round(screenX - destW / 2), Math.round(itemCenterY - destH / 2), destW, destH);
    } else {
      // Kolorowy fallback:
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(screenX, itemCenterY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }
}