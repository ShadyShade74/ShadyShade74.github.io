const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 500

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)


const placementData2D = []
for (let i = 0; i < placementsData.length; i += 20) {
    placementData2D.push(placementData.slice(i, i + 20))
}

const placementTiles = []

placemenData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 79) {
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            )
        }
    })
})

const image = new Image()
image.onload = () => {
    animate()
}
image.src = 'media/gameMap.png'

// ENEMIES
const enemies = []

function spawnEnemies(count) {
    for (let i = 1; i <= count; i++) {
        const offset = i * 150
        enemies.push(
            new Enemy({
                position: {
                    x: waypoints[0].x - offset,
                    y: waypoints[0].y
                }
            })
        )
    }
}

// BUDYNKI + GRA
const buildings = []
let activeTile = undefined
let enemyCount = 3
let coins = 100

spawnEnemies(enemyCount)

function animate() {
    requestAnimationFrame(animate)
    c.drawImage(image, 0, 0)

    // ENEMY UPDATE
    enemies.forEach((enemy) => {
        enemy.update()
    })

    // TILE UPDATE
    placementTiles.forEach((tile) => {
        tile.update(mouse)
    })

    // BUDYNKI + POCISKI
    buildings.forEach((building) => {
        building.draw()

        building.projectiles.forEach((projectile) => {
            projectile.update()
        })
    })

    // JEŚLI WSZYSCY WROGOWIE ZGINĘLI → SPAWN NOWYCH
    if (enemies.length === 0) {
        enemyCount += 2
        spawnEnemies(enemyCount)
    }
}

// MYSZ
const mouse = {
    x: undefined,
    y: undefined
}

// MOUSE CLICK
canvas.addEventListener('click', () => {
    if (activeTile && !activeTile.isOccupied && coins >= 50) {
        coins -= 50
        document.querySelector('#coins').innerHTML = coins

        buildings.push(
            new Building({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )

        activeTile.isOccupied = true

        // sortowanie (jak w tutorialu)
        buildings.sort((a, b) => {
            return a.position.y - b.position.y
        })
    }
})

// HOVER TILE CHECK
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY

    activeTile = null
    for (let tile of placementTiles) {
        if (
            mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile
            break
        }
    }
})