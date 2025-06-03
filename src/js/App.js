import logo from '../images/logo.svg';
import '../App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './LoggedInComponents/Layout';
import LayoutLoggedOff from './LoggedOffComponents/LayoutLoggedOff';

import HomePage from "./Pages/HomePage";
import ExplorePage from './Pages/ExplorePage';
import FollowingPage from './Pages/FollowingPage';
import PlayerPage from './Pages/PlayerPage';

import HomeLoggedOffPage from "./Pages/HomeLoggedOffPage";
import ExploreLoggedOffPage from './Pages/ExploreLoggedOffPage';

import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage  from './Pages/ResetPasswordPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password"  element={<ResetPasswordPage />} />

                <Route element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="following" element={<FollowingPage />} />

                    <Route path="player" element={<PlayerPage />} />
                    {/* <Route path="following" element={<FollowingPage />} /> */}
                </Route>
                <Route element={<LayoutLoggedOff />}>
                    <Route path="homeLoggedOff" element={<HomeLoggedOffPage />} />
                    <Route path="exploreLoggedOff" element={<ExploreLoggedOffPage />} />
                    {/* <Route path="settings" element={<SettingsPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
