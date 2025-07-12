import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,   // envia cookie de refreshToken
});

// 1) Interceptor de request injeta o accessToken
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// 2) Interceptor de response faz refresh se o token expirar
api.interceptors.response.use(
    res => res,
    async err => {
        const status = err.response?.status;
        const originalReq = err.config;

        // Captura 401 (não autorizado) ou 403 (inválido/expirado)
        if ((status === 401 || status === 403) && !originalReq._retry) {
            originalReq._retry = true;

            try {
                // Usa axios puro para não disparar de novo este interceptor
                const { data } = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/auth/refresh`,
                    {},                       // body vazio
                    { withCredentials: true } // cookie httpOnly
                );

                // Guarda o novo token e repõe o header
                localStorage.setItem('accessToken', data.accessToken);
                originalReq.headers.Authorization = `Bearer ${data.accessToken}`;

                // Repete a request original com o token renovado
                return api(originalReq);
            } catch (refreshErr) {
                // Se o refresh falhar (p.ex. refreshToken expirou), propaga o erro
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(err);
    }
);

export default api;
