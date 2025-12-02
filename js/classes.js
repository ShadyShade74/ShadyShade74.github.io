class Enemy {
    constructor({position = {x:0 , y:0} }) {
        this.position = position
        this.width=100
        this.height=100
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height /2
        }
        this.radius = 50
    }

    draw(){
        c.fillStyle='red'
        c.beginPath()
        c.arc(this.center.x , this.center.y , this.radius , 0 ,Math.PI * 2)
        c.fill()
    }
    update(){
        this.draw()
        
        const waypoint = waypoints[this.waypointIndex]
        const yDistance = waypoint.y - this.center.y
        const xDistance = waypoint.x - this.center.x
        const angle = Math.atan2(yDistance , xDistance)

        this.position.x +=  Math.cos(angle)
        this.position.y +=  Math.sin(angle)
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height /2
        }

        if  (
            Math.round(this.center.x) === Math.round(waypoint.x) &&
            Math.round(this.center.y) === Math.round(waypoint.y) &&
            this.waypointIndex < waypoints.length -1
        ){ 
            this.waypointIndex++
        }
    }
}

class PlacementTile {
    constructor({ position, xIndex, yIndex }) {
        this.position = position;
        this.gridX = xIndex;
        this.gridY = yIndex;
        this.size = 64;
        this.occupied = false;
        this.highlight = false;
    }

    draw() {
        if (this.highlight) {
            c.fillStyle = 'rgba(255,255,255,0.3)';
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }
        else {
            c.fillStyle = 'rgba(255,255,255,0.15)';
            c.fillRect(this.position.x, this.position.y, this.size, this.size);
        }
    }

    isHovered(mouse) {
        return (
            mouse.x >= this.position.x &&
            mouse.x < this.position.x + this.size &&
            mouse.y >= this.position.y &&
            mouse.y < this.position.y + this.size
        );
    }
}

class Building {
    constructor({position = {x:0 , y:0} }) {
        this.position = position
        this.width = 64 * 2
        this.height = 64 * 2
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height /2
        }
        this.projectiles = [
            new Projectile({
                position: {
                    x: this.center.x ,
                    y: this.center.y ,
                }
            })
        ]
        
        this.enemy = enemies[0] 
    }
    
    draw(){
        c.fillStyle='blue'
        c.fillRect(this.position.x , this.position.y , this.width , this.height)
    }

}
class Projectile {
    constructor({position = {x:0 , y:0}, enemy}) {
        this.position = position
        this.velocity ={
            x:0,
            y:0
        }
        this.enemy = enemy
        
    }
    draw(){
        c.beginPath()
        c.arc(this.position.x , this.position.y , 10 , 0 , Math.PI *2 )
        c.fillStyle='orange'
        c.fill()
    }
    update(){
        this.draw()

        const angle = Math.atan2(
            enemies[0].center.y -this.position.y,
            enemies[0].center.x -this.position.x

        )
        this.velocity.x = Math.cos(angle)
        this.velocity.y = Math.sin(angle)

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}