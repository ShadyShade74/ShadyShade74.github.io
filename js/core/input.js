export class InputHandler {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false,
            ctrl: false,
            interact: false
        };

        this.mouse = {
            screenX: 0,
            screenY: 0,
            worldX: 0,
            worldY: 0,
            leftButton: false,
            rightButton: false
        };

        this.setupKeyboardListeners();
        this.setupMouseListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (event) => {
            this.handleKey(event.code, true);
        });

        window.addEventListener('keyup', (event) => {
            this.handleKey(event.code, false);
        });
    }

    handleKey(code, isPressed) {
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = isPressed;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = isPressed;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = isPressed;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = isPressed;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.shift = isPressed;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.keys.ctrl = isPressed;
                break;
            case 'KeyE':
                this.keys.interact = isPressed;
                break;
        }
    }

    setupMouseListeners() {
        // Blokada prawego kliku (aby menu przeglądarki nie przerywało bloku/parry)
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        window.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.screenX = event.clientX - rect.left;
            this.mouse.screenY = event.clientY - rect.top;

            // Przeliczenie na pozycję w świecie przez kamerę
            if (this.camera) {
                const worldPos = this.camera.screenToWorld(this.mouse.screenX, this.mouse.screenY);
                this.mouse.worldX = worldPos.x;
                this.mouse.worldY = worldPos.y;
            }
        });

        window.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.mouse.leftButton = true;
            } else if (event.button === 2) {
                this.mouse.rightButton = true;
            }
        });

        window.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.mouse.leftButton = false;
            } else if (event.button === 2) {
                this.mouse.rightButton = false;
            }
        });
    }
}