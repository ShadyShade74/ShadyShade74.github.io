export class Debug {
    constructor({ toggleKey = 'F3' } = {}) {
        this.enabled = false;
        window.addEventListener('keydown', (e) => {
            if (e.code !== toggleKey || e.repeat) return;
            e.preventDefault();
            this.enabled = !this.enabled;
        });
    }
    draw(ctx, entities) {
        if (!this.enabled) return;
        ctx.save();
        ctx.lineWidth = 1.5;
        for (const entity of entities) {
            const isPlayer = !entity.isStatic;
            ctx.strokeStyle = isPlayer ? '#38bdf8' : '#ef4444';
            ctx.fillStyle   = isPlayer ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            // Jeden lub wiele colliderów na obiekcie
            const shapes = entity.colliders ?? (entity.collider ? [entity.collider] : []);
            for (const col of shapes) {
                this.drawShape(ctx, col);
            }
        }
        // Etykieta w rogu ekranu (rysowana w space-screen, nie world-space!)
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(8, 8, 200, 28);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('[F3] DEBUG HITBOX: ON', 16, 27);
        ctx.restore();
    }
    drawShape(ctx, col) {
        ctx.beginPath();
        if (col.type === 'circle') {
            ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
        } else if (col.type === 'ellipse') {
            ctx.ellipse(col.x, col.y, col.radiusX, col.radiusY, 0, 0, Math.PI * 2);
        } else if (col.type === 'rectangle') {
            ctx.rect(col.x, col.y, col.width, col.height);
        } else if (col.type === 'polygon' && col.points?.length > 0) {
            ctx.moveTo(col.points[0].x, col.points[0].y);
            for (let i = 1; i < col.points.length; i++) {
                ctx.lineTo(col.points[i].x, col.points[i].y);
            }
            ctx.closePath();
        } else {
            return;
        }
        ctx.fill();
        ctx.stroke();
    }
}