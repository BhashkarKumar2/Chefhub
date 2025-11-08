/**
 * Debounce utility function
 * Delays function execution until after a specified wait time has elapsed
 * since the last time it was invoked
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 500) {
  let timeout;
  
  const debounced = function(...args) {
    const context = this;
    
    clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
  
  // Add cancel method to clear pending executions
  debounced.cancel = function() {
    clearTimeout(timeout);
  };
  
  return debounced;
}

/**
 * Debounce hook for React components
 * Returns a debounced version of the provided callback
 * 
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Array} dependencies - Dependencies array for the callback
 * @returns {Function} Debounced callback
 */
export function useDebounce(callback, delay = 500, dependencies = []) {
  const timeoutRef = React.useRef(null);
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return React.useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...dependencies]);
}

export default debounce;
