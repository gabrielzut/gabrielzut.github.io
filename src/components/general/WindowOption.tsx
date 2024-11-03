import React from "react";
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
  onClick?: () => void;
  isBlocked?: boolean;
}

export const WindowOption: FC<WindowOptionProps> = ({
  name,
  dropdownOptions,
  onClick,
  isBlocked = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleButtonClick = useCallback(() => {
    if (isBlocked) return;
    if (onClick) onClick();
    if (dropdownOptions && dropdownOptions.length)
      setIsDropdownOpen(!isDropdownOpen);
  }, [dropdownOptions, isBlocked, isDropdownOpen, onClick]);

  return (
    <div
      tabIndex={0}
      onBlur={useCallback(() => setIsDropdownOpen(false), [])}
      className={`window-option ${isDropdownOpen ? "expanded" : ""}`}
    >
      <button
        className={`window-option-button ${isBlocked ? "blocked" : ""}`}
        onClick={handleButtonClick}
      >
        {name}
      </button>
      {dropdownOptions && dropdownOptions.length && isDropdownOpen && (
        <DropDown dropdownOptions={dropdownOptions} />
      )}
    </div>
  );
};
