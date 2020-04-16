import Two from 'two.js';
import { v4 } from 'uuid';
import classnames from 'classnames';
import flatten from 'lodash.flatten';
import { colorAccent1Shade1, colorNegativeShade1, colorPositiveShade1 } from 'preshape';
import { Data, Intersection, IntersectionCircle, TypeMode } from '../../Types';
import isPointWithinCircle from '../../utils/math/isPointWithinCircle';
import { createCircle, createPolygonArc, createText } from '../../utils/Two';
import getCircleArea from '../../utils/math/getCircleArea';
import getIntersectionAreas from '../../utils/getIntersectionAreas/getIntersectionAreas';
import Area from '../../utils/getIntersectionAreas/Area';
import Circle from '../../utils/getIntersectionAreas/Circle';
import Vector from '../../utils/getIntersectionAreas/Vector';

const getIntersectionClassName = ({ filled, underlay }: Intersection) =>
  classnames('CircleArt__intersection', {
    'CircleArt__intersection--filled': filled,
    'CircleArt__intersection--unfilled': !filled,
    'CircleArt__intersection--underlay': underlay,
  });

export default class EditorDrawer {
  circles: IntersectionCircle[];
  data?: Data;
  intersections: Intersection[];
  layerDebug?: Two.Group;
  layerIntersections?: Two.Group;
  layerCircles?: Two.Group;
  mode?: TypeMode;
  paths: { [key: string]: Two.Circle | Two.Path };
  scale: number;
  two: Two;
  viewHeight: number;
  viewWidth: number;
  viewX: number;
  viewY: number;

  constructor(container: HTMLElement) {
    this.two = new Two({
      autostart: true,
      height: 0,
      type: Two.Types.svg,
      width: 0,
    }).appendTo(container);

    this.scale = 0;
    this.viewHeight = 0;
    this.viewWidth = 0;
    this.viewX = 0;
    this.viewY = 0;

    this.circles = [];
    this.intersections = [];
    this.paths = {};
  }

  setSize({ height, width }: { height: number; width: number}) {
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
    this.two.clear();

    this.setView();
  }

  setData(data: Data) {
    const { circles, intersections } = data;

    this.data = data;
    this.intersections = intersections;
    this.circles = circles;

    this.setView();
  }

  setView() {
    if (this.data) {
      const {
        height = this.two.height,
        width = this.two.width,
      } = this.data;

      this.scale = Math.min(this.two.width / width, this.two.height / height);
      this.viewHeight = height;
      this.viewWidth = width;
      this.viewX = (this.two.width - this.viewWidth * this.scale) / 2;
      this.viewY = (this.two.height - this.viewHeight * this.scale) / 2;

      this.two.renderer.domElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      this.two.renderer.domElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  }

  setMode(mode: TypeMode) {
    this.mode = mode;
  }

  transformCoordinatesToView(x: number, y: number): { x: number; y: number } {
    const scale = Math.min(this.two.width / this.viewWidth, this.two.height / this.viewHeight);
    const tx = (this.two.width - this.viewWidth * scale) / 2;
    const ty = (this.two.height - this.viewHeight * scale) / 2;

    return {
      x: (x - tx) / scale,
      y: (y - ty) / scale,
    };
  }

  transformCircleToWindow(circle: IntersectionCircle): IntersectionCircle {
    const { radius, x, y } = circle;
    const scale = Math.min(this.two.width / this.viewWidth, this.two.height / this.viewHeight);
    const tx = (this.two.width - this.viewWidth * scale) / 2;
    const ty = (this.two.height - this.viewHeight * scale) / 2;

    return {
      radius: radius * scale,
      x: (x * scale) + tx,
      y: (y * scale) + ty,
    };
  }

  removeLayers() {
    if (this.layerCircles) this.layerCircles.remove();
    if (this.layerIntersections) this.layerIntersections.remove();
    if (this.layerDebug) this.layerDebug.remove();
  }

  sortCircles() {
    this.circles.sort((a, b) => getCircleArea(b) - getCircleArea(a));
  }

  getData(): Data {
    return {
      circles: this.circles,
      intersections: this.intersections.map((intersection) => intersection.toObject()),
      height: this.viewHeight,
      width: this.viewWidth,
    };
  }

  getCircleAtCoordinates(x: number, y: number, padding: number) {
    if (this.circles){
      for (let i = this.circles.length - 1; i >= 0; i--) {
        const { x: cx, y: cy, radius } = this.circles[i];

        if (isPointWithinCircle(x, y, cx, cy, radius, padding)) {
          return this.circles[i];
        }
      }
    }

    return null;
  }

  getCircleByID(id: string) {
    return this.circles.find((circle) => circle.id === id);
  }

  getIntersectionByID(id: string) {
    return this.intersections.find((intersection) => intersection.id === id);
  }

  getIntersectionByDOMElement(element: Node) {
    return this.intersections.find((intersection) => intersection.id && this.paths[intersection.id]?._renderer.elem === element);
  }

  draw(debug?: boolean) {
    switch (this.mode) {
      case 'draw': return this.drawModeDraw();
      case 'fill': return this.drawModeFill(debug);
      case 'view': return this.drawModeView();
    }
  }

  drawModeDraw() {
    this.intersections = [];
    this.paths = {};
    this.removeLayers();
    this.drawCircles();
  }

  drawModeFill(debug?: boolean) {
    this.removeLayers();
    this.drawIntersections({ debug });
  }

  drawModeView() {
    this.removeLayers();
    this.drawIntersections();
  }

  drawCircles() {
    this.layerCircles = this.two.makeGroup();

    this.circles.forEach((circle) => {
      if (this.layerCircles && circle.id) {
        this.paths[circle.id] = createCircle(circle);
        this.layerCircles.add(this.paths[circle.id]);
      }
    });

    this.two.update();

    this.circles.forEach((circle) => {
      const path = circle.id && this.paths[circle.id];

      if (path) {
        path._renderer.elem.setAttribute('class', 'CircleArt__shape');
      }
    });
  }

  drawIntersections({ debug }: { debug?: boolean } = {}) {
    const { areas, circles, vectors } = getIntersectionAreas(this.circles);

    if (!this.intersections.length) {
      this.intersections = areas;
    }

    this.layerIntersections = this.two.makeGroup();

    this.intersections.forEach((intersection) => {
      if (this.layerIntersections && intersection.id) {
        this.paths[intersection.id] = intersection.isCircle
          ? createCircle(intersection)
          : createPolygonArc(intersection);
        this.layerIntersections.add(this.paths[intersection.id]);
      }
    });

    this.two.update();

    this.intersections.forEach((intersection) => {
      const path = intersection.id && this.paths[intersection.id];

      if (path) {
        path._renderer.elem.setAttribute('class', getIntersectionClassName(intersection));
      }
    });

    if (debug) {
      this.drawDebug(areas, circles, vectors);
    }
  }

  drawDebug(areas: Area[], circles: Circle[], vectors: Vector[]) {

    /* eslint-disable no-console */
    console.log(circles);
    console.info(`Areas: ${areas.length}`);
    console.info(`Circles: ${circles.length}`);
    console.info(`Vectors: ${vectors.length}`);
    console.info(areas);
    console.info(circles);
    console.info(vectors);
    /* eslint-enable no-console */

    this.layerDebug = this.two.makeGroup();

    /* Debug areas */
    this.layerDebug.add(...areas.map((area) => area.isCircle
      ? createCircle({ ...area, fill: colorPositiveShade1, opacity: 0.1 })
      : createPolygonArc({ ...area, fill: colorPositiveShade1, opacity: 0.1 })));

    this.layerDebug.add(...areas.map((area) => area.isCircle
      ? createCircle({ ...area, stroke: colorPositiveShade1, strokeWidth: 1 })
      : createPolygonArc({ ...area, stroke: colorPositiveShade1, strokeWidth: 1 })));

    /* Debug Circles */
    this.layerDebug.add(...flatten(
      circles.map(({ n, segments, x, y }) => [
        createText(n, {
          alignment: 'middle',
          fill: colorNegativeShade1,
          family: 'script',
          size: 8,
          style: 'italic',
          x: x,
          y: y,
        }),
        ...segments.map(({ mx, my }) => createCircle({
          fill: colorNegativeShade1,
          radius: 2,
          x: mx,
          y: my,
        })),
        ...segments.map(({ mx, my, n }) => createText(n, {
          alignment: 'middle',
          family: 'script',
          fill: colorNegativeShade1,
          size: 8,
          style: 'italic',
          x: mx,
          y: my - 10,
        })),
      ]),
    ));

    /* Debug Vectors */
    this.layerDebug.add(...flatten(
      vectors.map(({ n, x, y }) => [
        createCircle({
          fill: colorAccent1Shade1,
          radius: 2,
          x: x,
          y: y,
        }),
        createText(n, {
          alignment: 'middle',
          fill: colorAccent1Shade1,
          family: 'script',
          size: 8,
          style: 'italic',
          x: x,
          y: y - 10,
        }),
      ]),
    ));
  }

  addCircle({ id = v4(), radius, x, y }: IntersectionCircle) {
    if (this.layerCircles) {
      const path = createCircle({ radius, x, y });
      const circle = { id, radius, x, y };

      this.paths[id] = path;
      this.layerCircles.add(path);
      this.two.update();
      path._renderer.elem.setAttribute('class', 'CircleArt__shape');
      this.circles.push(circle);

      return circle;
    }
  }

  removeCircle(id: string) {
    const path = this.paths[id];

    if (path) {
      path.remove();
      this.circles = this.circles.filter((circle) => circle.id !== id);
    }
  }

  setCircleProps({ id, radius, x, y }: IntersectionCircle) {
    const circle = id && this.getCircleByID(id);
    const path = id && this.paths[id];

    if (circle && path && radius) {
      circle.radius = radius;
      circle.x = x;
      circle.y = y;
      path.radius = radius;
      path.translation.set(x, y);
    }
  }

  setIntersectionProps({ id, filled }: { id: string; filled?: boolean }) {
    const intersection = this.getIntersectionByID(id);
    const path = this.paths[id];

    if (intersection && path) {
      intersection.filled = filled;
      path._renderer.elem.setAttribute('class', getIntersectionClassName(intersection));
    }

  }
}
