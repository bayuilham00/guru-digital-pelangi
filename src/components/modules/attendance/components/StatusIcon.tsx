// Status icon component for attendance
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface StatusIconProps {
  status: string;
  className?: string;
}

export const getStatusIcon = (status: string): React.ReactElement | null => {
  switch (status) {
    case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
    case 'LATE': return <AlertCircle className="w-4 h-4" />;
    case 'ABSENT': return <XCircle className="w-4 h-4" />;
    case 'EXCUSED': return <Clock className="w-4 h-4" />;
    default: return null;
  }
};

const StatusIcon: React.FC<StatusIconProps> = ({ status, className = "w-4 h-4" }) => {
  switch (status) {
    case 'PRESENT': return <CheckCircle className={className} />;
    case 'LATE': return <AlertCircle className={className} />;
    case 'ABSENT': return <XCircle className={className} />;
    case 'EXCUSED': return <Clock className={className} />;
    default: return null;
  }
};

export default StatusIcon;
