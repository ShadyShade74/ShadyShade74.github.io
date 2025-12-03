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


function getTileByGridPos(gridX, gridY) {
  return placementTiles.find(tile => 
    tile.gridX === gridX && tile.gridY === gridY
  )
}


function getValidLShape(centerGridX, centerGridY) {
  const centerTile = getTileByGridPos(centerGridX, centerGridY);
  const rightTile = getTileByGridPos(centerGridX + 1, centerGridY);
  const belowTile = getTileByGridPos(centerGridX, centerGridY + 1);
  
  if (centerTile && !centerTile.occupied &&
      rightTile && !rightTile.occupied &&
      belowTile && !belowTile.occupied) {
    return [centerTile, rightTile, belowTile]
  }
  return null
}

function animate() {
    requestAnimationFrame(animate);
    c.drawImage(image, 0, 0);

    enemies.forEach(e => e.update());

    let hovered = null;
    let available2x2 = []

    placementTiles.forEach(tile => {
        if (tile.isHovered(mouse)) hovered = tile;
    });

    placementTiles.forEach(tile => {
        let highlight = false;

        if (hovered) {
            const hx = hovered.gridX;
            const hy = hovered.gridY;

            if (block2x2Exists(hx, hy)) {
                const x = tile.gridX;
                const y = tile.gridY;

                if (
                    (x === hx     && y === hy) ||
                    (x === hx + 1 && y === hy) ||
                    (x === hx     && y === hy + 1) ||
                    (x === hx + 1 && y === hy + 1)
                ) {
                    highlight = true;
                    available2x2.push(tile)
                }
            }
        }

        tile.update(highlight);
    });

    if (available2x2.length === 4) {
      c.fillStyle = 'rgba(255, 255, 255, 0.3)'
      available2x2.forEach(tile => {
        c.fillRect(tile.position.x, tile.position.y, tile.size, tile.size)
      })
    }


    if (activeLShapeTiles.length === 3) {
      c.fillStyle = 'rgba(255, 255, 255, 0.1)'
      activeLShapeTiles.forEach(tile => {
        c.fillRect(tile.position.x, tile.position.y, tile.size, tile.size)
      })
    }
    
    buildings.forEach(building => {
        building.draw()

        building.projectiles.forEach(projectile => {
          projectile.update()
        })
    });

}

canvas.addEventListener('click', (event) => {
  if (activeLShapeTiles.length === 3) {
    buildings.push(
      new Building({
        position: {
          x: activeLShapeTiles[0].position.x,
          y: activeLShapeTiles[0].position.y
        }
      })
    )
    activeLShapeTiles.forEach(tile => {
      tile.occupied = true
    })
    activeLShapeTiles = []
  }
})

window.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect()

  mouse.x = event.clientX - rect.left
  mouse.y = event.clientY - rect.top
  
  activeTile = null
  activeLShapeTiles = []
  
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i]
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile
      
      const lShape = getValidLShape(tile.gridX, tile.gridY)
      if (lShape) {
        activeLShapeTiles = lShape
      }
      break
    }
  }
})