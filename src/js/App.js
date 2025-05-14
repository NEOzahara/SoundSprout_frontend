import logo from '../images/logo.svg';
import '../App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from "./Pages/HomePage";
import ExplorePage from './Pages/ExplorePage';

import PlayerPage from './Pages/PlayerPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
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
