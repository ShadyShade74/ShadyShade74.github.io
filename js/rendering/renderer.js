export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        // Zapobiegamy rozmazywaniu pikseli
        this.ctx.imageSmoothingEnabled = false;
    }

    clear(color = '#18181b') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Rysowanie siatki podłoża do celów testowych
    drawDebugGrid(camera, tileSize = 64) {
        const startX = Math.floor(camera.x / tileSize) * tileSize;
        const startY = Math.floor(camera.y / tileSize) * tileSize;
        const endX = startX + this.width + tileSize * 2;
        const endY = startY + this.height + tileSize * 2;

        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = 1;

        for (let x = startX; x <= endX; x += tileSize) {
            const screen = camera.worldToScreen(x, 0);
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, 0);
            this.ctx.lineTo(screen.x, this.height);
            this.ctx.stroke();
        }

        for (let y = startY; y <= endY; y += tileSize) {
            const screen = camera.worldToScreen(0, y);
            this.ctx.beginPath();
            this.ctx.moveTo(0, screen.y);
            this.ctx.lineTo(this.width, screen.y);
            this.ctx.stroke();
        }
    }

    // Rysowanie cienia pod obiektem
    drawShadow(screenX, screenY, radiusX = 14, radiusY = 7) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.beginPath();
        this.ctx.ellipse(screenX, screenY, radiusX, radiusY, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // Rysowanie prostokąta testowego (z uwzględnieniem Z)
    drawRect(screenX, screenY, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, width, height);
    }
}