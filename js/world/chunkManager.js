import { Heightmap } from './heightmap.js';
import { Chunk } from './chunk.js';

export class ChunkManager {
  constructor(worldPixelWidth = 4096, worldPixelHeight = 4096) {
    this.chunkSize = 1024;
    this.worldWidth = worldPixelWidth;
    this.worldHeight = worldPixelHeight;

    this.cols = Math.ceil(this.worldWidth / this.chunkSize);
    this.rows = Math.ceil(this.worldHeight / this.chunkSize);

    this.heightmap = new Heightmap();
    this.chunks = new Map();

    this.assets = {
      bush: new Image(),
      bush1: new Image(),
      tree: new Image(),
      rocks: new Image()
    };
    this.assetsLoaded = { bush: false, bush1: false, tree: false, rocks: false };

    this.assets.bush.src = 'assets/objects/enviroment/bush.png';
    this.assets.bush.onload = () => { this.assetsLoaded.bush = true; };

    this.assets.bush1.src = 'assets/objects/enviroment/bush1.png';
    this.assets.bush1.onload = () => { this.assetsLoaded.bush1 = true; };

    this.assets.tree.src = 'assets/objects/enviroment/tree.png';
    this.assets.tree.onload = () => { this.assetsLoaded.tree = true; };

    this.assets.rocks.src = 'assets/objects/enviroment/rocks.png';
    this.assets.rocks.onload = () => { this.assetsLoaded.rocks = true; };

    this.initChunks();
  }

  getChunkKey(col, row) {
    return `${col}_${row}`;
  }

  initChunks() {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        this.chunks.set(this.getChunkKey(c, r), new Chunk(c, r, this.chunkSize, this.heightmap));
      }
    }
  }

  getVisibleChunks(camera) {
    const bounds = camera.getFrustumBounds(150);
    const startCol = Math.max(0, Math.floor(bounds.left / this.chunkSize));
    const endCol = Math.min(this.cols - 1, Math.floor(bounds.right / this.chunkSize));
    const startRow = Math.max(0, Math.floor(bounds.top / this.chunkSize));
    const endRow = Math.min(this.rows - 1, Math.floor(bounds.bottom / this.chunkSize));

    const visible = [];
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const chunk = this.chunks.get(this.getChunkKey(c, r));
        if (chunk) visible.push(chunk);
      }
    }
    return visible;
  }

  // Kolizja elips z obsługą przesunięć offsetX i offsetY
  resolveMovement(entity, nextX, nextY) {
    nextX = Math.max(40, Math.min(nextX, this.worldWidth - 40));
    nextY = Math.max(40, Math.min(nextY, this.worldHeight - 40));

    const pBox = entity.collisionBox;
    const playerCenterX = nextX + pBox.offsetX;
    const playerCenterY = nextY + pBox.offsetY;

    for (const chunk of this.chunks.values()) {
      for (const obj of chunk.objects) {
        const oBox = obj.collisionBox;
        const objCenterX = obj.x + oBox.offsetX;
        const objCenterY = obj.y + oBox.offsetY;

        const combinedRadiusX = pBox.radiusX + oBox.radiusX;
        const combinedRadiusY = pBox.radiusY + oBox.radiusY;

        const deltaX = playerCenterX - objCenterX;
        const deltaY = playerCenterY - objCenterY;

        const scaleRatio = combinedRadiusX / combinedRadiusY;
        const deltaYScaled = deltaY * scaleRatio;
        const distance = Math.hypot(deltaX, deltaYScaled);

        if (distance < combinedRadiusX && distance > 0) {
          const overlap = (combinedRadiusX - distance) / distance;
          nextX += deltaX * overlap;
          nextY += deltaY * overlap;
        }
      }
    }

    return { x: nextX, y: nextY };
  }

  draw(ctx, camera, dynamicEntities = []) {
    const visibleChunks = this.getVisibleChunks(camera);

    for (const chunk of visibleChunks) {
      chunk.drawTerrain(ctx);
    }

    const renderQueue = [];

    for (const chunk of visibleChunks) {
      for (const obj of chunk.objects) {
        renderQueue.push({
          sortY: obj.y,
          draw: (c) => this.drawStaticObject(c, obj)
        });
      }
    }

    for (const ent of dynamicEntities) {
      renderQueue.push({
        sortY: ent.y,
        draw: (c) => ent.draw(c, this.heightmap)
      });
    }

    renderQueue.sort((a, b) => a.sortY - b.sortY);

    for (const item of renderQueue) {
      item.draw(ctx);
    }
  }

  drawStaticObject(ctx, obj) {
    const img = this.assets[obj.type];
    if (this.assetsLoaded[obj.type] && img && img.width > 0) {
      const destW = img.width * obj.scale;
      const destH = img.height * obj.scale;
      ctx.drawImage(
        img,
        Math.round(obj.x - destW / 2),
        Math.round(obj.y - destH + obj.drawOffsetY),
        Math.round(destW),
        Math.round(destH)
      );
    }
  }

  // Precyzyjne rysowanie collision boxów w trybie debug f3
  drawDebug(ctx, camera, dynamicEntities = []) {
    const visibleChunks = this.getVisibleChunks(camera);
    ctx.save();

    // 1. Collision boxy obiektów świata
    for (const chunk of visibleChunks) {
      for (const obj of chunk.objects) {
        const box = obj.collisionBox;
        const centerX = obj.x + box.offsetX;
        const centerY = obj.y + box.offsetY;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, box.radiusX, box.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();

        // Punkt kotwicy (środek collision boxa)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 2, centerY - 2, 4, 4);

        ctx.fillStyle = '#fca5a5';
        ctx.font = '10px monospace';
        ctx.fillText(
          `${obj.type} (${box.radiusX}x${box.radiusY}) [ox:${box.offsetX}, oy:${box.offsetY}]`,
          centerX - 35, centerY - box.radiusY - 4
        );
      }
    }

    // 2. Collision box gracza
    for (const ent of dynamicEntities) {
      const box = ent.collisionBox;
      const centerX = ent.x + box.offsetX;
      const centerY = ent.y + box.offsetY;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, box.radiusX, box.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - 2, centerY - 2, 4, 4);

      ctx.fillStyle = '#86efac';
      ctx.font = '10px monospace';
      ctx.fillText(
        `player (${box.radiusX}x${box.radiusY})`,
        centerX - 30, centerY - box.radiusY - 4
      );
    }

    ctx.restore();
  }
}