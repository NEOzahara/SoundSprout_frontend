import React, {useState} from 'react'
import { NavLink } from 'react-router-dom';
import {FiHome, FiGlobe, FiSettings, FiLogOut
} from 'react-icons/fi'

export default function MenuLoggedOff() {

    const [currentPage, setCurrentPage] = useState('Home');

    return (
        <div className="scrollFrame">
            <p className="menuLine titleLine">
                <span className="houseMinimal"></span>
                <span className="lineText">Menu</span>
            </p>

            <div className="menuLine contentLine">
                <NavLink
                    to="/homeLoggedOff"
                    end
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiHome className="Icon" /></span>
                    <span className="lineText">Home</span>
                </NavLink>
            </div>

            <div className="menuLine contentLine">
                <NavLink
                    to="/exploreLoggedOff"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiGlobe className="Icon" /></span>
                    <span className="lineText">Explore</span>
                </NavLink>
            </div>

            <p className="menuLine titleLine">
                <span className="houseMinimal"></span>
                <span className="lineText">Library</span>
            </p>

            <div className="loginSolicitationBox">
                <p className="loginSolicitationText">
                    Log in / Sign up to create your first playlist or publish your first song
                </p>
                <NavLink to="/login" className="btnLogin">
                    Log In / Sign Up
                </NavLink>
            </div>

            <p className="menuLine titleLine">
                <span className="houseMinimal"></span>
                <span className="lineText">General</span>
            </p>

            <div className="menuLine contentLine">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiSettings className="Icon" /></span>
                    <span className="lineText">Settings</span>
                </NavLink>
            </div>

            <div className="menuLine contentLine">
                <NavLink
                    to="/login"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiLogOut className="Icon" /></span>
                    <span className="lineText">Log In</span>
                </NavLink>
            </div>
        </div>
    )
}
