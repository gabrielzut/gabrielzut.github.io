import { FC, useCallback, useEffect, useRef, useState } from "react";
import myPortfolioLogo from "../../assets/img/myportfoliologo.jpg";
import { showBootScreen } from "../../redux/reducers/SystemReducer";
import { useDispatch, useSelector } from "react-redux";
import { getItem } from "../../utils/localStorage";
import { RootState } from "../../redux";

interface BiosScreenProps {}

export const BiosScreen: FC<BiosScreenProps> = () => {
  const [secondsToBoot, setSecondsToBoot] = useState(10);
  const interval = useRef<NodeJS.Timer>();
  const [visible, setVisible] = useState(getItem("computerStatus") !== 2);
  const isShuttingDown = useSelector(
    (state: RootState) => state.system.isShuttingDown
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRender = useRef(true);
  const dispatch = useDispatch();

  const handleGoToBoot = useCallback(() => {
    setVisible(false);
    dispatch(showBootScreen());
    clearInterval(interval.current);
    interval.current = undefined;
    setSecondsToBoot(10);
  }, [dispatch]);

  const startBoot = useCallback(() => {
    let count = 10;

    if (getItem("computerStatus") === 1) {
      setVisible(true);
      setFocusedIndex(0);
    }

    if (!interval.current) {
      interval.current = setInterval(() => {
        setSecondsToBoot(count - 1);

        if (count === 0) {
          handleGoToBoot();
        }
        count--;
      }, 1000);
    }
  }, [handleGoToBoot]);

  useEffect(() => {
    if (
      !isShuttingDown &&
      !firstRender.current &&
      getItem("computerStatus") !== 2
    ) {
      startBoot();
    }
    firstRender.current = false;
  }, [isShuttingDown, startBoot]);

  const handleGlobalKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prevIndex) => (prevIndex + 1) % 3);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prevIndex) => (prevIndex === 0 ? 2 : prevIndex - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleGoToBoot();
      }
    },
    [handleGoToBoot]
  );

  useEffect(() => {
    if (!visible) {
      window.removeEventListener("keydown", handleGlobalKeyDown as any);
    } else {
      buttonRefs.current[0]?.focus();
      window.addEventListener("keydown", handleGlobalKeyDown as any);
    }
  }, [handleGlobalKeyDown, visible]);

  useEffect(() => {
    buttonRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <div className="bios-screen" style={{ display: visible ? "flex" : "none" }}>
      <div className="upper-text">
        <p>gabrielzut.github.io</p>
        <p>Copyright (C) 2024, gabrielzut</p>
        <p>The most advanced BIOS in the web</p>
      </div>
      <div className="boot-manager">
        <center>
          <p>BOOT MANAGER</p>
        </center>
        <div className="boot-options">
          <button
            ref={useCallback(
              (ref: HTMLButtonElement | null) => (buttonRefs.current[0] = ref),
              []
            )}
            onClick={handleGoToBoot}
          >
            ZutiOS 98 in (/dev/sda1)
          </button>
          <button
            ref={useCallback(
              (ref: HTMLButtonElement | null) => (buttonRefs.current[1] = ref),
              []
            )}
            onClick={handleGoToBoot}
          >
            ZutiOS 98 (advanced options)
          </button>
          <button
            ref={useCallback(
              (ref: HTMLButtonElement | null) => (buttonRefs.current[2] = ref),
              []
            )}
            onClick={handleGoToBoot}
          >
            Memory test
          </button>
        </div>
        <p>
          Use the ↑ and ↓ keys to navigate between options. Booting in{" "}
          {secondsToBoot} seconds.
        </p>
      </div>
      <img src={myPortfolioLogo} alt="My portfolio logotype" />
    </div>
  );
};
