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
        }

        return Promise.reject(err);
    }
);

export default api;
