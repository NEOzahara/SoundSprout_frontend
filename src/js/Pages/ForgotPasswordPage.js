import React, { useState } from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';
import api from '../services/api';
import '../../css/Pages/Login.css';

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleResetRequest = async e => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            const { data } = await api.post('/auth/forgot-password', { identifier });
            setMessage(data.message);
        } catch (err) {
            console.error('Erro no forgot-password:', err);
            setError(err.response?.data?.error || 'Erro ao enviar email.');
        }
    };

    return (
        <div className="background loginBackground">
            <div className="loginCentral">
                <div className="loginPanel">
                    <Logo className="loginLogo" />
                    <h1 className="loginTitle">Redefinir Password</h1>

                    <p className="resetPasswordText">
                        Insere o email ou username associado ao teu SoundSprout, e enviaremos um link para redefinição.
                    </p>

                    <form onSubmit={handleResetRequest} className="forgotPasswordForm">
                        <label className="field">
                            <span className="fieldLabel">Email ou Username</span>
                            <input
                                type="text"
                                className="fieldInput"
                                placeholder="email@exemplo.com ou username"
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                required
                            />
                        </label>

                        {message && <div className="successMessage">{message}</div>}
                        {error && <div className="errorMessage">{error}</div>}

                        <button type="submit" className="loginButton">Enviar Link</button>
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