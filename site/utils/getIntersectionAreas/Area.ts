import { v4 } from 'uuid';
import mean from 'lodash.mean';
import { Intersection } from '../../Types';
import Arc from './Arc';

export default class Area {
  arcs: Arc[];
  filled: boolean;
  id: string;
  isCircle: boolean;
  x: number;
  y: number;

  constructor(arcs: Arc[]) {
    this.arcs = arcs;
    this.filled = false;
    this.id = v4();
    this.isCircle = false;
    this.x = mean(arcs.map(({ mx }) => mx));
    this.y = mean(arcs.map(({ my }) => my));
  }

  get area() {
    let areaPolygon = 0;
    let areaSegment = 0;

    for (let i = 0; i < this.arcs.length; i++) {
      const a = this.arcs[i];
      const b = this.arcs[i + 1] || this.arcs[0];

      areaSegment += a.area * ((a.isConvex(this.arcs) ? 1 : -1));
      areaPolygon += (a.start.x * b.start.y) - (a.start.y * b.start.x);
    }

    return Math.abs(areaPolygon / 2) + areaSegment;
  }

  toObject(): Intersection {
    return {
      arcs: this.arcs.map((arc) => arc.toObject()),
      filled: this.filled,
      id: this.id,
      isCircle: false,
      radius: -1,
      x: this.x,
      y: this.y,
    };
  }
}
