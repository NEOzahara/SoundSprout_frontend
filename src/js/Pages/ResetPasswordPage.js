// src/js/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';
import LogoPng from '../../images/Logo_background_removed.png'
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../../css/Pages/Login.css';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Extrair token da query string (?token=abc)
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    const handleReset = async e => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            const { data } = await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            setMessage(data.message);
            // Depois de alterar, redireciona após uns segundos ou dá link para login
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Erro em reset-password:', err);
            setError(err.response?.data?.error || 'Erro ao redefinir password.');
        }
    };

    return (
        <div className="background loginBackground">
            <div className="loginCentral">
                <div className="loginPanel">
                    {/*<Logo className="loginLogo" />*/}
                    <img src={LogoPng} alt="Site Logo" className="loginLogo" />
                    <h1 className="loginTitle">Nova Password</h1>

                    <p className="resetPasswordText">
                        Introduz a tua nova password abaixo.
                    </p>

                    <form onSubmit={handleReset} className="forgotPasswordForm">
                        <label className="field">
                            <span className="fieldLabel">Nova Password</span>
                            <input
                                type="password"
                                className="fieldInput"
                                placeholder="•••••••••••••••••••"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </label>

                        {message && <div className="successMessage">{message}</div>}
                        {error && <div className="errorMessage">{error}</div>}

                        <button type="submit" className="loginButton">Redefinir Password</button>
                    </form>
                </div>
            </div>

            <div className="loginFooter">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="#" className="footerLink" onClick={e => e.preventDefault()}>Privacy Policy</a>{' '}
                and{' '}
                <a href="#" className="footerLink" onClick={e => e.preventDefault()}>Terms of Service</a>{' '}
                apply.
            </div>
        </div>
    );
}
