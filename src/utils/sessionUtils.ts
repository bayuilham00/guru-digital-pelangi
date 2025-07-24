// Session utility functions
export const handleSessionExpired = (message: string = 'Sesi Anda telah berakhir. Silakan login kembali.') => {
  console.log('🔐 Session expired, redirecting to login...');
  
  // Clear localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  
  // Show message
  alert(message);
  
  // Redirect to login
  window.location.href = '/login';
};

export const isTokenExpired = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message === 'Token akses diperlukan' ||
    error.message.includes('Token tidak valid') ||
    error.message.includes('Unauthorized')
  );
};

export const handleApiError = (error: unknown, showAlert: boolean = true): string => {
  console.error('API Error:', error);
  
  if (isTokenExpired(error)) {
    if (showAlert) {
      handleSessionExpired();
    }
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Terjadi kesalahan. Silakan coba lagi.';
};
