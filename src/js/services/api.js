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
            localStorage.setItem('accessToken', data.accessToken);
            // repete o pedido original
            err.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return api.request(err.config);
        }
        return Promise.reject(err);
    }
);

// frontend/src/services/api.js
api.interceptors.response.use(
    res => res,
    async err => {
        const status = err.response?.status;
        const original = err.config;
        // Se for 401 OU 403 e ainda não tiveste retry
        if ((status === 401 || status === 403) && !original._retry) {
            original._retry = true;
            // chama refresh (comCredentials: true envia o cookie)
            const { data } = await api.post('/auth/refresh');
            localStorage.setItem('accessToken', data.accessToken);
            // atualiza header e repete a request original
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
        }
        return Promise.reject(err);
    }
);


export default api;
