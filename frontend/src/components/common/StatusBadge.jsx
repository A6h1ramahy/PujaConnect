import React from 'react';
import { HiCheckCircle, HiClock, HiXCircle, HiBan } from 'react-icons/hi';

const statusConfig = {
  pending:   { icon: HiClock,        cls: 'badge-pending',   label: 'Pending'   },
  accepted:  { icon: HiCheckCircle,  cls: 'badge-accepted',  label: 'Accepted'  },
  rejected:  { icon: HiXCircle,      cls: 'badge-rejected',  label: 'Rejected'  },
  cancelled: { icon: HiBan,          cls: 'badge-cancelled', label: 'Cancelled' },
  completed: { icon: HiCheckCircle,  cls: 'badge-completed', label: 'Completed' },
  verified:  { icon: HiCheckCircle,  cls: 'badge-verified',  label: 'Verified'  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={config.cls}>
      <Icon className="text-sm" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
