import { Entity } from '../entity.js';
export class Rock extends Entity {
    constructor(x, y, scale = 1) {
        const size = Math.round(64 * scale);
        super(x, y, size, size, {
            sprite: './assets/enviroment/rocks.png',
            color: '#64748b',
            isStatic: true,
            bottomOffset: Math.round(size * 0.18)
        });
    }
}
export class Boulder extends Entity {
    constructor(x, y, scale = 1) {
        const size = Math.round(200 * scale);
        super(x, y, size, size, {
            sprite: './assets/enviroment/boulder.png',
            color: '#475569',
            isStatic: true,
            bottomOffset: Math.round(size * 0.15)
        });
    }
}