import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { WindowTitleButton } from "./DraggableWindow";
interface ModalProps {
  title: string;
  content: ReactNode;
  onClose: () => void;
  visible: boolean;
  parentSize?: { width: number; height: number };
}

export const Modal: FC<ModalProps> = ({
  visible,
  title,
  content,
  onClose,
  parentSize,
}) => {
  const [modalSize, setModalSize] = useState<{
    height: number;
    width: number;
  }>();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setModalSize({ width, height });
      }
    });

    resizeObserver.observe(modalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="program framed"
      ref={modalRef}
      style={{
        display: visible && modalSize ? "initial" : "none",
        left:
          modalSize?.width && parentSize?.width
            ? parentSize.width / 2 - modalSize.width / 2
            : (parentSize?.width ?? 0) / 2,
        top:
          modalSize?.height && parentSize?.height
            ? parentSize.height / 2 - modalSize?.height / 2
            : (parentSize?.height ?? 0) / 2,
      }}
    >
      <div className="window-title">
        <div className="window-title-name-wrapper">{title}</div>
        <div className="window-title-buttons-wrapper">
          <WindowTitleButton
            type="close"
            onClick={useCallback(() => {
              onClose();
            }, [onClose])}
          />
        </div>
      </div>
      {content}
    </div>
  );
};
