import { itemDatabase } from '../items/items.js';

export class Inventory {
  constructor(initialRows = 5, maxWeight = 50.0) {
    this.isOpen = false;

    // Siatka: 7 kolumn, 5 rzędów na start (35 slotów)
    this.cols = 7;
    this.visibleRows = 5;

    this.slots = new Array(this.visibleRows * this.cols).fill(null);
    this.maxWeight = maxWeight;

    // Wymiary kratek (połączone bez przerw w litą drewnianą ramę):
    this.slotSize = 46;
    this.slotGap = 0;
    this.padding = 16;
    this.scrollbarWidth = 10;
    this.scrollbarGap = 12;

    this.gridWidth = this.cols * this.slotSize;
    this.visibleHeight = this.visibleRows * this.slotSize;

    this.headerHeight = 36;
    this.weightBarHeight = 36;

    this.windowWidth = this.gridWidth + this.padding * 2 + this.scrollbarWidth + this.scrollbarGap;
    this.windowHeight = this.headerHeight + this.visibleHeight + this.weightBarHeight + this.padding * 2;

    this.hoveredSlot = -1;

    // Przewijanie i Scrollbar:
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.isDraggingScrollbar = false;
    this.dragThumbOffset = 0;

    // Modułowy arkusz drewnianej siatki:
    this.gridSheet = new Image();
    this.gridSheet.src = 'assets/ui/inventory-ui.png';

    // Opcjonalne tło okna:
    this.bgImage = new Image();
    this.bgImage.src = 'assets/ui/inventory-bg.png';
  }

  get totalRows() {
    return Math.ceil(this.slots.length / this.cols);
  }

  get totalContentHeight() {
    return this.totalRows * this.slotSize;
  }

  get maxScrollY() {
    return Math.max(0, this.totalContentHeight - this.visibleHeight);
  }

  getCurrentWeight() {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.itemData) {
        total += (slot.itemData.weight || 0.5) * slot.count;
      }
    }
    return Math.round(total * 10) / 10;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.hoveredSlot = -1;
    this.isDraggingScrollbar = false;
  }

  addItem(itemId, count = 1) {
    const itemData = itemDatabase[itemId];
    if (!itemData) return { success: false, reason: 'invalid_item' };

    const itemWeight = (itemData.weight || 0.5) * count;
    if (this.getCurrentWeight() + itemWeight > this.maxWeight) {
      return { success: false, reason: 'overweight' };
    }

    // 1. Łączenie w istniejący stos:
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        this.slots[i].count += count;
        return { success: true };
      }
    }

    // 2. Wolny slot w bieżącej siatce:
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        let iconImg = null;
        if (itemData.icon) {
          iconImg = new Image();
          iconImg.src = itemData.icon;
        }

        this.slots[i] = {
          id: itemId,
          count: count,
          itemData: itemData,
          iconImg: iconImg
        };
        return { success: true };
      }
    }

    // 3. Dodanie nowego wiersza, gdy brak miejsca:
    for (let i = 0; i < this.cols; i++) {
      this.slots.push(null);
    }

    const newSlotIndex = this.slots.length - this.cols;
    let iconImg = null;
    if (itemData.icon) {
      iconImg = new Image();
      iconImg.src = itemData.icon;
    }

    this.slots[newSlotIndex] = {
      id: itemId,
      count: count,
      itemData: itemData,
      iconImg: iconImg
    };

    return { success: true };
  }

  update(input) {
    if (input.isJustPressed('Tab') || input.isJustPressed('KeyI')) {
      this.toggle();
    }

    if (this.isOpen && input.isJustPressed('Escape')) {
      this.isOpen = false;
      this.isDraggingScrollbar = false;
    }

    if (!this.isOpen) return;

    const canvasW = input.canvas.width;
    const canvasH = input.canvas.height;
    const winX = Math.round((canvasW - this.windowWidth) / 2);
    const winY = Math.round((canvasH - this.windowHeight) / 2);
    const gridStartX = winX + this.padding;
    const gridStartY = winY + this.headerHeight + 6;

    const mouseX = input.mouse.screenX;
    const mouseY = input.mouse.screenY;

    const sbX = gridStartX + this.gridWidth + this.scrollbarGap;
    const sbY = gridStartY;
    const sbW = this.scrollbarWidth;
    const sbH = this.visibleHeight;

    const thumbHeight = Math.max(24, Math.round((this.visibleRows / this.totalRows) * sbH));
    const trackScrollable = sbH - thumbHeight;
    const scrollRatio = this.maxScrollY > 0 ? (this.scrollY / this.maxScrollY) : 0;
    const thumbY = sbY + scrollRatio * trackScrollable;

    // Przeciąganie scrollbara myszką:
    if (this.maxScrollY > 0) {
      if (input.mouse.leftJustPressed) {
        if (mouseX >= sbX - 4 && mouseX <= sbX + sbW + 4 && mouseY >= sbY && mouseY <= sbY + sbH) {
          this.isDraggingScrollbar = true;

          if (mouseY >= thumbY && mouseY <= thumbY + thumbHeight) {
            this.dragThumbOffset = mouseY - thumbY;
          } else {
            this.dragThumbOffset = thumbHeight / 2;
            const newThumbY = mouseY - this.dragThumbOffset;
            const ratio = trackScrollable > 0 ? Math.max(0, Math.min(1, (newThumbY - sbY) / trackScrollable)) : 0;
            this.targetScrollY = ratio * this.maxScrollY;
            this.scrollY = this.targetScrollY;
          }
        }
      }

      if (this.isDraggingScrollbar) {
        if (!input.mouse.isLeftDown) {
          this.isDraggingScrollbar = false;
        } else {
          const newThumbY = mouseY - this.dragThumbOffset;
          const ratio = trackScrollable > 0 ? Math.max(0, Math.min(1, (newThumbY - sbY) / trackScrollable)) : 0;
          this.targetScrollY = ratio * this.maxScrollY;
          this.scrollY = this.targetScrollY;
        }
      }

      // Kółko myszy:
      const isMouseOverWindow =
        mouseX >= winX && mouseX <= winX + this.windowWidth &&
        mouseY >= winY && mouseY <= winY + this.windowHeight;

      const wheel = (input.mouse && typeof input.mouse.wheelDelta === 'number') ? input.mouse.wheelDelta : 0;

      if (isMouseOverWindow && wheel !== 0 && !this.isDraggingScrollbar) {
        this.targetScrollY += Math.sign(wheel) * this.slotSize;
        this.targetScrollY = Math.max(0, Math.min(this.maxScrollY, this.targetScrollY));
      }

      if (!this.isDraggingScrollbar) {
        this.scrollY += (this.targetScrollY - this.scrollY) * 0.35;
        if (Math.abs(this.targetScrollY - this.scrollY) < 0.5) {
          this.scrollY = this.targetScrollY;
        }
      }
    } else {
      this.scrollY = 0;
      this.targetScrollY = 0;
      this.isDraggingScrollbar = false;
    }

    this.hoveredSlot = -1;

    // Wykrywanie aktywnego slotu:
    const inVisibleArea =
      mouseX >= gridStartX && mouseX <= gridStartX + this.gridWidth &&
      mouseY >= gridStartY && mouseY <= gridStartY + this.visibleHeight;

    if (inVisibleArea && !this.isDraggingScrollbar) {
      const localX = mouseX - gridStartX;
      const localY = mouseY - gridStartY + this.scrollY;

      const col = Math.floor(localX / this.slotSize);
      const row = Math.floor(localY / this.slotSize);

      if (col >= 0 && col < this.cols && row >= 0 && row < this.totalRows) {
        const slotIdx = row * this.cols + col;
        if (slotIdx >= 0 && slotIdx < this.slots.length) {
          this.hoveredSlot = slotIdx;
        }
      }
    }
  }

  // Precyzyjne, bezszwowe wycinanie kafelka ze spritesheetu:
  drawGridTile(ctx, col, row, totalRows, sx, sy, size) {
    if (this.gridSheet.complete && this.gridSheet.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;

      const isLeft = col === 0;
      const isRight = col === this.cols - 1;
      const isTop = row === 0;
      const isBottom = row === totalRows - 1;

      // 1. Domyślnie środkowa kratka (od 48 do 64, w: 17; od 21 do 37, h: 17):
      let srcX = 48;
      let srcY = 21;
      let srcW = 17;
      let srcH = 17;

      // 2. Krawędzie poziome:
      if (isLeft) {
        srcX = 28; // od 28 do 47
        srcW = 20;
      } else if (isRight) {
        srcX = 82; // od 82 do 102
        srcW = 21;
      }

      // 3. Krawędzie pionowe:
      if (isTop) {
        srcY = 0;  // od 0 do 20
        srcH = 21;
      } else if (isBottom) {
        srcY = 55; // od 55 do 74
        srcH = 20;
      }

      ctx.drawImage(this.gridSheet, srcX, srcY, srcW, srcH, sx, sy, size, size);
    } else {
      ctx.fillStyle = 'rgba(26, 36, 51, 0.7)';
      ctx.beginPath();
      ctx.roundRect(sx, sy, size, size, 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  draw(ctx, canvasW, canvasH, mouseX, mouseY) {
    if (!this.isOpen) return;

    ctx.save();

    // 1. Przyciemnienie świata gry:
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvasW, canvasH);

    const winX = Math.round((canvasW - this.windowWidth) / 2);
    const winY = Math.round((canvasH - this.windowHeight) / 2);

    // 2. Tło okna ekwipunku:
    if (this.bgImage.complete && this.bgImage.naturalWidth > 0) {
      ctx.drawImage(this.bgImage, winX, winY, this.windowWidth, this.windowHeight);
    } else {
      ctx.fillStyle = 'rgba(15, 20, 28, 0.96)';
      ctx.beginPath();
      ctx.roundRect(winX, winY, this.windowWidth, this.windowHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 3. Nagłówek okna:
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EKWIPUNEK', winX + this.padding, winY + 22);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.slots.length} SLOTÓW`, winX + this.windowWidth - this.padding, winY + 22);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(winX + 12, winY + this.headerHeight);
    ctx.lineTo(winX + this.windowWidth - 12, winY + this.headerHeight);
    ctx.stroke();

    // 4. Obszar siatki slotów z przycinaniem (CLIPPING):
    const gridStartX = winX + this.padding;
    const gridStartY = winY + this.headerHeight + 6;

    ctx.save();
    ctx.beginPath();
    ctx.rect(gridStartX - 2, gridStartY - 2, this.gridWidth + 4, this.visibleHeight + 4);
    ctx.clip();

    const renderScrollY = Math.round(this.scrollY);

    for (let i = 0; i < this.slots.length; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);

      const sx = gridStartX + col * this.slotSize;
      const sy = gridStartY + row * this.slotSize - renderScrollY;

      if (sy + this.slotSize < gridStartY - 10 || sy > gridStartY + this.visibleHeight + 10) {
        continue;
      }

      const isHovered = i === this.hoveredSlot;
      const slotData = this.slots[i];

      // Bezszwowy kafelek drewniany:
      this.drawGridTile(ctx, col, row, this.totalRows, sx, sy, this.slotSize);

      // Subtelne podświetlenie dopasowane do zagłębienia ramki:
      if (isHovered) {
        const isLeft = col === 0;
        const isRight = col === this.cols - 1;
        const isTop = row === 0;
        const isBottom = row === this.totalRows - 1;

        const padL = isLeft ? 5 : 2;
        const padR = isRight ? 5 : 2;
        const padT = isTop ? 5 : 2;
        const padB = isBottom ? 5 : 2;

        const hx = sx + padL;
        const hy = sy + padT;
        const hw = this.slotSize - padL - padR;
        const hh = this.slotSize - padT - padB;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.fillRect(hx, hy, hw, hh);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hx, hy, hw, hh);
      }

      // Przedmiot:
      if (slotData) {
        if (slotData.iconImg && slotData.iconImg.complete && slotData.iconImg.naturalWidth > 0) {
          ctx.imageSmoothingEnabled = false;
          const maxDim = Math.max(slotData.iconImg.naturalWidth, slotData.iconImg.naturalHeight);
          const iconSize = 28;
          const scale = iconSize / maxDim;
          const destW = Math.round(slotData.iconImg.naturalWidth * scale);
          const destH = Math.round(slotData.iconImg.naturalHeight * scale);

          ctx.drawImage(
            slotData.iconImg,
            Math.round(sx + (this.slotSize - destW) / 2),
            Math.round(sy + (this.slotSize - destH) / 2),
            destW,
            destH
          );
        } else {
          ctx.fillStyle = slotData.itemData.color;
          ctx.beginPath();
          ctx.arc(sx + this.slotSize / 2, sy + this.slotSize / 2, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ilość w stosie:
        if (slotData.count > 1) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`x${slotData.count}`, sx + this.slotSize - 3, sy + this.slotSize - 4);
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`x${slotData.count}`, sx + this.slotSize - 4, sy + this.slotSize - 5);
        }
      }
    }

    ctx.restore(); // Koniec clippingu

    // 5. Scrollbar:
    const sbX = gridStartX + this.gridWidth + this.scrollbarGap;
    const sbY = gridStartY;
    const sbW = this.scrollbarWidth;
    const sbH = this.visibleHeight;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(sbX, sbY, sbW, sbH, 4);
    ctx.fill();

    const thumbHeight = Math.max(24, Math.round((this.visibleRows / this.totalRows) * sbH));
    const trackScrollable = sbH - thumbHeight;
    const scrollRatio = this.maxScrollY > 0 ? (renderScrollY / this.maxScrollY) : 0;
    const thumbY = sbY + scrollRatio * trackScrollable;

    const canScroll = this.maxScrollY > 0;
    ctx.fillStyle = canScroll ? (this.isDraggingScrollbar ? '#94a3b8' : '#475569') : 'rgba(71, 85, 105, 0.25)';
    ctx.beginPath();
    ctx.roundRect(sbX, thumbY, sbW, thumbHeight, 4);
    ctx.fill();
    ctx.strokeStyle = canScroll ? '#64748b' : 'rgba(100, 116, 139, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 6. Pasek udźwigu:
    const barAreaY = winY + this.headerHeight + this.visibleHeight + 14;
    const curWeight = this.getCurrentWeight();
    const weightPercent = Math.min(1, curWeight / this.maxWeight);

    let weightColor = '#22c55e';
    if (weightPercent > 0.75) weightColor = '#f59e0b';
    if (weightPercent >= 0.95) weightColor = '#ef4444';

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Udźwig:', winX + this.padding, barAreaY + 11);

    ctx.fillStyle = weightColor;
    ctx.textAlign = 'right';
    ctx.fillText(`${curWeight.toFixed(1)} / ${this.maxWeight.toFixed(1)} kg`, winX + this.windowWidth - this.padding, barAreaY + 11);

    const barW = this.windowWidth - this.padding * 2;
    const barH = 6;
    const barY = barAreaY + 16;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.beginPath();
    ctx.roundRect(winX + this.padding, barY, barW, barH, 3);
    ctx.fill();

    ctx.fillStyle = weightColor;
    ctx.beginPath();
    ctx.roundRect(winX + this.padding, barY, barW * weightPercent, barH, 3);
    ctx.fill();

    // 7. Tooltip:
    if (this.hoveredSlot !== -1 && this.slots[this.hoveredSlot] && !this.isDraggingScrollbar) {
      this.drawTooltip(ctx, this.slots[this.hoveredSlot], mouseX, mouseY, canvasW, canvasH);
    }

    ctx.restore();
  }

  drawTooltip(ctx, slot, mouseX, mouseY, canvasW, canvasH) {
    const item = slot.itemData;
    const pad = 10;
    const tooltipW = 200;
    const tooltipH = 66;

    let tx = mouseX + 14;
    let ty = mouseY + 14;
    if (tx + tooltipW > canvasW - 10) tx = mouseX - tooltipW - 10;
    if (ty + tooltipH > canvasH - 10) ty = mouseY - tooltipH - 10;

    ctx.fillStyle = 'rgba(10, 14, 22, 0.97)';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tooltipW, tooltipH, 6);
    ctx.fill();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = item.color;
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, tx + pad, ty + 18);

    const totalSlotWeight = ((item.weight || 0.5) * slot.count).toFixed(1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(`[${item.type}] • ${totalSlotWeight} kg (${item.weight || 0.5} kg/szt.)`, tx + pad, ty + 32);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(item.description, tx + pad, ty + 48, tooltipW - pad * 2);
  }
}