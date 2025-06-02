import React, {useState} from 'react'
import {FiSearch, FiBell, FiAward, FiUser, FiHome, FiChevronDown} from 'react-icons/fi'

export default function RightScrollLoggedOff() {

    return (
        <div className="rightScroll">
            <div className="loginSolicitationBox">
                <p className="loginSolicitationText">
                    Log in / Sign up to create your first playlist or publish your first song
                </p>
                <button
                    className="btnLogin"
                    onClick={() => console.log('Log In clicked')}
                >
                    Log In / Sign Up
                </button>
            </div>
        </div>
    )
}