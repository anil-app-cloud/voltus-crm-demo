import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: number;
  className?: string;
  open?: boolean;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  width = 320,
  className,
  open
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Allow controlling dropdown visibility from outside
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={toggleDropdown}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          style={{ width: `${width}px` }}
        >
          {children}
        </div>
      )}
    </div>
  );
} 