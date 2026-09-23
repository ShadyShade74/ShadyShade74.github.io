export class Entity {
    constructor(x, y, width, height, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = options.color || '#38bdf8';
        this.isStatic = options.isStatic ?? false;
        this.bottomOffset = options.bottomOffset ?? 0;
        this.sprite = null;
        this.isLoaded = false;
        if (options.sprite) {
            this.sprite = new Image();
            this.sprite.src = options.sprite;
            this.sprite.onload = () => {
                this.isLoaded = true;
                if (options.preserveAspect ?? true) {
                    const aspectRatio = this.sprite.naturalHeight / this.sprite.naturalWidth;
                    this.height = Math.round(this.width * aspectRatio);
                }
            };
        }
    }
    get sortY() {
        return this.y + this.height - this.bottomOffset;
    }
    update(dt) {}
    draw(ctx) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (this.isLoaded && this.sprite) {
            ctx.drawImage(
                this.sprite,
                Math.round(this.x),
                Math.round(this.y),
                Math.round(this.width),
                Math.round(this.height)
            );
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
        }
        ctx.restore();
    }
}