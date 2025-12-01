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
    }

    draw(){
        c.fillStyle='red'
        c.fillRect(this.position.x , this.position.y , this.width , this.height)
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
    constructor({ position = { x: 0, y: 0 }, xIndex = 0, yIndex = 0 }) {
        this.position = position;
        this.gridX = xIndex;
        this.gridY = yIndex;
        this.size = 64;
        this.color = 'rgba(255,255,255,0.2)';
        this.occupied = false;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    isHovered(mouse) {
        return mouse.x > this.position.x &&
               mouse.x < this.position.x + this.size &&
               mouse.y > this.position.y &&
               mouse.y < this.position.y + this.size;
    }

    update(highlight) {
        this.color = highlight
            ? 'rgba(255,255,255,0.3)'
            : 'rgba(255,255,255,0.15)';

        this.draw();
    }
}

class Building {
    constructor({position = {x:0 , y:0} }) {
        this.position = position
        this.width = 128
        this.height = 128
    }
    
    draw(){
        c.fillStyle='blue'
        c.fillRect(this.position.x , this.position.y , this.width , this.height)
    }
}
