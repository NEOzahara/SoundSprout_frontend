import React, {useState} from 'react'
import {FiSearch, FiBell, FiAward, FiUser, FiHome, FiChevronDown} from 'react-icons/fi'
import {NavLink} from "react-router-dom";

export default function RightScrollLoggedOff() {

    return (
        <div className="rightScrollLoggedOff">
            <div className="loginSolicitationBox">
                <p className="loginSolicitationText">
                    Log in / Sign up to create your first playlist or publish your first song
                </p>
                <NavLink to="/login" className="btnLogin">
                    Log In / Sign Up
                </NavLink>
            </div>
        </div>
    )
}