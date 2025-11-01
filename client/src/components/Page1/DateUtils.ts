// DateUtils.ts
export const formatDateTimeForInput = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  // If it's already in the correct format (YYYY-MM-DDTHH:mm), return as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeString)) {
    return dateTimeString;
  }
  
  // Try to parse various date formats
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '';
  
  // Format to YYYY-MM-DDTHH:mm for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateTimeForDisplay = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const isValidDateTime = (dateTimeString: string): boolean => {
  if (!dateTimeString) return true; // Empty is valid
  const date = new Date(dateTimeString);
  return !isNaN(date.getTime());
};

// For backward compatibility
export const formatDateForInput = formatDateTimeForInput;
export const formatDateForDisplay = formatDateTimeForDisplay;
export const getCurrentDate = getCurrentDateTime;
export const isValidDate = isValidDateTime;