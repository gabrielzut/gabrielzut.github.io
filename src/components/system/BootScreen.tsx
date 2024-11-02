import { FC, useCallback, useEffect, useRef, useState } from "react";
import logo from "../../assets/img/logo.png";
import { Loading } from "../../components/general/Loading";
import { hideBootScreen } from "../../redux/reducers/SystemReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { getItem, setItem } from "../../utils/localStorage";

interface BootScreenProps {}

export const BootScreen: FC<BootScreenProps> = () => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const { bootScreenVisible, isShuttingDown } = useSelector(
    (state: RootState) => state.system
  );
  const interval = useRef<NodeJS.Timer>();
  const firstRender = useRef(true);

  const startBoot = useCallback(() => {
    let count = 0;

    interval.current = setInterval(() => {
      setProgress(count * 20);

      if (count === 5) {
        dispatch(hideBootScreen());
        setItem("computerStatus", 2);
      }
      count++;
    }, 1000);
  }, [dispatch]);

  useEffect(() => {
    if (
      bootScreenVisible &&
      !firstRender.current &&
      getItem("computerStatus") !== 2
    ) {
      startBoot();
    }
    firstRender.current = false;
  }, [bootScreenVisible, startBoot]);

  useEffect(() => {
    if (!bootScreenVisible && interval.current) clearInterval(interval.current);
    else {
      setProgress(0);
    }
  }, [bootScreenVisible]);

  useEffect(() => {
    if (isShuttingDown) setProgress(0);
  }, [isShuttingDown]);

  return (
    <div className={`boot-screen ${bootScreenVisible ? "" : "hidden"}`}>
      <div className="logo-wrapper">
        <img src={logo} draggable={false} alt="ZutiOS logotype" />
      </div>
      <div className="loading-wrapper">
        <Loading type="boot" progress={progress} />
      </div>
    </div>
  );
};
