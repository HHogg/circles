import { v4 } from 'uuid';
import floor from 'lodash.floor';
import { Intersection, IntersectionCircle } from '../../Types';
import getCircleArea from '../../utils/math/getCircleArea';
import isPointWithinCircle from '../../utils/math/isPointWithinCircle';
import Arc from './Arc';
import CircleSegment from './CircleSegment';
import Vector from './Vector';

const precise = (n: number) => floor(n, 5);

export default class Circle {
  arcs: Arc[];
  area: number;
  filled: boolean;
  id: string;
  isCircle: boolean;
  n: number;
  radius: number;
  segments: CircleSegment[];
  vectors: Vector[];
  x: number;
  y: number;


  constructor(circle: IntersectionCircle, n: number) {
    this.filled = false;
    this.isCircle = true;

    this.arcs = [];
    this.vectors = [];
    this.segments = [];

    this.id = v4();
    this.n = n;
    this.x = precise(circle.x);
    this.y = precise(circle.y);
    this.radius = precise(circle.radius);
    this.area = getCircleArea(circle);
  }

  addVector(vector: Vector) {
    if (!this.vectors.some((v) => vector === v)) {
      this.vectors.push(vector);
      this.vectors.sort((a, b) => a.getAngle(this) - b.getAngle(this));
      this.segments = this.vectors.map((vector, i) =>
        new CircleSegment(vector, this.vectors[i + 1] || this.vectors[0], this)
      );
    }
  }

  getConnections(vector: Vector) {
    const i = this.segments.findIndex(({ start }) => start === vector);

    return [
      new Arc(this.segments[i ? i - 1 : this.segments.length - 1], -1),
      new Arc(this.segments[i], 1),
    ];
  }

  isPointWithinCircle(x: number, y: number) {
    return isPointWithinCircle(x, y, this.x, this.y, this.radius);
  }

  toObject(): Intersection {
    return {
      arcs: [],
      filled: this.filled,
      id: this.id,
      isCircle: true,
      radius: this.radius,
      underlay: this.segments.length > 0,
      x: this.x,
      y: this.y,
    };
  }
}
