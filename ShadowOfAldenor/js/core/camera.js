export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.x = 0;
    this.y = 0;
    this.smoothness = 8.0;

    this.worldBounds = {
      minX: 0,
      minY: 0,
      maxX: 10000,
      maxY: 10000
    };
  }

  setWorldBounds(minX, minY, maxX, maxY) {
    this.worldBounds = { minX, minY, maxX, maxY };
  }

  follow(targetX, targetY, dt) {
    const goalX = targetX - this.width / 2;
    const goalY = targetY - this.height / 2;

    const blend = 1 - Math.exp(-this.smoothness * dt);
    this.x += (goalX - this.x) * blend;
    this.y += (goalY - this.y) * blend;

    const limitX = Math.max(this.worldBounds.minX, this.worldBounds.maxX - this.width);
    const limitY = Math.max(this.worldBounds.minY, this.worldBounds.maxY - this.height);

    this.x = Math.max(this.worldBounds.minX, Math.min(this.x, limitX));
    this.y = Math.max(this.worldBounds.minY, Math.min(this.y, limitY));
  }

  // Zwraca prostokąt pola widzenia kamery (Frustum Culling)
  getFrustumBounds(padding = 0) {
    return {
      left: this.x - padding,
      top: this.y - padding,
      right: this.x + this.width + padding,
      bottom: this.y + this.height + padding
    };
  }

  // Sprawdza, czy dany prostokąt (np. chunk 1024x1024) mieści się w kadrze
  isRectVisible(rx, ry, rw, rh) {
    return (
      rx + rw >= this.x &&
      rx <= this.x + this.width &&
      ry + rh >= this.y &&
      ry <= this.y + this.height
    );
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  restore(ctx) {
    ctx.restore();
  }
}