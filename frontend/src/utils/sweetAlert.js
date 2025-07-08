import Swal from 'sweetalert2';

// Common SweetAlert2 configurations for consistent styling
export const sweetAlertConfig = {
  // Common styling
  customClass: {
    popup: 'rounded-lg',
    confirmButton: 'rounded-md',
    cancelButton: 'rounded-md',
    input: 'rounded-md'
  },
  // Common button colors
  confirmButtonColor: '#dc2626', // Red for destructive actions
  cancelButtonColor: '#6b7280',  // Gray for cancel
  // Common settings
  reverseButtons: true, // Cancel button on the left
  focusCancel: true,    // Focus on cancel button by default
};

// Delete confirmation dialog
export const confirmDelete = async (title, text, itemName = '') => {
  const result = await Swal.fire({
    title: title || 'Delete Item?',
    text: text || `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    ...sweetAlertConfig
  });
  
  return result.isConfirmed;
};

// Success notification
export const showSuccess = (title, text) => {
  return Swal.fire({
    title: title || 'Success!',
    text: text || 'Operation completed successfully.',
    icon: 'success',
    confirmButtonColor: '#059669', // Green
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md'
    }
  });
};

// Error notification
export const showError = (title, text) => {
  return Swal.fire({
    title: title || 'Error!',
    text: text || 'Something went wrong. Please try again.',
    icon: 'error',
    confirmButtonColor: '#dc2626', // Red
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md'
    }
  });
};

// Input dialog
export const showInputDialog = async (title, inputLabel, inputPlaceholder = '') => {
  const result = await Swal.fire({
    title: title,
    input: 'text',
    inputLabel: inputLabel,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter a value!';
      }
    },
    ...sweetAlertConfig,
    confirmButtonColor: '#2563eb' // Blue for confirm actions
  });
  
  return result;
};

// Confirmation dialog (non-destructive)
export const confirmAction = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    ...sweetAlertConfig,
    confirmButtonColor: '#2563eb' // Blue for confirm actions
  });
  
  return result.isConfirmed;
};

// Loading dialog
export const showLoading = (title = 'Loading...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close any open SweetAlert
export const closeAlert = () => {
  Swal.close();
};

export default Swal; 