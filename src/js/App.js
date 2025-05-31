import logo from '../images/logo.svg';
import '../App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from "./Pages/HomePage";
import ExplorePage from './Pages/ExplorePage';

import PlayerPage from './Pages/PlayerPage';
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="explore" element={<ExplorePage />} />

                    <Route path="player" element={<PlayerPage />} />
                    {/* <Route path="following" element={<FollowingPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
