const PLAYER_SPRITE_ROWS = [0, 1, 2, 3];
const ATTACK_SPRITE_ROWS = [0, 2, 1, 3];

export class Player {
  constructor(x = 1910, y = 1960) {
    this.x = x;
    this.y = y;
    // Fizyczny collisionBox stóp (zielona elipsa w F3)
    this.collisionBox = {
      radiusX: 14,
      radiusY: 7,
      offsetX: 0,
      offsetY: -13
    };
    // Statystyki walki
    this.hitsThisSwing = new Set();
    this.baseDamage = 25;
    // Ruch i bieganie
    this.baseSpeed = 180;
    this.runSpeed = 290;
    this.speed = this.baseSpeed;
    this.direction = 0; // 0: Dół, 1: Prawo, 2: Góra, 3: Lewo
    this.isMoving = false;
    this.isRunning = false;
    // Paski Zdrowia i Staminy
    this.maxHp = 100;
    this.hp = 100;
    this.maxStamina = 100;
    this.stamina = 100;
    this.staminaRegenRate = 25;
    this.runStaminaCost = 25;
    // Mechanika Ataku
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.22;
    this.attackCooldown = 0;
    this.attackCooldownTime = 0.32;
    this.attackType = 'slash'; // 'slash' lub 'thrust'
    this.attackAnimFrame = 0;
    this.attackFrameCount = 4;
    this.attackStartAngle = 0;
    this.attackEndAngle = 0;
    this.attackAngle = 0;
    // Parametry Dasha przy pchnięciu
    this.thrustDashSpeed = 0;
    this.thrustDirX = 0;
    this.thrustDirY = 0;
    // Fizyczna belka ostrza (pomarańczowa w F3)
    this.bladeLength = 38;
    this.bladeWidth = 6;
    this.currentBladeAngle = 0;
    this.bladeCurrentHilt = { x: 0, y: 0 };
    this.bladeCurrentTip = { x: 0, y: 0 };
    // 1. Spritesheet chodu (16x32 na klatkę)
    this.sprite = new Image();
    this.sprite.src = 'assets/player/spritesheet.png';
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };
    this.frameWidth = 16;
    this.frameHeight = 32;
    this.scale = 2.5;
    this.animTime = 0;
    this.animFrame = 0;
    // 2. Spritesheet cięcia (Slash - 32x32 na klatkę)
    this.attackSprite = new Image();
    this.attackSprite.src = 'assets/player/attack.png';
    this.attackSpriteLoaded = false;
    this.attackSprite.onload = () => { this.attackSpriteLoaded = true; };
    this.attackFrameWidth = 32;
    this.attackFrameHeight = 32;
    // 3. Rozdzielone Spritesheety pchnięcia (Thrust - góra i dół)
    this.thrustSprites = {
      up: new Image(),
      down: new Image()
    };
    this.thrustSprites.up.src = 'assets/player/thrust-attack-up.png';
    this.thrustSprites.down.src = 'assets/player/thrust-attack-down.png';
  }

  update(dt, input, chunkManager) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    if (this.isAttacking) {
      this.attackTimer += dt;
      const progress = Math.min(1, this.attackTimer / this.attackDuration);
      if (this.attackType === 'thrust') {
        // 2 klatki: do 40% doskok (klatka 0), od 40% wbity sztych (klatka 1)
        this.attackAnimFrame = progress < 0.40 ? 0 : 1;
        // Płynny Dash kontynuujący bieg:
        if (progress < 0.65) {
          const dashProgress = progress / 0.65;
          const speedFactor = Math.pow(1 - dashProgress, 1.2);
          const currentSpeed = this.thrustDashSpeed * speedFactor;
          const nextX = this.x + this.thrustDirX * currentSpeed * dt;
          const nextY = this.y + this.thrustDirY * currentSpeed * dt;
          const resolved = chunkManager.resolveMovement(this, nextX, nextY);
          this.x = resolved.x;
          this.y = resolved.y;
        }
      } else {
        this.attackAnimFrame = Math.min(
          this.attackFrameCount - 1,
          Math.floor(progress * this.attackFrameCount)
        );
      }
      this.currentBladeAngle = this.attackStartAngle + (this.attackEndAngle - this.attackStartAngle) * progress;
      let handOffsetY = -14;
      if (this.attackType === 'thrust') {
        if (this.direction === 0) {
          handOffsetY = -22;
        } else if (this.direction === 1 || this.direction === 3) {
          handOffsetY = -20;
        } else if (this.direction === 2) {
          handOffsetY = -16;
        }
      }
      // TEJ JEDNEJ LINIJKI ZABRAKŁO:
      const armExtension = this.attackType === 'thrust' ? (progress < 0.40 ? 6 : 20) : 10;
      // Rękojeść i sztych przesuwają się w przód o stałą długość:
      this.bladeCurrentHilt.x = this.x + Math.cos(this.currentBladeAngle) * armExtension;
      this.bladeCurrentHilt.y = (this.y + handOffsetY) + Math.sin(this.currentBladeAngle) * armExtension;
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
    this.updateDirection(deltaX, deltaY);
    const cardinalAngles = [Math.PI / 2, 0, -Math.PI / 2, Math.PI];
    const cardinalVectors = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];
    const baseAngle = cardinalAngles[this.direction];
    const baseVector = cardinalVectors[this.direction];
    const wantsThrust = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
    if (wantsThrust) {
      this.attackType = 'thrust';
      this.attackFrameCount = 2; // 2 klatki
      this.attackDuration = 0.22;
      this.attackStartAngle = baseAngle;
      this.attackEndAngle = baseAngle;
      this.attackAngle = baseAngle;
      // ZACHOWANIE PĘDU: Jeśli już biegniesz, prędkość sprintu dodaje się do Dasha!
      // Dzięki temu gracz nie staje w miejscu, tylko wystrzeliwuje jak z procy:
      const sprintBoost = this.isRunning ? 200 : 0;
      this.thrustDashSpeed = 460 + sprintBoost;
      this.thrustDirX = baseVector.x;
      this.thrustDirY = baseVector.y;
    } else {
      this.attackType = 'slash';
      this.attackFrameCount = 4;
      this.attackDuration = 0.22;
      this.thrustDashSpeed = 0;
      this.thrustDirX = 0;
      this.thrustDirY = 0;
      this.attackAngle = baseAngle;
      const arcSpread = 0.95;
      if (this.direction === 0) {
        this.attackStartAngle = baseAngle - arcSpread;
        this.attackEndAngle = baseAngle + arcSpread;
      } else if (this.direction === 2) {
        this.attackStartAngle = baseAngle + arcSpread;
        this.attackEndAngle = baseAngle - arcSpread;
      } else if (this.direction === 3) {
        this.attackStartAngle = baseAngle - arcSpread;
        this.attackEndAngle = baseAngle + arcSpread;
      } else {
        this.attackStartAngle = baseAngle - arcSpread;
        this.attackEndAngle = baseAngle + arcSpread;
      }
    }
    this.hitsThisSwing.clear();
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
    if (this.isAttacking) {
      if (this.attackType === 'thrust') {
        // Wybieramy odpowiedni plik w zależności od kierunku:
        let thrustImg = null;
        if (this.direction === 0 && this.thrustSprites.down.complete) {
          thrustImg = this.thrustSprites.down; // W DÓŁ
        } else if (this.direction === 2 && this.thrustSprites.up.complete) {
          thrustImg = this.thrustSprites.up;   // W GÓRĘ
        }
        if (thrustImg) {
          const frameW = Math.floor(thrustImg.naturalWidth / 2); // 32 px
          const frameH = thrustImg.naturalHeight;                // 32 px
          const destW = frameW * this.scale;
          const destH = frameH * this.scale;
          const destX = screenX - destW / 2;
          const destY = screenY - destH + 4;
          ctx.drawImage(
            thrustImg,
            this.attackAnimFrame * frameW,
            0, // te pliki mają 1 rząd
            frameW,
            frameH,
            Math.round(destX),
            Math.round(destY),
            destW,
            destH
          );
          return;
        }
      }
      // Zwykłe cięcie (lub fallback, gdy atakujesz w boki przed dorysowaniem lewo/prawo):
      if (this.attackSpriteLoaded && this.attackSprite.complete) {
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
        return;
      }
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
  checkCombatCollisions(targets, onHitCallback) {
     if (!this.isAttacking) return;
    const hilt = this.bladeCurrentHilt;
    const tip = this.bladeCurrentTip;
    for (const target of targets) {
      if (!target.hurtbox || this.hitsThisSwing.has(target)) continue;
      const targetX = target.x + target.hurtbox.offsetX;
      const targetY = target.y + target.hurtbox.offsetY;
      const radiusX = target.hurtbox.radiusX;
      const radiusY = target.hurtbox.radiusY;
      const scaleRatio = radiusX / radiusY;
      const scaledHiltY = hilt.y * scaleRatio;
      const scaledTipY = tip.y * scaleRatio;
      const scaledTargetY = targetY * scaleRatio;
      const lineDx = tip.x - hilt.x;
      const lineDy = scaledTipY - scaledHiltY;
      const lineLengthSq = lineDx * lineDx + lineDy * lineDy;
      let closestT = 0;
      if (lineLengthSq > 0) {
        closestT = ((targetX - hilt.x) * lineDx + (scaledTargetY - scaledHiltY) * lineDy) / lineLengthSq;
        closestT = Math.max(0, Math.min(1, closestT));
      }
      const closestX = hilt.x + closestT * lineDx;
      const closestY = scaledHiltY + closestT * lineDy;
      const distance = Math.hypot(targetX - closestX, scaledTargetY - closestY);
      if (distance <= radiusX + 6) {
        this.hitsThisSwing.add(target);
        
        const hitWorldX = hilt.x + closestT * (tip.x - hilt.x);
        const hitWorldY = hilt.y + closestT * (tip.y - hilt.y);
        
        const knockbackForce = this.attackType === 'thrust' ? 260 : 130;
        target.takeDamage(this.baseDamage, this.attackAngle, knockbackForce);
        
        if (onHitCallback) {
          onHitCallback({
            x: hitWorldX,
            y: hitWorldY,
            damage: this.baseDamage,
            target: target
          });
        }
      }
    }
  }
}