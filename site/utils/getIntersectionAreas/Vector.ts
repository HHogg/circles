import atan2 from '../../utils/math/atan2';
import Circle from './Circle';

export default class Vector {
  angle1: number;
  angle2: number;
  circle1: Circle;
  circle2: Circle;
  n: number;
  x: number;
  y: number;

  constructor([x, y]: [number, number], circle1: Circle, circle2: Circle, n: number) {
    this.n = n;
    this.x = x;
    this.y = y;

    this.circle1 = circle1;
    this.circle2 = circle2;

    this.angle1 = atan2(x, y, circle1.x, circle1.y);
    this.angle2 = atan2(x, y, circle2.x, circle2.y);
  }

  getAngle(circle: Circle) {
    if (this.circle1 === circle) return this.angle1;
    if (this.circle2 === circle) return this.angle2;

    return 0;
  }

  getConnections() {
    return [
      ...this.circle1.getConnections(this),
      ...this.circle2.getConnections(this),
    ];
  }

  getOtherCircle(circle: Circle) {
    return this.circle1 === circle ? this.circle2 : this.circle1;
  }
}
