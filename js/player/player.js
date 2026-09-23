import { Entity } from '../entity.js';

export class Player extends Entity {
    constructor(x, y) {
        const frameWidth = 16;
        const frameHeight = 32;
        const scale = 2;

        super(x, y, frameWidth * scale, frameHeight * scale, {
            sprite: './assets/player/spritesheet.png',
            hasShadow: true
        });

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.scale = scale;

        this.maxFrames = 4;

        this.frameIndex = 0;
        this.animTimer = 0;
        this.frameDuration = 0.14;

        this.directionRow = 0;
        this.isMoving = false;

        this.speed = 220;
    }

    update(keys, dt) {
        let dx = 0;
        let dy = 0;

        if (keys['KeyS'] || keys['ArrowDown']) {
            dy += 1;
            this.directionRow = 0;
        } else if (keys['KeyW'] || keys['ArrowUp']) {
            dy -= 1;
            this.directionRow = 2;
        }

        if (keys['KeyD'] || keys['ArrowRight']) {
            dx += 1;
            this.directionRow = 1;
        } else if (keys['KeyA'] || keys['ArrowLeft']) {
            dx -= 1;
            this.directionRow = 3;
        }

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;

        this.isMoving = (dx !== 0 || dy !== 0);

        if (this.isMoving) {
            this.animTimer += dt;
            if (this.animTimer >= this.frameDuration) {
                this.animTimer = 0;
                this.frameIndex = (this.frameIndex + 1) % this.maxFrames;
            }
        } else {
            this.frameIndex = 0;
            this.animTimer = 0;
        }
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