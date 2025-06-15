import { useState } from 'react';
import { toast } from 'react-hot-toast';

export const useApiError = () => {
  const [error, setError] = useState(null);

  const handleError = (error, customMessage = null) => {
    console.error('API Error:', error);

    let errorMessage = customMessage;

    if (!customMessage) {
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      'An error occurred while processing your request.';
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Unable to reach the server. Please check your internet connection.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }
    }

    setError(errorMessage);
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-center',
    });

    return errorMessage;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError,
  };
}; 