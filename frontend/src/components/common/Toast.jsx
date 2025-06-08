import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast as hotToast } from 'react-hot-toast';
import { 
  AiOutlineCheckCircle, 
  AiOutlineCloseCircle, 
  AiOutlineInfoCircle, 
  AiOutlineWarning,
  AiOutlineClose 
} from 'react-icons/ai';

// Toast notification system using react-hot-toast with custom styling
const toastStyles = {
  success: {
    icon: <AiOutlineCheckCircle className="text-green-500" size={20} />,
    className: 'border-l-4 border-green-500 bg-green-50',
    iconColor: 'text-green-500',
  },
  error: {
    icon: <AiOutlineCloseCircle className="text-red-500" size={20} />,
    className: 'border-l-4 border-red-500 bg-red-50',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: <AiOutlineWarning className="text-yellow-500" size={20} />,
    className: 'border-l-4 border-yellow-500 bg-yellow-50',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: <AiOutlineInfoCircle className="text-blue-500" size={20} />,
    className: 'border-l-4 border-blue-500 bg-blue-50',
    iconColor: 'text-blue-500',
  },
};

// Custom toast component
const CustomToast = ({ type = 'info', title, message, onDismiss, id }) => {
  const style = toastStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-md w-full
        bg-white ${style.className}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h4>
        )}
        <p className="text-sm text-gray-700">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss?.(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <AiOutlineClose size={16} />
      </button>
    </motion.div>
  );
};

// Toast functions
export const toast = {
  success: (message, options = {}) => {
    return hotToast.custom((t) => (
      <CustomToast
        type="success"
        message={message}
        title={options.title}
        onDismiss={() => hotToast.dismiss(t.id)}
        id={t.id}
      />
    ), {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options,
    });
  },

  error: (message, options = {}) => {
    return hotToast.custom((t) => (
      <CustomToast
        type="error"
        message={message}
        title={options.title}
        onDismiss={() => hotToast.dismiss(t.id)}
        id={t.id}
      />
    ), {
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return hotToast.custom((t) => (
      <CustomToast
        type="warning"
        message={message}
        title={options.title}
        onDismiss={() => hotToast.dismiss(t.id)}
        id={t.id}
      />
    ), {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options,
    });
  },

  info: (message, options = {}) => {
    return hotToast.custom((t) => (
      <CustomToast
        type="info"
        message={message}
        title={options.title}
        onDismiss={() => hotToast.dismiss(t.id)}
        id={t.id}
      />
    ), {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options,
    });
  },

  promise: hotToast.promise,
  dismiss: hotToast.dismiss,
  remove: hotToast.remove,
};

// Alert Component for inline alerts
export const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onDismiss,
  className = '',
  showIcon = true,
  variant = 'filled' // filled, outlined, subtle
}) => {
  const style = toastStyles[type];
  
  const variantStyles = {
    filled: `${style.className} border-0`,
    outlined: `border ${style.iconColor.replace('text-', 'border-')} bg-white`,
    subtle: `${style.className.replace('bg-', 'bg-opacity-50 bg-')}`,
  };

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg
      ${variantStyles[variant]}
      ${className}
    `}>
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h4>
        )}
        <div className="text-sm text-gray-700">
          {children}
        </div>
      </div>

      {/* Close button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <AiOutlineClose size={16} />
        </button>
      )}
    </div>
  );
};

// Notification Component for push notifications
export const Notification = ({ 
  title, 
  message, 
  type = 'info', 
  onDismiss, 
  autoClose = true,
  duration = 5000,
  actions = [],
  avatar,
  timestamp 
}) => {
  const style = toastStyles[type];

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {avatar || style.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {message}
            </p>
            {timestamp && (
              <p className="mt-1 text-xs text-gray-400">
                {timestamp}
              </p>
            )}
            {actions.length > 0 && (
              <div className="mt-3 flex space-x-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`text-sm font-medium ${action.primary ? 'text-blue-600 hover:text-blue-500' : 'text-gray-700 hover:text-gray-500'}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default toast;
