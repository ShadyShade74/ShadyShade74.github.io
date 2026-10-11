export class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.target = null;
        this.followSpeed = 0.08; // Płynność ruchu (0 = stoi, 1 = sztywne przyklejenie)
    }

    resize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    follow(targetEntity) {
        this.target = targetEntity;
    }

    update() {
        if (!this.target) return;

        // Celujemy w środek ekranu
        const targetX = this.target.x - this.viewportWidth / 2;
        const targetY = this.target.y - this.viewportHeight / 2;

        // Płynna interpolacja liniowa (lerp)
        this.x += (targetX - this.x) * this.followSpeed;
        this.y += (targetY - this.y) * this.followSpeed;
    }

    // Przeliczenie pozycji w świecie 2.5D na współrzędne pikselowe canvasu
    worldToScreen(worldX, worldY, heightZ = 0) {
        return {
            x: Math.round(worldX - this.x),
            y: Math.round((worldY - this.y) - heightZ)
        };
    }

    // Przeliczenie kliknięcia na ekranie na pozycję w świecie gry (płaszczyzna Z = 0)
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
}