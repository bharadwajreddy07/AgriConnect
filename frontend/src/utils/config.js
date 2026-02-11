const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
};

console.log('Environment:', import.meta.env.MODE);
console.log('API_URL:', config.API_URL);

export default config;
