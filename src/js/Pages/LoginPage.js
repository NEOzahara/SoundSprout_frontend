import React from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg'
import '../../css/LoginPage.css';

export default function LoginPage() {
    return (
        // usa a .background do Common.css e acrescenta classe para o gradiente
        <div className="background loginBackground">

            {/* ==== SECÇÃO CENTRAL ==== */}
            <div className="loginCentral">
                <div className="loginPanel">
                    <Logo className="loginLogo" />

                    <h1 className="loginTitle">Log in to SoundSprout</h1>

                    <button
                        className="googleButton"
                        onClick={() => console.log('Continue with Google clicked')}>

                        <span className="googleIcon">{/* icon SVG ou componente */}</span>
                        Continue with Google
                    </button>

                    <div className="divider" />

                    <label className="field">
                        <span className="fieldLabel">Email or username</span>
                        <input
                            type="email"
                            className="fieldInput"
                            placeholder="emailexemplo@gmail.com"
                        />
                    </label>

                    <label className="field">
                        <span className="fieldLabel">Password</span>
                        <input
                            type="password"
                            className="fieldInput"
                            placeholder="•••••••••••••••••••"
                        />
                    </label>

                    <button
                        className="loginButton"
                        onClick={() => console.log('Login button clicked')}
                    >
                        Login
                    </button>

                    <a
                        href="/forgot-password"
                        className="forgotLink"
                        onClick={e => {
                            e.preventDefault();
                            console.log('Forgot your password clicked');
                        }}
                    >
                        Forgot your password?
                    </a>

                    <p className="signupText">
                        Don’t have an account?{' '}
                        <a
                            href="/signup"
                            className="signupLink"
                            onClick={e => {
                                e.preventDefault();
                                console.log('Sign up for SoundSprout clicked');
                            }}
                        >
                            Sign up for SoundSprout
                        </a>
                    </p>
                </div>
            </div>

            {/* ==== SECÇÃO DE BAIXO ==== */}
            <div className="loginFooter">
                This site is protected by reCAPTCHA and the Google{' '}
                <a
                    href="#"
                    className="footerLink"
                    onClick={e => {
                        e.preventDefault();
                        console.log('Privacy Policy clicked');
                    }}
                >
                    Privacy Policy
                </a> and{' '}
                <a
                    href="#"
                    className="footerLink"
                    onClick={e => {
                        e.preventDefault();
                        console.log('Terms of Service clicked');
                    }}
                >Terms of Service
                </a>{' '}
                apply.
            </div>
        </div>
    );
}