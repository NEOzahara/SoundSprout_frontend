import React, {useEffect, useRef, useState} from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';
import LogoPng from '../../images/Logo_background_removed.png'
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../../css/Pages/Login.css';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState(''); // email ou username
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const [success, setSuccess] = useState(false);

    const timeoutRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            // limpa timeout se o componente desmontar antes de redirecionar
            clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const { data } = await api.post('/auth/login', {
                email: identifier,
                password
            });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess(true);



            // redireciona para a página principal ou dashboard
            timeoutRef.current = setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Erro no login:', err);
            setError('Credenciais inválidas.');
        }
    };

    return (
        <div className="background loginBackground">
            <div className="loginCentral">
                <div className="loginPanel">
                    <img src={LogoPng} alt="Site Logo" className="loginLogo" />
                    {/*<Logo className="loginLogo" />*/}
                    <h1 className="loginTitle">Login to SoundSprout</h1>

                    <form onSubmit={handleLogin} className="loginForm">
                        <label className="field">
                            <span className="fieldLabel">Email</span>
                            <input
                                type="text"
                                className="fieldInput"
                                placeholder="email@exemplo.com "
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                required
                                disabled={success}
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
                                disabled={success}
                            />
                        </label>

                        {error && <div className="errorMessage">{error}</div>}

                        {!success ? (
                            <button type="submit" className="loginButton">
                                Log In
                            </button>
                        ) : (
                            <div className="successMessage">
                                Login efetuado com sucesso!
                            </div>
                        )}
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

                    <a
                        href="/forgot-password"
                        className="forgotLink"
                        onClick={e => {
                            e.preventDefault();
                            navigate('/forgot-password');
                        }}
                    >
                        Esqueceste-te da password?
                    </a>

                    <p className="signupText">
                        Ainda não tens conta?{' '}
                        <a
                            href="/signup"
                            className="signupLink"
                            onClick={e => {
                                e.preventDefault();
                                navigate('/signup');
                            }}
                        >
                            Signup to SoundSprout
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
