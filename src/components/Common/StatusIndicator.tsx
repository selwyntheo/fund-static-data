import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Loader } from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'loading';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      error: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
      warning: {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      pending: {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      loading: {
        icon: Loader,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      },
    };

    return configs[status];
  };

  const getSizeConfig = (size: 'sm' | 'md' | 'lg') => {
    const configs = {
      sm: {
        iconSize: 14,
        padding: 'px-2 py-1',
        textSize: 'text-xs',
      },
      md: {
        iconSize: 16,
        padding: 'px-3 py-2',
        textSize: 'text-sm',
      },
      lg: {
        iconSize: 20,
        padding: 'px-4 py-3',
        textSize: 'text-base',
      },
    };

    return configs[size];
  };

  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  const Icon = statusConfig.icon;

  return (
    <div
      className={`
        inline-flex items-center rounded-lg border
        ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}
        ${sizeConfig.padding} ${sizeConfig.textSize}
        ${className}
      `}
    >
      {showIcon && (
        <Icon
          size={sizeConfig.iconSize}
          className={`
            ${message ? 'mr-2' : ''}
            ${status === 'loading' ? 'animate-spin' : ''}
          `}
        />
      )}
      {message && <span className="font-medium">{message}</span>}
    </div>
  );
};