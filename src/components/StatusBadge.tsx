import React from 'react';

type StatusType = 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'submitted';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Updated color scheme for better contrast
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'pending':
        // Updated to use the suggested colors for better contrast (AA compliant)
        return 'bg-[#FFF9E6] text-[#B8860B] border border-[#B8860B]';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'submitted':
        return 'Submitted';
      default:
        return 'Not Submitted';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;