const PLAYER_SPRITE_ROWS = [0, 1, 2, 3];
const ATTACK_SPRITE_ROWS = [0, 2, 1, 3];

export class Player {
  constructor(x = 1910, y = 1960) {
    this.x = x;
    this.y = y;

    this.collisionBox = {
      radiusX: 14,
      radiusY: 7,
      offsetX: 0,
      offsetY: -13
    };

    this.baseSpeed = 180;
    this.runSpeed = 290;
    this.speed = this.baseSpeed;

    this.direction = 0;
    this.isMoving = false;
    this.isRunning = false;

    this.maxHp = 100;
    this.hp = 100;
    this.maxStamina = 100;
    this.stamina = 100;
    this.staminaRegenRate = 25;
    this.runStaminaCost = 25;

    // Mechanika ataku
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.22;
    this.attackCooldown = 0;
    this.attackCooldownTime = 0.32;
    this.currentBladeAngle = 0;
    this.attackAnimFrame = 0;

    // Wymiary ostrza miecza
    this.bladeLength = 38;
    this.bladeWidth = 6;
    this.bladeCurrentHilt = { x: 0, y: 0 };
    this.bladeCurrentTip = { x: 0, y: 0 };

    this.sprite = new Image();
    this.sprite.src = 'assets/player/spritesheet.png';
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };

    this.frameWidth = 16;
    this.frameHeight = 32;
    this.scale = 2.5;

    this.animTime = 0;
    this.animFrame = 0;
    this.attackSprite = new Image();
    this.attackSprite.src = 'assets/player/attack.png';
    this.attackSpriteLoaded = false;
    this.attackSprite.onload = () => { this.attackSpriteLoaded = true; };
    this.attackFrameWidth = 32;
    this.attackFrameHeight = 32;
    this.attackFrameCount = 4;
  }

  update(dt, input, chunkManager) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    if (this.isAttacking) {
      this.attackTimer += dt;
      const progress = Math.min(1, this.attackTimer / this.attackDuration);
      this.attackAnimFrame = Math.min(
        this.attackFrameCount - 1,
        Math.floor(progress * this.attackFrameCount)
      );

      // Płynna interpolacja kąta zamachu
      this.currentBladeAngle = this.attackStartAngle + (this.attackEndAngle - this.attackStartAngle) * progress;

      // Punkt dłoni gracza
      const handOffsetY = -14;
      this.bladeCurrentHilt.x = this.x + Math.cos(this.currentBladeAngle) * 10;
      this.bladeCurrentHilt.y = (this.y + handOffsetY) + Math.sin(this.currentBladeAngle) * 10;

      this.bladeCurrentTip.x = this.bladeCurrentHilt.x + Math.cos(this.currentBladeAngle) * this.bladeLength;
      this.bladeCurrentTip.y = this.bladeCurrentHilt.y + Math.sin(this.currentBladeAngle) * this.bladeLength;

      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
      }
      return;
    }

    if (input.mouse.leftJustPressed && this.attackCooldown <= 0) {
      this.startAttack(input);
      return;
    }

    const { x: dx, y: dy } = input.getMovementVector();
    this.isMoving = dx !== 0 || dy !== 0;

    const wantsRun = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
    if (wantsRun && this.isMoving && this.stamina > 2) {
      this.isRunning = true;
      this.speed = this.runSpeed;
      this.stamina = Math.max(0, this.stamina - this.runStaminaCost * dt);
    } else {
      this.isRunning = false;
      this.speed = this.baseSpeed;
      if (this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * dt);
      }
    }

    if (this.isMoving) {
      this.updateDirection(dx, dy);

      const targetX = this.x + dx * this.speed * dt;
      const targetY = this.y + dy * this.speed * dt;

      const resolved = chunkManager.resolveMovement(this, targetX, targetY);
      this.x = resolved.x;
      this.y = resolved.y;

      const animSpeed = this.isRunning ? 12 : 8;
      this.animTime += dt * animSpeed;
      this.animFrame = Math.floor(this.animTime) % 4;
    } else {
      this.animFrame = 0;
      this.animTime = 0;
    }
  }

  startAttack(input) {
    this.isAttacking = true;
    this.attackTimer = 0;
    this.attackAnimFrame = 0;
    this.attackCooldown = this.attackCooldownTime;

    const deltaX = input.mouse.worldX - this.x;
    const deltaY = input.mouse.worldY - (this.y - 14);
    const baseAngle = Math.atan2(deltaY, deltaX);

    this.updateDirection(deltaX, deltaY);

    const arcSpread = 0.95; // ~55 stopni zasięgu

    // Downward attacks keep their original sweep; horizontal attacks follow the sprite.
    if (this.direction === 0) {
      if (deltaX < 0) {
        this.attackStartAngle = baseAngle + arcSpread;
        this.attackEndAngle = baseAngle - arcSpread;
      } else {
        this.attackStartAngle = baseAngle - arcSpread;
        this.attackEndAngle = baseAngle + arcSpread;
      }
    } else if (deltaX < 0) {
      this.attackStartAngle = baseAngle - arcSpread;
      this.attackEndAngle = baseAngle + arcSpread;
    } else {
      this.attackStartAngle = baseAngle + arcSpread;
      this.attackEndAngle = baseAngle - arcSpread;
    }
  }

  updateDirection(dx, dy) {
    if (Math.abs(dy) > Math.abs(dx)) {
      this.direction = dy > 0 ? 0 : 2;
    } else {
      this.direction = dx > 0 ? 1 : 3;
    }
  }

  draw(ctx, heightmap) {
    const proj = heightmap.toScreen(this.x, this.y);
    const screenX = proj.screenX;
    const screenY = proj.screenY;
    if (this.isAttacking && this.attackSpriteLoaded) {
      const destW = this.attackFrameWidth * this.scale;
      const destH = this.attackFrameHeight * this.scale;
      const destX = screenX - destW / 2;
      const destY = screenY - destH + 4;
      ctx.drawImage(
        this.attackSprite,
        this.attackAnimFrame * this.attackFrameWidth,
        ATTACK_SPRITE_ROWS[this.direction] * this.attackFrameHeight,
        this.attackFrameWidth,
        this.attackFrameHeight,
        Math.round(destX),
        Math.round(destY),
        destW,
        destH
      );
    } else if (this.spriteLoaded) {
      const destW = this.frameWidth * this.scale;
      const destH = this.frameHeight * this.scale;
      const destX = screenX - destW / 2;
      const destY = screenY - destH + 4;
      const srcX = this.animFrame * this.frameWidth;
      const srcY = PLAYER_SPRITE_ROWS[this.direction] * this.frameHeight;
      ctx.drawImage(
        this.sprite,
        srcX, srcY, this.frameWidth, this.frameHeight,
        Math.round(destX), Math.round(destY), destW, destH
      );
    } else {
      ctx.save();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(screenX, screenY - 24, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Rysowanie bryły ostrza w trybie F3 (brak zapałki, solidny kształt)
  drawDebug(ctx) {
    if (this.isAttacking) {
      ctx.save();

      const hx = this.bladeCurrentHilt.x;
      const hy = this.bladeCurrentHilt.y;
      const tx = this.bladeCurrentTip.x;
      const ty = this.bladeCurrentTip.y;
      const angle = this.currentBladeAngle;
      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);

      const baseHalfWidth = this.bladeWidth / 2;
      const tipHalfWidth = 1.5;
      
      // 1. Zarys klingi miecza (wielokąt zwężający się ku sztychowi)
      ctx.beginPath();
      ctx.moveTo(hx + normalX * baseHalfWidth, hy + normalY * baseHalfWidth);
      ctx.lineTo(tx + normalX * tipHalfWidth, ty + normalY * tipHalfWidth);
      ctx.lineTo(tx, ty); // sztych
      ctx.lineTo(tx - normalX * tipHalfWidth, ty - normalY * tipHalfWidth);
      ctx.lineTo(hx - normalX * baseHalfWidth, hy - normalY * baseHalfWidth);
      ctx.closePath();

      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)'; // Bursztynowy prześwitujący
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Garda / jelec u nasady rękojeści
      const guardWidth = 8;
      ctx.beginPath();
      ctx.moveTo(hx + normalX * guardWidth / 2, hy + normalY * guardWidth / 2);
      ctx.lineTo(hx - normalX * guardWidth / 2, hy - normalY * guardWidth / 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 3. Czerwony punkt sztychu
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      ctx.restore();
    }
  }
}