import * as React from 'react';
import classnames from 'classnames';
import FileSaver from 'file-saver';
import { useEventListener, useLocalStorage, useResizeObserver, Appear, Flex, TypeTheme } from 'preshape';
import { Data, TypeMode, IntersectionCircle, Intersection } from '../../Types';
import atan2 from '../../utils/math/atan2';
import isPointOverCircleEdge from '../../utils/math/isPointOverCircleEdge';
import EditorControls from './EditorControls';
import EditorDrawer from './EditorDrawer';
import EditorHistory from './EditorHistory';
import EditorToolbar from './EditorToolbar';
import { URLStateContext } from '../URLState/URLState';
import './Editor.css';

interface MinimalEvent {
  clientX: number;
  clientY: number;
  target: null | EventTarget;
  type: string;
}

type TypeEditorCursor =
  'default' |
  'crosshair' |
  'pointer' |
  'move' |
  'ns-resize' |
  'nesw-resize' |
  'ew-resize' |
  'nwse-resize';

interface ToolbarTarget {
  height: number;
  width: number;
  x: number;
  y: number;
}

const COPY_OFFSET = 25;
const TOLERANCE_CREATE_CIRCLE = 3;
const TOLERANCE_SELECT_CIRCLE = 3;

const CURSOR_DEFAULT: TypeEditorCursor = 'default';
const CURSOR_DRAW: TypeEditorCursor = 'crosshair';
const CURSOR_FILL: TypeEditorCursor = 'pointer';
const CURSOR_MOVE: TypeEditorCursor = 'move';
const CURSOR_RESIZE_T_B: TypeEditorCursor = 'ns-resize';
const CURSOR_RESIZE_BL_TR: TypeEditorCursor = 'nesw-resize';
const CURSOR_RESIZE_L_R: TypeEditorCursor = 'ew-resize';
const CURSOR_RESIZE_BR_TL: TypeEditorCursor = 'nwse-resize';

const onMouseDownGlobal = () => {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserDrag = 'none';
};

const onMouseUpGlobal = () => {
  delete document.body.style.userSelect;
  delete document.body.style.webkitUserDrag;
};


const minimalEvent = (event: React.TouchEvent | TouchEvent): MinimalEvent => ({
  clientX: event.touches[0]?.clientX,
  clientY: event.touches[0]?.clientY,
  target: event.target,
  type: event.type,
});


const getCursor = (px: number, py: number, cx: number, cy: number) => {
  const a = atan2(px, py, cx, cy) * 180 / Math.PI;

  if (a > 247.5 && a < 292.5) return CURSOR_RESIZE_T_B;
  if (a > 292.5 && a < 337.5) return CURSOR_RESIZE_BL_TR;
  if (a > 337.5 || a < 22.5) return CURSOR_RESIZE_L_R;
  if (a > 22.5 && a < 67.5) return CURSOR_RESIZE_BR_TL;
  if (a > 67.5 && a < 112.5) return CURSOR_RESIZE_T_B;
  if (a > 112.5 && a < 157.5) return CURSOR_RESIZE_BL_TR;
  if (a > 157.5 && a < 202.5) return CURSOR_RESIZE_L_R;
  if (a > 202.5 && a < 247.5) return CURSOR_RESIZE_BR_TL;

  return CURSOR_DRAW;
};

interface Props {
  data: Data;
  mode: TypeMode;
  onChangeMode: (mode: TypeMode) => void;
  onClearData: () => void;
}

export default (props: Props) => {
  const { data, mode, onChangeMode, onClearData } = props;
  const { debug } = React.useContext(URLStateContext);
  const [theme] = useLocalStorage<TypeTheme>('com.hogg.theme', 'day');
  const [toolbarTarget, setToolbarTarget] = React.useState<ToolbarTarget | null>(null);
  const refActiveCircle = React.useRef<IntersectionCircle | null>(null);
  const refActiveCirclePost = React.useRef<IntersectionCircle | null>(null);
  const [size, refBounds] = useResizeObserver();
  const [refContainer, setRefContainer] = React.useState<HTMLElement | null>(null);
  const refDraw = React.useRef<EditorDrawer>();
  const refHistory = React.useRef<EditorHistory>();
  const refIsAdding = React.useRef(false);
  const refIsMoving = React.useRef(false);
  const refIsPointerDown = React.useRef(false);
  const refIsResizing = React.useRef(false);
  const refPointerPosition = React.useRef<[number, number]>([-1, -1]);
  const [{ canUndo, canRedo }, setTimeState] = React.useState({ canUndo: false, canRedo: false });

  const classes = classnames('CircleArt__visual', `CircleArt__visual--mode-${mode}`);

  const setActiveCircle = (shape: null | IntersectionCircle) => {
    refActiveCircle.current = shape;
    refActiveCirclePost.current = shape && { ...shape };
  };

  const setCursor = (cursor: TypeEditorCursor) => {
    if (refContainer) {
      refContainer.style.cursor = cursor;
    }
  };

  const setToolbarTargetActiveShape = () => {
    if (refActiveCircle.current && refContainer && refDraw.current) {
      const { left, top } = refContainer.getBoundingClientRect();
      const { radius, x, y } = refDraw.current.transformCircleToWindow(refActiveCircle.current);

      setToolbarTarget({
        height: radius * 2,
        width: radius * 2,
        x: left + (x - radius),
        y: top + (y - radius),
      });
    }
  };

  const getRelativeCoordinates = ({ clientX, clientY }: MinimalEvent) => {
    if (refDraw.current) {
      if (refContainer) {
        const { left, top } = refContainer.getBoundingClientRect();
        return refDraw.current.transformCoordinatesToView(clientX - left, clientY - top);
      }

      return refDraw.current.transformCoordinatesToView(clientX, clientY);
    }

    return {
      x: clientX,
      y: clientY,
    };
  };

  const handleAddShape = (x: number, y: number, radius = TOLERANCE_CREATE_CIRCLE) => {
    if (refDraw.current) {
      const circle = refDraw.current.addCircle({ x, y, radius });

      if (circle) {
        setActiveCircle(circle);
      }
    }
  };

  const handleMoveActiveShape = (x: number, y: number) => {
    if (refActiveCircle.current && refActiveCirclePost.current) {
      refDraw.current?.setCircleProps({
        id: refActiveCircle.current.id,
        radius: refActiveCircle.current.radius,
        x: refActiveCirclePost.current.x + x,
        y: refActiveCirclePost.current.y + y,
      });
    }
  };

  const handleResizeActiveShape = (x: number, y: number) => {
    if (refActiveCircle.current) {
      refDraw.current?.setCircleProps({
        id: refActiveCircle.current.id,
        radius: Math.hypot(
          x - refActiveCircle.current.x,
          y - refActiveCircle.current.y,
        ),
        x: refActiveCircle.current.x,
        y: refActiveCircle.current.y,
      });
    }
  };

  const handleCopyActiveShape = () => {
    if (refActiveCircle.current) {
      handleAddShape(
        refActiveCircle.current.x + COPY_OFFSET,
        refActiveCircle.current.y + COPY_OFFSET,
        refActiveCircle.current.radius,
      );
    }
  };

  const handleRemoveActiveShape = () => {
    if (refActiveCircle.current) {
      const { id, radius, x, y } = refActiveCircle.current;

      if (id) {
        refDraw.current?.removeCircle(id);
        refActiveCircle.current = null;
        setToolbarTarget(null);
        refHistory.current?.push({
          redo: () => refDraw.current?.removeCircle(id),
          undo: () => refDraw.current?.addCircle({ id, radius, x, y }),
        });
      }
    }
  };

  const handleSelectIntersection = ({ id, filled }: Intersection) => {
    if (id) {
      refDraw.current?.setIntersectionProps({ id: id, filled: !filled });
      refHistory.current?.push({
        redo: () => refDraw.current?.setIntersectionProps({ id: id, filled: !filled }),
        undo: () => refDraw.current?.setIntersectionProps({ id, filled }),
      });
    }
  };

  const handlePushHistory = () => {
    if (refActiveCircle.current) {
      const { id, radius, x, y } = refActiveCircle.current;

      if (refIsAdding.current && id) {
        return refHistory.current?.push({
          redo: () => refDraw.current?.addCircle({ id, radius, x, y }),
          undo: () => refDraw.current?.removeCircle(id),
        });
      }

      if (refActiveCirclePost.current && (refIsMoving.current || refIsResizing.current)) {
        const {
          radius: radiusPost,
          x: xPost,
          y: yPost,
        } = refActiveCirclePost.current;

        return refHistory.current?.push({
          redo: () => refDraw.current?.setCircleProps({ id, radius, x, y }),
          undo: () => refDraw.current?.setCircleProps({ id: id, radius: radiusPost, x: xPost, y: yPost }),
        });
      }
    }
  };

  const handleMouseDown = (event: MinimalEvent) => {
    if (refDraw.current) {
      const { x, y } = getRelativeCoordinates(event);
      const circle = refDraw.current.getCircleAtCoordinates(x, y, TOLERANCE_SELECT_CIRCLE);

      refIsPointerDown.current = true;
      onMouseDownGlobal();
      setActiveCircle(circle);

      if (mode === 'draw') {
        refPointerPosition.current = [x, y];

        if (circle) {
          refActiveCircle.current = circle;

          if (isPointOverCircleEdge(x, y, circle.x, circle.y, circle.radius, TOLERANCE_SELECT_CIRCLE)) {
            refIsResizing.current = true;
          } else {
            refIsMoving.current = true;
          }
        }
      }
    }
  };

  const handlePointerDrag = (event: MinimalEvent) => {
    if (mode === 'draw') {
      const { x, y } = getRelativeCoordinates(event);
      const [startX, startY] = refPointerPosition.current;
      const deltaX = x - startX;
      const deltaY = y - startY;

      if (refActiveCircle.current) {
        setToolbarTarget(null);

        if (refIsResizing.current) {
          handleResizeActiveShape(x, y);
        } else {
          handleMoveActiveShape(deltaX, deltaY);
        }
      } else if (Math.hypot(deltaX, deltaY) > TOLERANCE_CREATE_CIRCLE) {
        handleAddShape(x, y);
        refIsAdding.current = true;
        refIsResizing.current = true;
      }
    }
  };

  const handleMouseMove = (event: MinimalEvent) => {
    if (refIsPointerDown.current) {
      return handlePointerDrag(event);
    }

    if (refDraw.current) {
      if (props.mode === 'draw') {
        const { x, y } = getRelativeCoordinates(event);
        const circle = refDraw.current.getCircleAtCoordinates(x, y, TOLERANCE_SELECT_CIRCLE);

        if (circle) {
          if (isPointOverCircleEdge(x, y, circle.x, circle.y, circle.radius, TOLERANCE_SELECT_CIRCLE)) {
            setCursor(getCursor(x, y, circle.x, circle.y));
          } else {
            setCursor(CURSOR_MOVE);
          }
        } else {
          setCursor(CURSOR_DRAW);
        }
      }

      if (mode === 'fill') {
        const intersection = refDraw.current.getIntersectionByDOMElement(event.target as Node) || null;

        if (intersection) {
          setCursor(CURSOR_FILL);
        } else {
          setCursor(CURSOR_DEFAULT);
        }
      }
    }
  };

  const handleMouseUp = (event: MinimalEvent) => {
    onMouseUpGlobal();

    if ((refIsResizing.current || refIsMoving.current)) {
      refDraw.current?.sortCircles();
    }

    handlePushHistory();

    refIsAdding.current = false;
    refIsPointerDown.current = false;
    refIsMoving.current = false;
    refIsResizing.current = false;

    if (!refContainer?.contains(event.target as Node)) {
      return setToolbarTarget(null);
    }

    if (mode === 'draw') {
      if (refActiveCircle.current) {
        setToolbarTargetActiveShape();
        setActiveCircle(refActiveCircle.current);
      } else {
        setToolbarTarget(null);
      }
    }

    if (mode === 'fill') {
      const intersection = refDraw.current?.getIntersectionByDOMElement(event.target as Node) || null;

      if (intersection) {
        handleSelectIntersection(intersection);
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    handleMouseUp(minimalEvent(event));

    if (refContainer?.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  const handleSave = () => {
    if (refDraw.current) {
      FileSaver.saveAs(
        new Blob([JSON.stringify(refDraw.current.getData(), null, 2)], { type: 'text/json;charset=utf-8' }),
        `CircleArt-export_${Date.now()}.json`);
    }
  };

  React.useLayoutEffect(() => {
    if (refContainer && !refDraw.current && !refHistory.current) {
      refHistory.current = new EditorHistory(setTimeState);
      refDraw.current = new EditorDrawer(refContainer);
      refDraw.current?.setSize(size);
      refDraw.current?.setData(data);
      refDraw.current?.setMode(mode);
      refDraw.current?.draw(debug);
    }
  }, [refContainer]);

  React.useEffect(() => {
    refDraw.current?.setSize(size);
    refDraw.current?.setMode(mode);
    refDraw.current?.draw(debug);
  }, [debug, mode, size]);

  React.useEffect(() => {
    refDraw.current?.setData(data);
    refDraw.current?.draw();
  }, [data]);

  React.useEffect(() => {
    refDraw.current?.draw(debug);
  }, [theme]);

  useEventListener(document, 'mouseup', handleMouseUp, [mode]);
  useEventListener(document, 'mousemove', handleMouseMove, [mode]);
  useEventListener(document, 'touchend', handleTouchEnd, [mode]);

  return (
    <Flex direction="vertical" grow>
      <Flex
          basis="none"
          container
          grow
          ref={ refBounds }>
        <Flex absolute="fullscreen">
          { !!size.height && !!size.width && (
            <Appear animation="Fade">
              <Flex
                  absolute="fullscreen"
                  className={ classes }
                  onMouseDown={ handleMouseDown }
                  onTouchMove={ (e) => handleMouseMove(minimalEvent(e)) }
                  onTouchStart={ (e) => handleMouseDown(minimalEvent(e)) }
                  ref={ (el) => setRefContainer(el as HTMLElement) } />
            </Appear>
          ) }
        </Flex>

        <EditorToolbar
            onCopy={ handleCopyActiveShape }
            onDelete={ handleRemoveActiveShape }
            targetRect={ toolbarTarget } />
      </Flex>

      <Flex>
        <EditorControls
            canRedo={ canRedo }
            canUndo={ canUndo }
            mode={ mode }
            onChangeMode={ onChangeMode }
            onClear={ onClearData }
            onRedo={ () => refHistory.current?.replay() }
            onSave={ handleSave }
            onUndo={ () => refHistory.current?.pop() } />
      </Flex>
    </Flex>
  );
};
