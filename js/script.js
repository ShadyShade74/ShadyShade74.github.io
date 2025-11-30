const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width=1280 
canvas.height=768

c.fillStyle='black'
c.fillRect(0,0,canvas.width,canvas.height)

const placementData2D = []
for (let i = 0; i < placementData.length; i += 20) {
  placementData2D.push(placementData.slice(i, i + 20))
}
const image = new Image()

image.onload = () => {
    c.drawImage(image, 0, 0, canvas.width, canvas.height)  
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
          }
        })
      )
    }
  })
})

console.log(placementData)






const enemies = []
for (let i=1 ; i<10; i++){
    const xOffeset = i * 150
    enemies.push(new Enemy({
        position: {x:waypoints[0].x - xOffeset, y:waypoints[0].y}

    }
    ))

}

function animate(){
    requestAnimationFrame(animate)
    c.drawImage(image, 0 , 0)

    enemies.forEach(enemy => {
        enemy.update()
    })
    placementTiles.forEach(tile => {
        tile.draw()
    })
} 

animate()