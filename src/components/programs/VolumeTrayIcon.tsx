import { FC, useMemo } from "react";
import { RootState } from "../../redux";
import { useSelector } from "react-redux";
import highVolumeIcon from "../../assets/img/volume-high.gif";
import lowVolumeIcon from "../../assets/img/volume-low.png";
import muteVolumeIcon from "../../assets/img/volume-mute.png";

interface VolumeTrayIconProps {}

export const VolumeTrayIcon: FC<VolumeTrayIconProps> = (props) => {
  const volume = useSelector((state: RootState) => state.system.volume);

  const volumeIcon = useMemo(() => {
    if (volume > 60) return highVolumeIcon;
    if (volume !== 0) return lowVolumeIcon;
    return muteVolumeIcon;
  }, [volume]);

  return (
    <button>
      <img
        src={volumeIcon}
        className="volume-tray"
        draggable={false}
        alt={`Volume at ${volume}%`}
      />
    </button>
  );
};
