const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}
const tileImage = new Image()
tileImage.src = 'media/Free-Spot.png'
const placementTiles = []

placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 288) {
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
image.src = 'media/map.png'

const enemies = []

function spawnEnemies(){
  for (let i = 1; i < 10; i++) {
    const xOffset = i * 100
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y }
      })
    )
  }
}
spawnEnemies()
const buildings = []
let activeTile = undefined

function animate() {
    requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)
    for(let i = enemies.length - 1; i >= 0; i--){
      const enemy = enemies[i]
      enemy.update()
    }
    placementTiles.forEach((tile) => {
      tile.update(mouse)
    })

    buildings.forEach((building) => {
      building.update()
      building.target = null

      const validEnemies = enemies.filter(enemy =>{
        const xDifference = enemy.center.x - building.center.x
        const yDifference = enemy.center.y - building.center.y
        const distance = Math.hypot(xDifference , yDifference)
        return distance < enemy.radius + building.radius 
      })
      building.target = validEnemies[0]
      for(let i = building.projectiles.length - 1; i >= 0; i--){
        const projectile = building.projectiles[i]
      
        projectile.update()

        const xDifference = projectile.enemy.center.x - projectile.position.x
        const yDifference = projectile.enemy.center.y - projectile.position.y
        const distance = Math.hypot(xDifference , yDifference)
        //when projectile hits a target
        if(distance < projectile.enemy.radius + projectile.radius){
          projectile.enemy.health -= 20
          if (projectile.enemy.health <= 0){
            const enemyIndex = enemies.findIndex((enemy) =>{

              return projectile.enemy === enemy
            })
            if(enemyIndex > -1)enemies.splice(enemyIndex , 1)
          }
          building.projectiles.splice(i, 1)
        }
      }
    })
}


const mouse = {
  x: undefined,
  y: undefined
}

canvas.addEventListener('click', (event) => {
  if (activeTile && !activeTile.isOccupied) {
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y
        }
      })
    )
    activeTile.isOccupied = true
  }

})

window.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect()

    mouse.x = event.clientX - rect.left
    mouse.y = event.clientY - rect.top

  
  activeTile = null
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i]
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