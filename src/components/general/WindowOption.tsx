import React, { EventHandler, useEffect, useMemo } from "react";
import { FC, useCallback, useState } from "react";

interface DropDownOption {
  name: string;
  onClick?: () => void;
  isBlocked?: boolean;
}

interface DropDownProps {
  dropdownOptions: DropDownOption[];
  closeDropdown?: () => void;
}

const DropDown: FC<DropDownProps> = ({ dropdownOptions, closeDropdown }) => {
  return (
    <div className="dropdown" onClick={closeDropdown}>
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
  closeDropdown?: () => void;
}

export const WindowOption: FC<WindowOptionProps> = ({
  name,
  dropdownOptions,
  onClick,
  isBlocked = false,
  onMouseEnter,
  isOpen,
  closeDropdown,
}) => {
  const shouldRenderDropdown = useMemo(
    () => dropdownOptions && dropdownOptions.length && isOpen,
    [dropdownOptions, isOpen]
  );

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
      {shouldRenderDropdown && (
        <DropDown
          closeDropdown={closeDropdown}
          dropdownOptions={dropdownOptions ?? []}
        />
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

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  useEffect(() => {
    const handleClickOutside = (e: React.MouseEvent) => {
      const className = (e.target as Element)?.className;
      if (!className.startsWith("dropdown-option")) {
        setOpenDropdown(null);
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
          onClick={() => option.onClick ?? handleOptionClick(option.name)}
          onMouseEnter={() => handleMouseEnter(option.name)}
          isOpen={openDropdown === option.name}
          closeDropdown={closeDropdown}
        />
      ))}
    </div>
  );
};
