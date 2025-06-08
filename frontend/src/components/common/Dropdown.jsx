import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';

const Dropdown = ({
  trigger,
  children,
  placement = 'bottom-start',
  offset = 8,
  className = '',
  menuClassName = '',
  disabled = false,
  closeOnClick = true,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Use controlled or uncontrolled state
  const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const setOpen = (value) => {
    if (controlledIsOpen !== undefined && onOpenChange) {
      onOpenChange(value);
    } else {
      setIsOpen(value);
    }
  };

  // Calculate position
  useEffect(() => {
    if (open && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let top = 0;
      let left = 0;

      // Calculate position based on placement
      switch (placement) {
        case 'bottom-start':
          top = triggerRect.bottom + offset;
          left = triggerRect.left;
          break;
        case 'bottom-end':
          top = triggerRect.bottom + offset;
          left = triggerRect.right - menuRect.width;
          break;
        case 'top-start':
          top = triggerRect.top - menuRect.height - offset;
          left = triggerRect.left;
          break;
        case 'top-end':
          top = triggerRect.top - menuRect.height - offset;
          left = triggerRect.right - menuRect.width;
          break;
        case 'left':
          top = triggerRect.top;
          left = triggerRect.left - menuRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top;
          left = triggerRect.right + offset;
          break;
        default:
          top = triggerRect.bottom + offset;
          left = triggerRect.left;
      }

      // Adjust for viewport boundaries
      if (left + menuRect.width > viewport.width) {
        left = viewport.width - menuRect.width - 16;
      }
      if (left < 16) {
        left = 16;
      }
      if (top + menuRect.height > viewport.height) {
        top = triggerRect.top - menuRect.height - offset;
      }
      if (top < 16) {
        top = 16;
      }

      setPosition({ top, left });
    }
  }, [open, placement, offset]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target) &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const handleMenuClick = (e) => {
    if (closeOnClick) {
      setOpen(false);
    }
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            className={`
              fixed z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200
              py-1 max-h-96 overflow-y-auto
              ${menuClassName}
            `}
            style={{
              top: position.top,
              left: position.left,
            }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleMenuClick}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dropdown Item Component
export const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className = '',
  icon,
  shortcut,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'hover:bg-gray-50 text-gray-700',
    danger: 'hover:bg-red-50 text-red-600',
    success: 'hover:bg-green-50 text-green-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left px-4 py-2 text-sm transition-colors
        flex items-center justify-between
        ${disabled ? 'opacity-50 cursor-not-allowed' : variantStyles[variant]}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{children}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-gray-400 font-mono">{shortcut}</span>
      )}
    </button>
  );
};

// Dropdown Divider Component
export const DropdownDivider = () => (
  <div className="my-1 h-px bg-gray-200" />
);

// Dropdown Label Component
export const DropdownLabel = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </div>
);

// Simple Select Dropdown
export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  error = false,
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Dropdown
      disabled={disabled}
      trigger={
        <div
          className={`
            flex items-center justify-between px-3 py-2 border rounded-lg
            min-h-[40px] bg-white cursor-pointer transition-colors
            ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption?.label || placeholder}
          </span>
          <IoIosArrowDown className="text-gray-400" />
        </div>
      }
      menuClassName="min-w-full"
    >
      {options.map((option) => (
        <DropdownItem
          key={option.value}
          onClick={() => onChange?.(option.value)}
          className={value === option.value ? 'bg-blue-50 text-blue-600' : ''}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default Dropdown;
