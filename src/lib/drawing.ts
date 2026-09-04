import type { DrawingPoint } from "./persistence/types";

/** Keep long freehand strokes cheap without changing their endpoints. */
export function reduceStroke(points: DrawingPoint[], maxPoints = 256): DrawingPoint[] {
  if (points.length <= maxPoints || maxPoints < 2) return points;
  const reduced: DrawingPoint[] = [];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let index = 0; index < maxPoints; index += 1) {
    const point = points[Math.round(index * step)];
    if (point && reduced[reduced.length - 1] !== point) reduced.push(point);
  }
  return reduced;
}
