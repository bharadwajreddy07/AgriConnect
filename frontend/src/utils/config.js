const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const defaultApiOrigin = 'http://localhost:5000';
const rawApiUrl = (import.meta.env.VITE_API_URL || defaultApiOrigin).trim();
const normalizedApiUrl = stripTrailingSlash(rawApiUrl);
const apiUrl = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api$/, '')).trim();
const socketUrl = stripTrailingSlash(rawSocketUrl);

const config = {
    API_URL: apiUrl,
    SOCKET_URL: socketUrl,
};

export default config;
