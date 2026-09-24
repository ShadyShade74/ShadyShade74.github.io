import { Entity } from '../entity.js';
import { checkCollision, getCollisionNormal } from '../collision.js';
export class Player extends Entity {
    constructor(x, y) {
        const frameWidth  = 16;
        const frameHeight = 32;
        const scale = 2;
        const w = frameWidth  * scale;
        const h = frameHeight * scale;
        super(x, y, w, h, {
            sprite: './assets/player/spritesheet.png',
            isSolid: false 
        });
        this.frameWidth  = frameWidth;
        this.frameHeight = frameHeight;
        this.scale = scale;
        this.maxFrames = 4;
        this.frameIndex = 0;
        this.animTimer  = 0;
        this.frameDuration = 0.13;

        this.directionRow = 0;
        this.speed = 220;

        this.collisionStep = 4;
    }

    get collider() {
        return {
            type: 'ellipse',
            x: this.x + this.width  / 2,
            y: this.y + this.height - 15,
            radiusX: 9,
            radiusY: 6
        };
    }
    get sortY() {
        return this.y + this.height - 15;
    }
    update(keys, dt, collidables = []) {
        let dx = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft']  ? 1 : 0);
        let dy = (keys['KeyS'] || keys['ArrowDown']  ? 1 : 0) - (keys['KeyW'] || keys['ArrowUp']   ? 1 : 0);
        if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

        if (Math.abs(dx) > Math.abs(dy)) {
            this.directionRow = dx > 0 ? 1 : 3;
        } else if (dy !== 0) {
            this.directionRow = dy > 0 ? 0 : 2;
        }
        const moved = this._move(dx * this.speed * dt, dy * this.speed * dt, collidables);

        if (moved) {
            this.animTimer += dt;
            if (this.animTimer >= this.frameDuration) {
                this.animTimer %= this.frameDuration;
                this.frameIndex = (this.frameIndex + 1) % this.maxFrames;
            }
        } else {
            this.frameIndex = 0;
            this.animTimer  = 0;
        }
    }

    _move(amountX, amountY, collidables) {
        const startX = this.x;
        const startY = this.y;
        const steps = Math.max(1,
            Math.ceil(Math.max(Math.abs(amountX), Math.abs(amountY)) / this.collisionStep)
        );
        const sx = amountX / steps;
        const sy = amountY / steps;
        for (let i = 0; i < steps; i++) {
            this._step(sx, sy, collidables);
        }
        return this.x !== startX || this.y !== startY;
    }
    _step(sx, sy, collidables) {
        const next = {
            type: 'ellipse',
            x: this.x + sx + this.width  / 2,
            y: this.y + sy + this.height - 15,
            radiusX: 9,
            radiusY: 6
        };

        const blocker = collidables.find(obj => {
            if (obj === this || !obj.isSolid) return false;
            const shapes = obj.colliders ?? (obj.collider ? [obj.collider] : []);
            return shapes.some(col => checkCollision(next, col));
        });
        if (!blocker) {
            this.x += sx;
            this.y += sy;
            return;
        }

        const shapes = blocker.colliders ?? [blocker.collider];
        const blockingShape = shapes.find(col => checkCollision(next, col)) ?? shapes[0];

        const normal = getCollisionNormal(next, blockingShape);
        const into   = sx * normal.x + sy * normal.y;
        const slideX = into < 0 ? sx - normal.x * into : sx;
        const slideY = into < 0 ? sy - normal.y * into : sy;

        const nextX = { ...next, x: this.x + slideX + this.width / 2 };
        const blockX = shapes.some(col => checkCollision(nextX, col));
        if (!blockX) this.x += slideX;

        const nextY = { ...next, x: this.x + this.width / 2, y: this.y + slideY + this.height - 10 };
        const blockY = shapes.some(col => checkCollision(nextY, col));
        if (!blockY) this.y += slideY;
    }
    draw(ctx) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (this.isLoaded && this.sprite) {
            const sx = this.frameIndex * this.frameWidth;
            const sy = this.directionRow * this.frameHeight;
            ctx.drawImage(
                this.sprite,
                sx, sy, this.frameWidth, this.frameHeight,
                Math.round(this.x), Math.round(this.y),
                this.width, this.height
            );
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
        }
        ctx.restore();
    }
}