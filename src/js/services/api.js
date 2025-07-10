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
// 2) só faz refresh uma vez por pedido
api.interceptors.response.use(
    res => res,
    async err => {
<<<<<<< HEAD
        const status = err.response?.status;
        const originalReq = err.config;

        // se for 401, e nunca tivermos feito retry deste pedido...
        if (status === 401 && !originalReq._retry) {
            originalReq._retry = true;

            try {
                // chama o teu endpoint de refresh (–> /api/auth/refresh no servidor)
                const { data } = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/auth/refresh`,
                    {},                         // body vazio
                    { withCredentials: true }   // envia o cookie de refreshToken
                );

                // guarda o novo token no mesmo sítio que o login usa
                localStorage.setItem('accessToken', data.accessToken);

                // atualiza o header e refaz o pedido original
                originalReq.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalReq);
            } catch (refreshErr) {
                // se o refresh também falhar (ex: refreshToken expirou),
                // rejeitamos e deixamos a app lidar (p.ex. redirecionar ao login)
                return Promise.reject(refreshErr);
            }
=======
        if (err.response?.status === 401) {
            // tenta refresh
            const { data } = await api.post('/auth/refresh');
            localStorage.setItem('accessToken', data.accessToken);
            // repete o pedido original
            err.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return api.request(err.config);
>>>>>>> 3c466a75586c3dcbd34880f666555c95a8642fda
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
