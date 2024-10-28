import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import closeButton from "../../assets/img/closebtn.png";
import maximizeButton from "../../assets/img/maximizebtn.png";
import maximizeOffButton from "../../assets/img/maximizeoffbtn.png";
import minimizeButton from "../../assets/img/minimizebtn.png";
import { useDispatch } from "react-redux";
import { closeProgram } from "../../redux/reducers/ProcessManagerReducer";

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
          console.log(event.clientX, event.clientY);
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
          width: resizeDirection?.includes("right")
            ? event.clientX - position.x
            : size.width,
          height: resizeDirection?.includes("bottom")
            ? event.clientY - position.y
            : size.height,
        });
      }
    },
    [
      isDragging,
      isMaximized,
      isResizing,
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

  return (
    <div
      className={className}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 32 : position.y,
        width: isMaximized ? window.innerWidth : size.width,
        height: isMaximized ? window.innerHeight - 32 : size.height,
      }}
    >
      <div onMouseDown={handleMouseDown} className="window-title">
        {windowName}
        <div className="window-title-buttons-wrapper">
          <WindowTitleButton
            type="minimize"
            onClick={useCallback(() => {}, [])}
          />
          <WindowTitleButton
            type="maximize"
            onClick={useCallback(() => {
              if (isMaximized) setPosition({ x: defaultX, y: defaultY });
              setIsMaximized(!isMaximized);
            }, [defaultX, defaultY, isMaximized])}
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
      {children}
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
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "20px",
          height: "20px",
          cursor: "se-resize",
        }}
      />
    </div>
  );
};

export default DraggableWindow;
