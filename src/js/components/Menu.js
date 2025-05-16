import React, {useState} from 'react'
import { NavLink } from 'react-router-dom';
import {FiHome, FiGlobe, FiUsers, FiRss, FiFolder, FiPlus, FiMusic, FiHeart, FiSettings, FiCheckSquare, FiLogOut
} from 'react-icons/fi'

export default function TopIcons() {

    const [playlistsOpen, setPlaylistsOpen] = useState(false);
    const [musicOpen, setMusicOpen] = useState(false);
    const [likesOpen, setLikesOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('Home');

    const togglePlaylists = () => {
        setPlaylistsOpen(open => !open);
    };

    const toggleMusic = () => {
        setMusicOpen(open => !open);
    };

    const toggleLikes = () => {
        setLikesOpen(open => !open);
    };

    return (
        <div className="scrollFrame">
            <p className="menuLine titleLine">
                <span className="houseMinimal"></span>
                <span className="lineText">Menu</span>
            </p>

            <div className="menuLine contentLine">
                <NavLink
                    to="/"
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
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiGlobe className="Icon" /></span>
                    <span className="lineText">Explore</span>
                </NavLink>
            </div>

            <div className="menuLine contentLine">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiUsers className="Icon" /></span>
                    <span className="lineText">Following</span>
                </NavLink>
            </div>

            <div className="menuLine contentLine">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiRss className="Icon" /></span>
                    <span className="lineText">Live Stream</span>
                </NavLink>
            </div>

            <p className="menuLine titleLine">
                <span className="houseMinimal"></span>
                <span className="lineText">Library</span>
            </p>

            <div className="menuLine contentLine hasSubmenu">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                }
                    onClick={e => {
                        const el = e.target
                        /* não queremos navegar ao clicar na seta, só no resto */
                        if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                            e.preventDefault()
                            togglePlaylists()
                        }
                    }}
                    >
                    <span className="houseMinimal"><FiFolder className="Icon" /></span>
                    <span className="lineText">Playlists</span>
                </NavLink>

                <button
                    className={`arrowMinimal ${playlistsOpen ? 'rotated' : ''}`}
                    onClick={e => {
                        e.preventDefault()      // impede qualquer salto de rota
                        e.stopPropagation();   // impede o click de subir ao <p>
                        setPlaylistsOpen(o => !o)
                    }}
                />
            </div>

            {/* Submenu de Playlists */}
            <div className={`subMenu ${playlistsOpen ? 'open' : ''}`}>
                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiPlus className="Icon" /></span>
                    <span className="subText">New Playlist</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiFolder className="Icon" /></span>
                    <span className="subText">Playlist 1</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiFolder className="Icon" /></span>
                    <span className="subText">Playlist 2</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiFolder className="Icon" /></span>
                    <span className="subText">Playlist 3</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiFolder className="Icon" /></span>
                    <span className="subText">Playlist 4</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiFolder className="Icon" /></span>
                    <span className="subText">Playlist 5</span>
                </NavLink>
                {/* ... mais itens ... */}
            </div>

            <div className="menuLine contentLine hasSubmenu">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                    onClick={e => {
                        const el = e.target
                        /* não queremos navegar ao clicar na seta, só no resto */
                        if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                            e.preventDefault()
                            toggleMusic()
                        }
                    }}
                >
                    <span className="houseMinimal"><FiMusic className="Icon" /></span>
                    <span className="lineText">Music</span>
                </NavLink>
                    <button
                        className={`arrowMinimal ${musicOpen ? 'rotated' : ''}`}
                        onClick={e => {
                            e.preventDefault()      // impede qualquer salto de rota
                            e.stopPropagation();   // impede o click de subir ao <p>
                            setMusicOpen(o => !o)
                        }}
                    />
            </div>

            {/* Submenu de Music */}
            <div className={`subMenu ${musicOpen ? 'open' : ''}`}>
                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiPlus className="Icon" /></span>
                    <span className="subText">New Song</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiMusic className="Icon" /></span>
                    <span className="subText">Posted Song 1</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiMusic className="Icon" /></span>
                    <span className="subText">Posted Song 2</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiMusic className="Icon" /></span>
                    <span className="subText">Posted Song 3</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiMusic className="Icon" /></span>
                    <span className="subText">Posted Song 4</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiMusic className="Icon" /></span>
                    <span className="subText">Posted Song 5</span>
                </NavLink>
                {/* ... mais itens ... */}
            </div>

            <div className="menuLine contentLine hasSubmenu">
                <NavLink
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }

                    onClick={e => {
                        const el = e.target
                        /* não queremos navegar ao clicar na seta, só no resto */
                        if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                            e.preventDefault()
                            toggleLikes()
                        }
                    }}
                >
                    <span className="houseMinimal"><FiHeart className="Icon" /></span>
                    <span className="lineText">Likes</span>
                </NavLink>
                    <button
                        className={`arrowMinimal ${likesOpen ? 'rotated' : ''}`}
                        onClick={e => {
                            e.preventDefault()      // impede qualquer salto de rota
                            e.stopPropagation();   // impede o click de subir ao <p>
                            setLikesOpen(o => !o)
                        }}
                    />
            </div>

            {/* Submenu de Likes */}
            <div className={`subMenu ${likesOpen ? 'open' : ''}`}>
                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiPlus className="Icon" /></span>
                    <span className="subText">New Song</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiHeart className="Icon" /></span>
                    <span className="subText">Posted Song 1</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiHeart className="Icon" /></span>
                    <span className="subText">Posted Song 2</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiHeart className="Icon" /></span>
                    <span className="subText">Posted Song 3</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiHeart className="Icon" /></span>
                    <span className="subText">Posted Song 4</span>
                </NavLink>

                <NavLink
                    to="/explore"
                    className="subItem"
                >
                    <span className="subIcon"><FiHeart className="Icon" /></span>
                    <span className="subText">Posted Song 5</span>
                </NavLink>
                {/* ... mais itens ... */}
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
                    to="/explore"
                    className={({isActive}) =>
                        `menuLineLink${isActive ? ' active' : ''}`
                    }
                >
                    <span className="houseMinimal"><FiCheckSquare className="Icon" /></span>
                    <span className="lineText">Subscription</span>
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
                    <span className="lineText">Logout</span>
                </NavLink>
            </div>
        </div>
    )
}
