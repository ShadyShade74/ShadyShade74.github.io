import { Entity } from '../entity.js';


const DEFS = {

    rock: {
        sprite:       './assets/enviroment/rocks.png',
        baseSize:     64,
        color:        '#64748b',
        bottomOffset: 0.18,
        colliders: [
            { type: 'ellipse', cx: 0.50, cy: 0.73, rx: 0.28, ry: 0.15 }
        ]
    },

    boulder: {
        sprite:       './assets/enviroment/boulder.png',
        baseSize:     200,
        color:        '#475569',
        bottomOffset: 0.15,
        colliders: [
            { type: 'ellipse', cx: 0.53, cy: 0.72, rx: 0.47, ry: 0.14 },  
            { type: 'circle',  cx: 0.19, cy: 0.74, r:  0.11 },             
            { type: 'circle',  cx: 0.86, cy: 0.74, r:  0.12 }              
        ]
    },
};


class WorldObject extends Entity {
    constructor(x, y, type, scale = 1) {
        const def = DEFS[type];
        if (!def) throw new Error(`[WorldObject] Nieznany typ: "${type}"`);

        const size = Math.round(def.baseSize * scale);

        super(x, y, size, size, {
            sprite:       def.sprite,
            color:        def.color  ?? '#888888',
            isStatic:     true,
            isSolid:      def.isSolid ?? true,
            bottomOffset: Math.round(size * (def.bottomOffset ?? 0))
        });

        this._colliders = (def.colliders ?? []).map(c => {
            const base = {
                offsetX: Math.round(size * c.cx),
                offsetY: Math.round(size * c.cy)
            };
            if (c.type === 'ellipse')   return { ...base, type: 'ellipse',    radiusX: Math.round(size * c.rx), radiusY: Math.round(size * c.ry) };
            if (c.type === 'circle')    return { ...base, type: 'circle',     radius:  Math.round(size * c.r)  };
            if (c.type === 'rectangle') return { ...base, type: 'rectangle',  width:   Math.round(size * c.w),  height: Math.round(size * c.h)  };
            return c;
        });
    }


    get colliders() {
        return this._colliders.map(c => {
            const wx = this.x + c.offsetX;
            const wy = this.y + c.offsetY;
            if (c.type === 'ellipse')   return { type: 'ellipse',   x: wx, y: wy, radiusX: c.radiusX, radiusY: c.radiusY };
            if (c.type === 'circle')    return { type: 'circle',    x: wx, y: wy, radius:  c.radius   };
            if (c.type === 'rectangle') return { type: 'rectangle', x: wx, y: wy, width:   c.width, height: c.height };
            return c;
        });
    }

    get collider() { return this.colliders[0] ?? null; }
}



export class Rock    extends WorldObject { constructor(x, y, scale = 1) { super(x, y, 'rock',    scale); } }
export class Boulder extends WorldObject { constructor(x, y, scale = 1) { super(x, y, 'boulder', scale); } }
export class Grass   extends WorldObject { constructor(x, y, scale = 1) { super(x, y, 'grass',   scale); } }
