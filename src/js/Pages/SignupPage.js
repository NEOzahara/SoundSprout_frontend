import React, { useState } from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../../css/Pages/Login.css';

export default function SignupPage() {
    const [email, setEmail] = useState(''); // email ou username
    const [username, setUsername] = useState(''); // email ou username
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const { data } = await api.post('/auth/register', {
                email,
                username,
                password
            });

            // redireciona para a página principal ou dashboard
            navigate('/login');
        } catch (err) {
            console.error('Erro no signup:', err);
            setError('Credenciais inválidas.');
        }
    };

    return (
        <div className="background loginBackground">
            <div className="loginCentral">
                <div className="loginPanel">
                    <Logo className="loginLogo" />
                    <h1 className="loginTitle">Signup to SoundSprout</h1>
                    <form onSubmit={handleSignup} className="signupForm">
                        <label className="field">
                            <span className="fieldLabel">Username</span>
                            <input
                                type="text"
                                className="fieldInput"
                                placeholder="example123 "
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </label>

                        <label className="field">
                            <span className="fieldLabel">Email</span>
                            <input
                                type="text"
                                className="fieldInput"
                                placeholder="email@exemplo.com "
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </label>

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

                        <button type="submit" className="loginButton">Sign Up</button>
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

                    <p className="loginText">
                        Já tens conta?{' '}
                        <a
                            href="/login"
                            className="loginLink"
                            onClick={e => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            Login to SoundSprout
                        </a>
                    </p>
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
