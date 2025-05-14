import React from 'react'
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'

export default function TopIcons() {
    return (
        <div className="topIcons">
            <FiSearch className="topIcon" />
            <FiBell   className="topIcon" />
            <FiAward  className="topIcon" />
            <FiUser   className="userIcon" />
        </div>
    )
}
