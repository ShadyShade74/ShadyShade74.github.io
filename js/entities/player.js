const directionRows = {
    down: 0,
    right: 1,
    up: 2,
    left: 3
};

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.z = 0; // Wysokość w przestrzeni 2.5D

        // Wymiary kolizyjne / bazowe
        this.width = 24;
        this.height = 36;

        // Wczytywanie spritesheetu
        this.sprite = new Image();
        this.sprite.src = './assets/entities/player/spritesheet.png';
        this.spriteLoaded = false;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };

        // Parametry klatki ze spritesheetu
        this.frameWidth = 16;
        this.frameHeight = 32;
        this.scale = 2; // Skalowanie pixel-artu (2x = 32x64 px na ekranie)

        // Stan animacji chodu
        this.currentFrame = 0;
        this.totalFrames = 4;
        this.animTimer = 0;
        this.frameDuration = 0.15; // Czas trwania klatki w sekundach

        // Statystyki
        this.maxHealth = 100;
        this.health = 100;
        this.maxStamina = 100;
        this.stamina = 100;

        // Parametry ruchu
        this.walkSpeed = 160;   // px na sekundę
        this.runSpeed = 270;    // px na sekundę
        this.staminaDrainPerSecond = 25;
        this.staminaRegenPerSecond = 18;

        this.isRunning = false;
        this.facingDirection = 'down'; // 'down', 'up', 'left', 'right'
    }

    update(dt, input) {
        let moveX = 0;
        let moveY = 0;

        if (input.keys.left) moveX -= 1;
        if (input.keys.right) moveX += 1;
        if (input.keys.up) moveY -= 1;
        if (input.keys.down) moveY += 1;

        const isMoving = moveX !== 0 || moveY !== 0;

        // Bieg i zużycie / regeneracja staminy
        const wantsToRun = input.keys.shift && isMoving;
        if (wantsToRun && this.stamina > 0) {
            this.isRunning = true;
            this.stamina = Math.max(0, this.stamina - this.staminaDrainPerSecond * dt);
        } else {
            this.isRunning = false;
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenPerSecond * dt);
        }

        const currentSpeed = this.isRunning ? this.runSpeed : this.walkSpeed;

        if (isMoving) {
            // Normalizacja wektora po przekątnych
            const length = Math.hypot(moveX, moveY);
            const normalizedX = moveX / length;
            const normalizedY = moveY / length;

            this.x += normalizedX * currentSpeed * dt;
            this.y += normalizedY * currentSpeed * dt;

            // Wyznaczanie kierunku zwrotu
            if (Math.abs(moveX) > Math.abs(moveY)) {
                this.facingDirection = moveX > 0 ? 'right' : 'left';
            } else {
                this.facingDirection = moveY > 0 ? 'down' : 'up';
            }

            // Aktualizacja klatki animacji
            this.animTimer += dt;
            const speedMultiplier = this.isRunning ? 1.3 : 1.0;
            if (this.animTimer >= this.frameDuration / speedMultiplier) {
                this.animTimer = 0;
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            }
        } else {
            // Po zatrzymaniu resetujemy do klatki spoczynkowej (idle)
            this.animTimer = 0;
            this.currentFrame = 0;
        }
    }

    render(renderer, camera) {
        const renderWidth = this.frameWidth * this.scale;
        const renderHeight = this.frameHeight * this.scale;

        // Pozycja stóp postaci w przestrzeni ekranu
        const screenPos = camera.worldToScreen(this.x, this.y, this.z);
        const drawX = Math.round(screenPos.x - renderWidth / 2);
        const drawY = Math.round(screenPos.y - renderHeight);

        // Jeśli spritesheet się jeszcze nie wczytał, rysujemy tymczasowy obrys
        if (!this.spriteLoaded) {
            renderer.drawRect(drawX, drawY, renderWidth, renderHeight, '#38bdf8');
            return;
        }

        // Źródłowe współrzędne klatki na spritesheecie
        const row = directionRows[this.facingDirection] ?? 0;
        const sx = this.currentFrame * this.frameWidth;
        const sy = row * this.frameHeight;

        // Rysowanie klatki postaci
        renderer.ctx.drawImage(
            this.sprite,
            sx, sy, this.frameWidth, this.frameHeight,
            drawX, drawY, renderWidth, renderHeight
        );
    }
}