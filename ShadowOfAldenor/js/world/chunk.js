// Konfiguracja skali i kolizji dla każdego typu obiektu – edytuj wartości w tym miejscu!
export const objectConfigs = {
  tree: {
    scale: 0.58,
    drawOffsetY: 14,
    collisionBox: { radiusX: 24, radiusY: 10, offsetX: 16, offsetY: -6 }
  },
  bush: {
    scale: 0.5,
    drawOffsetY: 6,
    collisionBox: { radiusX: 18, radiusY: 9, offsetX: 0, offsetY: -4 }
  },
  bush1: {
    scale: 0.5,
    drawOffsetY: 6,
    collisionBox: { radiusX: 18, radiusY: 9, offsetX: 0, offsetY: -4 }
  },
  rocks: {
    scale: 1.0,
    drawOffsetY: 4,
    collisionBox: { radiusX: 20, radiusY: 8, offsetX: -1, offsetY: -13}
  }
};

export class Chunk {
  constructor(chunkX, chunkY, size, heightmap) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
    this.size = size;
    this.worldX = chunkX * size;
    this.worldY = chunkY * size;
    this.heightmap = heightmap;

    this.objects = [];

    this.buffer = document.createElement('canvas');
    this.buffer.width = size;
    this.buffer.height = size;
    this.ctx = this.buffer.getContext('2d');

    this.bake();
    this.populateObjects();
  }

  bake() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e381e';
    ctx.fillRect(0, 0, this.size, this.size);
  }

  populateObjects() {
    const pseudoRandom = (seed) => Math.abs(Math.sin(seed));
    const types = ['tree', 'bush', 'bush1', 'rocks'];

    for (let i = 0; i < 7; i++) {
      const type = types[i % types.length];
      const posX = this.worldX + 90 + pseudoRandom(this.worldX + i * 53) * (this.size - 180);
      const posY = this.worldY + 90 + pseudoRandom(this.worldY + i * 97) * (this.size - 180);

      const config = objectConfigs[type];

      this.objects.push({
        type: type,
        x: posX,
        y: posY,
        scale: config.scale,
        drawOffsetY: config.drawOffsetY,
        // Kopia parametrów kolizji dla danego obiektu
        collisionBox: {
          radiusX: config.collisionBox.radiusX,
          radiusY: config.collisionBox.radiusY,
          offsetX: config.collisionBox.offsetX,
          offsetY: config.collisionBox.offsetY
        }
      });
    }
  }

  drawTerrain(mainCtx) {
    mainCtx.drawImage(this.buffer, this.worldX, this.worldY);
  }
}