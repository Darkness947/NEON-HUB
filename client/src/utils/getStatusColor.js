export const getStatusColor = (status) => {
  if (!status) return 'secondary';
  switch (status.toLowerCase()) {
    case 'watching':
    case 'playing':
      return 'accent-blue';
    case 'completed':
      return 'accent-green';
    case 'planned':
    case 'backlog':
      return 'accent-purple';
    case 'paused':
      return 'accent-amber';
    case 'dropped':
      return 'accent-red';
    default:
      return 'secondary';
  }
};
