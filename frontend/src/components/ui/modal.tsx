import React, { useEffect, useState, Fragment } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  animationType?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  animationType = 'scale',
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Block scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Ensure body scrolling is disabled
      document.body.style.overflow = 'hidden';
    } else {
      setIsClosing(true);
      // Add a delay before hiding completely
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Restore body scrolling
        document.body.style.overflow = 'auto';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match the animation duration
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  const animationClasses = {
    fade: 'animate-fadeIn',
    scale: 'animate-scale-in',
    'slide-up': 'animate-slideInBottom',
    'slide-down': 'animate-slide-in-top',
    'slide-left': 'animate-slide-in-right',
    'slide-right': 'animate-slide-in-left',
  };

  const animationExitClasses = {
    fade: 'opacity-0 transition-opacity duration-300',
    scale: 'opacity-0 scale-95 transition-all duration-300',
    'slide-up': 'opacity-0 translate-y-10 transition-all duration-300',
    'slide-down': 'opacity-0 -translate-y-10 transition-all duration-300',
    'slide-left': 'opacity-0 translate-x-10 transition-all duration-300',
    'slide-right': 'opacity-0 -translate-x-10 transition-all duration-300',
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300",
        isClosing ? 'opacity-0' : 'opacity-100',
        overlayClassName
      )}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-hidden={!isOpen}
    >
      <div 
        className={cn(
          "relative bg-card border shadow-lg rounded-lg w-full overflow-hidden transition-all duration-300",
          sizeClasses[size],
          isClosing ? animationExitClasses[animationType] : animationClasses[animationType],
          contentClassName,
          "!opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: "1 !important" }}
      >
        {showCloseButton && (
          <button 
            className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {(title || description) && (
          <div className="p-6 border-b">
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        
        <div className={cn("p-6", className)}>
          {children}
        </div>
        
        {footer && (
          <div className="p-4 bg-muted/20 border-t flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components for common modal patterns
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  cancelVariant = 'outline',
  isLoading = false,
  size = 'sm',
  animationType = 'scale',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animationType?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      animationType={animationType}
      footer={
        <>
          <Button
            variant={cancelVariant}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={isLoading}
            animation="pop"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-muted-foreground">{description}</p>
    </Modal>
  );
};

export default Modal; 