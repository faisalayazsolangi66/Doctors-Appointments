import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ErrorAlert Component
 * Displays error messages to the user
 * Can be dismissed and provides action buttons
 */
interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorAlert({
  title = 'Error',
  message,
  onDismiss,
  actionLabel,
  onAction,
}: ErrorAlertProps) {
  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 dark:text-red-200">{title}</h3>
        <p className="text-sm text-red-800 dark:text-red-300 mt-1">{message}</p>
        {(actionLabel || onDismiss) && (
          <div className="flex gap-2 mt-3">
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                variant="outline"
                size="sm"
                className="h-8"
              >
                {actionLabel}
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
              >
                <X className="w-4 h-4" />
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SuccessAlert Component
 * Displays success messages to the user
 */
interface SuccessAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export function SuccessAlert({
  title = 'Success',
  message,
  onDismiss,
}: SuccessAlertProps) {
  return (
    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-4 flex gap-3">
      <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mt-0.5">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-green-900 dark:text-green-200">{title}</h3>
        <p className="text-sm text-green-800 dark:text-green-300 mt-1">{message}</p>
        {onDismiss && (
          <div className="mt-3">
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
            >
              <X className="w-4 h-4" />
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
