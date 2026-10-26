export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.heldKeys = new Set();
    this.tappedKeys = new Set();

    this.mouse = {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
      isLeftDown: false,
      isRightDown: false,
      leftJustPressed: false,
      rightJustPressed: false,
      wheelDelta: 0 // <--- Kółko myszy
    };

    window.addEventListener('keydown', (e) => {
      // Blokujemy przewijanie i wyszukiwarkę F3
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'F3'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.heldKeys.has(e.code)) {
        this.tappedKeys.add(e.code);
      }
      this.heldKeys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.heldKeys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.heldKeys.clear();
      this.tappedKeys.clear();
      this.mouse.isLeftDown = false;
      this.mouse.isRightDown = false;
      this.mouse.leftJustPressed = false;
      this.mouse.rightJustPressed = false;
      this.mouse.wheelDelta = 0;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.screenX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.screenY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.isLeftDown = true;
        this.mouse.leftJustPressed = true;
      } else if (e.button === 2) {
        this.mouse.isRightDown = true;
        this.mouse.rightJustPressed = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.isLeftDown = false;
      if (e.button === 2) this.mouse.isRightDown = false;
    });

    // Nasłuchiwanie kółka myszy (Scroll):
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.mouse.wheelDelta = e.deltaY;
    }, { passive: false });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(code) {
    return this.heldKeys.has(code);
  }

  isJustPressed(code) {
    return this.tappedKeys.has(code);
  }

  getMovementVector() {
    let x = 0;
    let y = 0;

    if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;

    if (x !== 0 && y !== 0) {
      const factor = 1 / Math.SQRT2;
      x *= factor;
      y *= factor;
    }

    return { x, y };
  }

  updateWorldPosition(camX, camY) {
    this.mouse.worldX = this.mouse.screenX + camX;
    this.mouse.worldY = this.mouse.screenY + camY;
  }

  endFrame() {
    this.tappedKeys.clear();
    this.mouse.leftJustPressed = false;
    this.mouse.rightJustPressed = false;
    this.mouse.wheelDelta = 0; // <--- Reset kółka po każdej klatce
  }
}