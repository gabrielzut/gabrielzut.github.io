import React, { ReactNode, useCallback, useState } from "react";

interface DraggableWindowProps {
  children: ReactNode;
  className?: string;
  windowName?: string;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  children,
  className,
  windowName,
  defaultX = 0,
  defaultY = 0,
  defaultWidth = 300,
  defaultHeight = 300,
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
        setPosition({
          x: event.clientX - offset.x,
          y: event.clientY - offset.y,
        });
      }
    },
    [isDragging, offset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={className}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <div className="window-title">{windowName}</div>
      {children}
    </div>
  );
};

export default DraggableWindow;
