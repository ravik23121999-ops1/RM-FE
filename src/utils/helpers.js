export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${amount.toFixed(2)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-preparation': 'bg-blue-100 text-blue-800',
    prepared: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'PLACED',
    'in-preparation': 'IN PROGRESS',
    prepared: 'PREPARING',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  };
  return labels[status] || status.toUpperCase();
};

export const getOrderStatusSteps = (currentStatus) => {
  const steps = [
    { key: 'pending', label: 'PLACED' },
    { key: 'in-preparation', label: 'IN PROGRESS' },
    { key: 'prepared', label: 'PREPARING' },
    { key: 'delivered', label: 'DELIVERED' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  return steps.map((step, index) => ({
    ...step,
    completed: index < currentIndex,
    current: index === currentIndex,
    pending: index > currentIndex,
  }));
};
