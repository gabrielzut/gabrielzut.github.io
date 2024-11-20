import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import closeButton from "../../assets/img/closebtn.png";
import maximizeButton from "../../assets/img/maximizebtn.png";
import maximizeOffButton from "../../assets/img/maximizeoffbtn.png";
import minimizeButton from "../../assets/img/minimizebtn.png";
import { useDispatch, useSelector } from "react-redux";
import {
  closeProgram,
  incrementZIndex,
  minimizeProgram,
} from "../../redux/reducers/ProcessManagerReducer";
import { RootState } from "../../redux";

interface DraggableWindowProps {
  children: ReactNode;
  windowId: string;
  className?: string;
  windowName?: string;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultMaximized?: boolean;
  isMinimized?: boolean;
  icon?: string;
  minWidth?: number;
  minHeight?: number;
  childProps?: { [key: string]: any };
}

interface WindowTitleButtonProps {
  type: "close" | "maximize" | "minimize";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isMaximized?: boolean;
}

export const WindowTitleButton: React.FC<WindowTitleButtonProps> = ({
  type,
  onClick,
  isMaximized = false,
}) => {
  const image = useMemo(() => {
    if (type === "close") return closeButton;
    if (type === "maximize")
      return isMaximized ? maximizeOffButton : maximizeButton;
    return minimizeButton;
  }, [isMaximized, type]);

  return (
    <button onClick={onClick} className="window-title-button">
      <img src={image} draggable={false} alt={`${type} window button`} />
    </button>
  );
};

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  children,
  className,
  windowName,
  windowId,
  defaultX = 0,
  defaultY = 0,
  defaultWidth = 300,
  defaultHeight = 300,
  defaultMaximized = false,
  isMinimized = false,
  icon,
  minWidth = 200,
  minHeight = 200,
  childProps = {},
}) => {
  const [position, setPosition] = useState({
    x: defaultX,
    y: defaultY,
  });
  const [size, setSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(defaultMaximized);
  const dispatch = useDispatch();
  const currentZIndex = useSelector(
    (state: RootState) => state.processManager.currentZIndex
  );
  const firstRender = useRef(true);
  const [zIndex, setZIndex] = useState(currentZIndex);
  const isActiveWindow = useMemo(
    () => zIndex === currentZIndex - 1,
    [currentZIndex, zIndex]
  );
  const wasMinimized = useRef(false);

  useEffect(() => {
    if (firstRender.current) {
      dispatch(incrementZIndex());
      firstRender.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (wasMinimized.current && !isMinimized && !isActiveWindow) {
      setZIndex(currentZIndex);
      dispatch(incrementZIndex());
    }
  }, [currentZIndex, dispatch, isActiveWindow, isMinimized]);

  useEffect(() => {
    if (isMinimized) {
      wasMinimized.current = true;
    } else {
      wasMinimized.current = false;
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!isMaximized && position.y < 42) setIsMaximized(true);
  }, [isMaximized, position.y]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      setOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        if (isMaximized) {
          setOffset({ x: size.width / 2, y: 0 });
          setPosition({ x: event.clientX, y: event.clientY });
          setIsMaximized(false);
        } else {
          setPosition({
            x: event.clientX - offset.x,
            y: event.clientY - offset.y,
          });
        }
      }

      if (isResizing) {
        setSize({
          width:
            resizeDirection?.includes("right") &&
            event.clientX - position.x >= minWidth
              ? event.clientX - position.x
              : size.width,
          height:
            resizeDirection?.includes("bottom") &&
            event.clientY - position.y >= minHeight
              ? event.clientY - position.y
              : size.height,
        });
      }
    },
    [
      isDragging,
      isMaximized,
      isResizing,
      minHeight,
      minWidth,
      offset,
      position,
      resizeDirection,
      size,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  const handleResizeStart = useCallback(
    (_: React.MouseEvent<HTMLDivElement>, direction: string) => {
      setIsResizing(true);
      setResizeDirection(direction);
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    offset,
    resizeDirection,
    position,
    handleMouseMove,
    handleMouseUp,
  ]);

  const handleToggleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition({ x: defaultX, y: defaultY });
      setSize({ width: defaultWidth, height: defaultHeight });
    }
    setIsMaximized(!isMaximized);
  }, [defaultHeight, defaultWidth, defaultX, defaultY, isMaximized]);

  const handleChangeActiveWindow = useCallback(() => {
    if (isActiveWindow) return;
    else {
      setZIndex(currentZIndex);
      dispatch(incrementZIndex());
    }
  }, [currentZIndex, dispatch, isActiveWindow]);

  return (
    <div
      className={`${className} ${isMaximized ? "maximized" : ""}`}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 42 : position.y,
        width: isMaximized ? window.innerWidth : size.width,
        height: isMaximized ? window.innerHeight - 42 : size.height,
        display: isMinimized ? "none" : "flex",
        zIndex,
      }}
      onMouseDown={handleChangeActiveWindow}
    >
      <div
        onMouseDown={handleMouseDown}
        className={`window-title ${isDragging ? "dragging" : ""}`}
      >
        <div
          className="window-title-name-wrapper"
          onDoubleClick={handleToggleMaximize}
        >
          <img
            src={icon}
            className="window-title-icon"
            draggable={false}
            alt={`${windowName} window title icon`}
          />
          {windowName}
        </div>
        <div className="window-title-buttons-wrapper">
          <WindowTitleButton
            type="minimize"
            onClick={useCallback(() => {
              dispatch(minimizeProgram(windowId));
            }, [dispatch, windowId])}
          />
          <WindowTitleButton
            type="maximize"
            onClick={handleToggleMaximize}
            isMaximized={isMaximized}
          />
          <WindowTitleButton
            type="close"
            onClick={useCallback(() => {
              dispatch(closeProgram(windowId));
            }, [dispatch, windowId])}
          />
        </div>
      </div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement<any>(child, {
            ...childProps,
            uid: windowId,
          });
        }
        return child;
      })}
      <div
        onMouseDown={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) =>
            handleResizeStart(e, "right"),
          [handleResizeStart]
        )}
        className="draggable-right"
      />
      <div
        onMouseDown={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) =>
            handleResizeStart(e, "bottom"),
          [handleResizeStart]
        )}
        className="draggable-bottom"
      />
      <div
        onMouseDown={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) =>
            handleResizeStart(e, "bottom-right"),
          [handleResizeStart]
        )}
        className="draggable-bottom-right"
      />
    </div>
  );
};

export default DraggableWindow;
