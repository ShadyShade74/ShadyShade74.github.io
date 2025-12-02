const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width=1280 
canvas.height=768

c.fillStyle='black'
c.fillRect(0,0,canvas.width,canvas.height)

const mouse = {
    x: undefined,
    y: undefined
}

const placementData2D = []
for (let i = 0; i < placementData.length; i += 20) {
  placementData2D.push(placementData.slice(i, i + 20))
}
const image = new Image()

image.onload = () => {
    animate()
}
image.src = 'media/map.png'

const placementTiles = []

placementData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64
          },
          xIndex: x,
          yIndex: y
        })
      )
    }
  })
})

const enemies = []
for (let i=1 ; i<10; i++){
    const xOffeset = i * 150
    enemies.push(new Enemy({
        position: {x:waypoints[0].x - xOffeset, y:waypoints[0].y}
    }))
}

const buildings = []
let activeTile = undefined
let activeLShapeTiles = []

function block2x2Exists(x, y) {
    return (
        placementData2D[y] &&
        placementData2D[y][x] === 14 &&
        placementData2D[y][x + 1] === 14 &&
        placementData2D[y + 1] &&
        placementData2D[y + 1][x] === 14 &&
        placementData2D[y + 1][x + 1] === 14
    );
}


function getTile(gridX, gridY) {
    return placementTiles.find(
        t => t.gridX === gridX && t.gridY === gridY
    ) || null;
}


function getValid2x2(gridX, gridY) {
    const tl = getTile(gridX,     gridY);
    const tr = getTile(gridX + 1, gridY);
    const bl = getTile(gridX,     gridY + 1);
    const br = getTile(gridX + 1, gridY + 1);

    if (!tl || !tr || !bl || !br) return null;

    if (tl.occupied || tr.occupied || bl.occupied || br.occupied) return null;

    return [tl, tr, bl, br];
}

function animate() {
    requestAnimationFrame(animate);
    c.drawImage(image, 0, 0);

    enemies.forEach(e => e.update());

    placementTiles.forEach(t => t.highlight = false);

    if (activeLShapeTiles.length === 4) {
      activeLShapeTiles.forEach(t => t.highlight = true);
    }

    placementTiles.forEach(t => t.draw());

    buildings.forEach(b => {
        b.draw();
        b.projectiles.forEach(p => p.update());
    });
}

canvas.addEventListener("click", () => {
    if (activeLShapeTiles.length !== 4) return;

    const origin = activeLShapeTiles[0];

    buildings.push(
        new Building({ position: { x: origin.position.x, y: origin.position.y } })
    );

    activeLShapeTiles.forEach(t => t.occupied = true);
    activeLShapeTiles = [];
});

window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    activeLShapeTiles = [];
    
    for (const tile of placementTiles) {
        if (tile.isHovered(mouse)) {

            const block = getValid2x2(tile.gridX, tile.gridY);
            if (block) activeLShapeTiles = block;

            return;
        }
    }
});
