export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.speed = 220;
        this.color = '#460ccc';
    }

    update(keys, dt) {
        let dx = 0;
        let dy = 0;


        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

        // Vector Normalization
        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071; 
            dy *= 0.7071;
        }

        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;
    }

    draw(ctx) {
        ctx.save();

        //Shadow Draw
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height - 2,
            this.width * 0.5,
            6,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        //Player Character draw
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}