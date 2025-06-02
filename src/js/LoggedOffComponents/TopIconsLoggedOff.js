import React from 'react'
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'

export default function TopIconsLoggedOff() {
    return (
        <div className="topIcons">
            <FiSearch className="topIcon" />
            <div className="guestBox">
                Guest User
            </div>
        </div>
    )
}
