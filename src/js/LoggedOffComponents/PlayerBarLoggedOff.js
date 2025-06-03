import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

export default function PlayerBarLoggedOff() {

    return (
        <div className="playerBar loggedOff">
            {/* 1) Contêiner de texto dividido em duas linhas */}
            <div className="loggedOffText">
                <span className="previewTitle">Preview of SoundSprout</span>
                <span className="previewSubtitle">Sign up / Log in to have access to all the free features</span>
            </div>
            <NavLink to="/login" className="btnLogin">
                Log In / Sign Up
            </NavLink>
        </div>
    );
}
