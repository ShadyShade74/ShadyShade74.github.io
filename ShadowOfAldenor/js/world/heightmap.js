export class Heightmap {
  constructor() {}

  // Płaski świat na ten etap – zero wpisywania punktów
  getElevation(worldX, worldY) {
    return 0;
  }

  canTraverse(fromX, fromY, toX, toY) {
    return true;
  }

  toScreen(worldX, worldY) {
    return {
      screenX: worldX,
      screenY: worldY,
      z: 0
    };
  }
}