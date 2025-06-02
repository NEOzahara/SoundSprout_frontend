import React, { useState } from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../../css/Pages/Login.css';

export default function ForgotPasswordPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const { data } = await api.post('/auth/forgot-password', {
                password
            });
            localStorage.setItem('token', data.token);
            // redireciona para a página principal ou dashboard
            navigate('/login');
        } catch (err) {
            console.error('Erro no forgot-password:', err);
            setError('Credenciais inválidas.');
        }
    };

    return (
        <div className="background loginBackground">
            <div className="loginCentral">
                <div className="loginPanel">
                    <Logo className="loginLogo" />
                    <h1 className="loginTitle">Reset your Password</h1>

                    <p className="resetPasswordText">
                        Enter the email address or username linked to your SoundSprout account and we'll send you an email.
                    </p>

                    <form onSubmit={handleResetPassword} className="forgotPasswordForm">
                        <label className="field">
                            <span className="fieldLabel">Password</span>
                            <input
                                type="password"
                                className="fieldInput"
                                placeholder="•••••••••••••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </label>

                        {error && <div className="errorMessage">{error}</div>}

                        <button type="submit" className="loginButton">Send Link</button>
                    </form>

                    {/*
                    <button
                        className="googleButton"
                        onClick={() => console.log('Continue with Google clicked')}
                    >
                        <span className="googleIcon" />
                        Continuar com Google
                    </button>
                    */}

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
