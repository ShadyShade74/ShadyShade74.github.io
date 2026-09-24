function getPolygon(shape) {
    if (shape.type === 'polygon') return shape.points;
    if (shape.type === 'rectangle') {
        return [
            { x: shape.x,               y: shape.y                },
            { x: shape.x + shape.width, y: shape.y                },
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: shape.x,               y: shape.y + shape.height }
        ];
    }
    if (shape.type === 'ellipse') {
        const SEG = 32;
        return Array.from({ length: SEG }, (_, i) => {
            const a = (i / SEG) * Math.PI * 2;
            return {
                x: shape.x + Math.cos(a) * shape.radiusX,
                y: shape.y + Math.sin(a) * shape.radiusY
            };
        });
    }
    return null;
}

function getAxes(points) {
    const axes = [];
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i], p2 = points[(i + 1) % points.length];
        const nx = -(p2.y - p1.y), ny = p2.x - p1.x;
        const len = Math.hypot(nx, ny);
        if (len > 0) axes.push({ x: nx / len, y: ny / len });
    }
    return axes;
}

function project(points, axis) {
    let min = Infinity, max = -Infinity;
    for (const p of points) {
        const dot = p.x * axis.x + p.y * axis.y;
        if (dot < min) min = dot;
        if (dot > max) max = dot;
    }
    return { min, max };
}

function overlaps(a, b) {
    return a.max >= b.min && b.max >= a.min;
}

function normalize(v) {
    const len = Math.hypot(v.x, v.y);
    return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: -1 };
}

function getCentroid(points) {
    return {
        x: points.reduce((s, p) => s + p.x, 0) / points.length,
        y: points.reduce((s, p) => s + p.y, 0) / points.length
    };
}

function closestPointOnSegment(point, start, end) {
    const ex = end.x - start.x, ey = end.y - start.y;
    const lenSq = ex * ex + ey * ey;
    const t = lenSq === 0 ? 0
        : Math.max(0, Math.min(1, ((point.x - start.x) * ex + (point.y - start.y) * ey) / lenSq));
    return { x: start.x + ex * t, y: start.y + ey * t };
}

function polygonNormal(circle, polygon) {
    let closestDist = Infinity, closestPoint = polygon[0];
    for (let i = 0; i < polygon.length; i++) {
        const pt = closestPointOnSegment(circle, polygon[i], polygon[(i + 1) % polygon.length]);
        const d = (pt.x - circle.x) ** 2 + (pt.y - circle.y) ** 2;
        if (d < closestDist) { closestDist = d; closestPoint = pt; }
    }
    return normalize({ x: circle.x - closestPoint.x, y: circle.y - closestPoint.y });
}

function circlePolygon(circle, polygon) {
    const axes = getAxes(polygon);
    let closest = polygon[0], minDist = Infinity;
    for (const p of polygon) {
        const d = (p.x - circle.x) ** 2 + (p.y - circle.y) ** 2;
        if (d < minDist) { minDist = d; closest = p; }
    }
    const dir = { x: closest.x - circle.x, y: closest.y - circle.y };
    const len = Math.hypot(dir.x, dir.y);
    if (len > 0) axes.push({ x: dir.x / len, y: dir.y / len });

    return axes.every(axis => {
        const dot = circle.x * axis.x + circle.y * axis.y;
        return overlaps({ min: dot - circle.radius, max: dot + circle.radius }, project(polygon, axis));
    });
}


export function checkCollision(a, b) {
    if (a.type === 'circle' && b.type === 'circle') {
        return Math.hypot(a.x - b.x, a.y - b.y) <= a.radius + b.radius;
    }

    const pa = getPolygon(a);
    const pb = getPolygon(b);


    if (a.type === 'circle' && pb) return circlePolygon(a, pb);

    if (b.type === 'circle' && pa) return circlePolygon(b, pa);

    if (pa && pb) {
        const axes = [...getAxes(pa), ...getAxes(pb)];
        return axes.every(axis => overlaps(project(pa, axis), project(pb, axis)));
    }

    return false;
}

export function getCollisionNormal(a, b) {

    if (a.type === 'circle' && b.type === 'circle') {
        return normalize({ x: a.x - b.x, y: a.y - b.y });
    }

    if (a.type === 'circle' && b.type === 'ellipse') {
        return normalize({
            x: (a.x - b.x) / (b.radiusX ** 2),
            y: (a.y - b.y) / (b.radiusY ** 2)
        });
    }

    if (a.type === 'ellipse' && b.type === 'circle') {
        return normalize({
            x: (a.x - b.x) / (a.radiusX ** 2),
            y: (a.y - b.y) / (a.radiusY ** 2)
        });
    }


    const pb = getPolygon(b);
    if (a.type === 'circle' && pb) return polygonNormal(a, pb);

 
    const pa = getPolygon(a);
    if (b.type === 'circle' && pa) {
        const n = polygonNormal(b, pa);
        return { x: -n.x, y: -n.y };
    }


    if (pa && pb) {
        const ca = getCentroid(pa);
        const cb = getCentroid(pb);
        return normalize({ x: ca.x - cb.x, y: ca.y - cb.y });
    }

    return normalize({ x: (a.x ?? 0) - (b.x ?? 0), y: (a.y ?? 0) - (b.y ?? 0) });
}