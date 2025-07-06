import React from 'react'
import { NavLink } from 'react-router-dom';
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'

export default function TopIcons() {
    return (
        <div className="topIcons">
            <FiSearch className="topIcon" />
            <FiBell   className="topIcon" />
            <NavLink
                to="/achievements"
                className={({ isActive }) =>
                    // mantém sempre a class userIcon, mas adiciona `active` quando on profile
                    `topIcon${isActive ? ' active' : ''}`
                }
                title="Achievements"
            >
                <FiAward />
            </NavLink>
            <NavLink
                to="/profile"
                end
                className={({ isActive }) =>
                    // mantém sempre a class userIcon, mas adiciona `active` quando on profile
                    `userIcon${isActive ? ' active' : ''}`
                }
                title="Profile"
            >
                <FiUser />
            </NavLink>
        </div>
    )
}
