import React, { FC, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import logo from "../../assets/img/logo.png";
import { setItem } from "../../utils/localStorage";
import turnOnButtonIcon from "../../assets/svg/turn-on.svg";
import { bootSystem } from "../../redux/reducers/SystemReducer";

interface ShutdownScreenProps {}

export const ShutdownScreen: FC<ShutdownScreenProps> = (props) => {
  const isShuttingDown = useSelector(
    (state: RootState) => state.system.isShuttingDown
  );
  const [isShutDown, setIsShutDown] = useState(false);
  const [isTurningOn, setIsTurningOn] = useState(false);
  const dispatch = useDispatch();

  const startShutdown = useCallback(() => {
    setTimeout(() => {
      setItem("computerStatus", 0);
      setIsShutDown(true);
    }, 3000);
  }, []);

  useEffect(() => {
    if (isShuttingDown) {
      startShutdown();
    }
  }, [isShuttingDown, startShutdown]);

  const turnOnComputer = useCallback(() => {
    setIsTurningOn(true);
    setIsShutDown(false);
    setItem("computerStatus", 1);

    setTimeout(() => {
      setIsTurningOn(false);
      dispatch(bootSystem());
    }, 3000);
  }, [dispatch]);

  return isShuttingDown ? (
    <div
      className={`computer-shutdown ${
        isShutDown && !isTurningOn ? "zoomedOut" : ""
      }`}
    >
      <div className="monitor">
        {!isShutDown && !isTurningOn && (
          <div className="shutdown-screen">
            <div className="logo-wrapper">
              <img src={logo} draggable={false} alt="ZutiOS logotype" />
            </div>
            <div className="shutdown-text">ZutiOS is shutting down</div>
          </div>
        )}
        {isTurningOn && (
          <div className="turn-on-screen">
            <div className="monitor-brand-text">GAZ</div>
          </div>
        )}
      </div>
      <div className="monitor-holder" />
      <div className="desk" />
      <div className="computer">
        <button className="turn-on-button" onClick={turnOnComputer}>
          <img
            className="icon"
            alt="Turn computer on button symbol"
            src={turnOnButtonIcon}
          />
        </button>
      </div>
    </div>
  ) : (
    <React.Fragment />
  );
};
