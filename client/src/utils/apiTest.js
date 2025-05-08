import axios from 'axios';

/**
 * Utility function to test API endpoints
 * @param {string} endpoint - The API endpoint to test
 * @returns {Promise<object>} - The response data
 */
export const testApiEndpoint = async (endpoint) => {
  try {
    console.log(`Testing API endpoint: ${endpoint}`);
    const response = await axios.get(endpoint);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Helper function to add a test button to the UI
 * @param {string} endpoint - The API endpoint to test
 * @param {string} buttonText - Text to display on the button
 */
export const addTestButton = (endpoint, buttonText = 'Test API') => {
  const button = document.createElement('button');
  button.innerText = buttonText;
  button.style.cssText = 'position: fixed; bottom: 10px; right: 10px; z-index: 9999; padding: 8px 12px; background: #4a89dc; color: white; border: none; border-radius: 4px;';
  
  button.addEventListener('click', () => {
    testApiEndpoint(endpoint)
      .then(data => alert(`API test successful! Check console for details.`))
      .catch(err => alert(`API test failed: ${err.message}`));
  });
  
  document.body.appendChild(button);
};
