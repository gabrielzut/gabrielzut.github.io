import React, { EventHandler, useEffect } from "react";
import { FC, useCallback, useState } from "react";

interface DropDownOption {
  name: string;
  onClick?: () => void;
  isBlocked?: boolean;
}

interface DropDownProps {
  dropdownOptions: DropDownOption[];
}

const DropDown: FC<DropDownProps> = ({ dropdownOptions }) => {
  return (
    <div className="dropdown">
      {dropdownOptions.map((option) => (
        <button
          className={`dropdown-option ${option.isBlocked ? "blocked" : ""}`}
          key={`option-${option.name}`}
          onClick={option.isBlocked ? undefined : option.onClick}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};

interface WindowOptionProps {
  name: string;
  dropdownOptions?: DropDownOption[];
  onClick: () => void;
  isBlocked?: boolean;
  onMouseEnter: () => void;
  isOpen: boolean;
}

export const WindowOption: FC<WindowOptionProps> = ({
  name,
  dropdownOptions,
  onClick,
  isBlocked = false,
  onMouseEnter,
  isOpen,
}) => {
  return (
    <div
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      className={`window-option ${isOpen ? "expanded" : ""}`}
    >
      <button
        className={`window-option-button ${isBlocked ? "blocked" : ""}`}
        onClick={onClick}
      >
        {name}
      </button>
      {dropdownOptions && dropdownOptions.length && isOpen && (
        <DropDown dropdownOptions={dropdownOptions} />
      )}
    </div>
  );
};

type WindowOptionsArrayItem = Omit<
  WindowOptionProps,
  "onMouseEnter" | "isOpen" | "onClick"
> & {
  onClick?: () => void;
};

interface WindowOptionsProps {
  options: WindowOptionsArrayItem[];
}

export const WindowOptions: FC<WindowOptionsProps> = ({ options }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleOptionClick = useCallback((optionName: string) => {
    setOpenDropdown((prev) => (prev === optionName ? null : optionName));
  }, []);

  const handleMouseEnter = useCallback(
    (optionName: string) => {
      if (openDropdown) setOpenDropdown(optionName);
    },
    [openDropdown]
  );

  useEffect(() => {
    const handleClickOutside = (e: React.MouseEvent) => {
      setOpenDropdown(null);
      if ((e.target as Element)?.className?.startsWith("dropdown-option")) {
        (e.target as HTMLButtonElement).click();
      }
    };
    document.addEventListener(
      "mousedown",
      handleClickOutside as EventHandler<any>
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventHandler<any>
      );
  }, []);

  return (
    <div className="window-options">
      {options.map((option) => (
        <WindowOption
          {...option}
          key={option.name}
          onClick={() => option.onClick || handleOptionClick(option.name)}
          onMouseEnter={() => handleMouseEnter(option.name)}
          isOpen={openDropdown === option.name}
        />
      ))}
    </div>
  );
};
