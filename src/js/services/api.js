import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,   // permite enviar o cookie refreshToken
});

// injeta Authorization
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// auto-refresh se der 401
api.interceptors.response.use(
    res => res,
    async err => {
        if (err.response?.status === 401) {
            // tenta refresh
            const { data } = await api.post('/auth/refresh');
            localStorage.setItem('ac', data.accessToken);
            // repete o pedido original
            err.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return api.request(err.config);
        }
        return Promise.reject(err);
    }
);

export default api;
