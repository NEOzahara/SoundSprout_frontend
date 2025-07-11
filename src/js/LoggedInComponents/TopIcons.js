import React, {useState, useEffect, useRef, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'
import { testPlaylists, testMusics, testUsers } from '../../data/test'
import { notifications } from '../../data/notifications'

export default function TopIcons() {

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')

    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState('')
    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return []
        const pMatches = testPlaylists
            .filter(p => p.title.toLowerCase().includes(q))
            .map(p => ({ type: 'Playlist', id: p.id }))
        const mMatches = testMusics
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({ type: 'Song',     id: m.id }))
        const uMatches = testUsers
            .filter(u => u.name.toLowerCase().includes(q))
            .map(u => ({ type: 'User',     id: u.id }))
        return [ ...pMatches, ...mMatches, ...uMatches ]
    }, [query])

    const [showNotifications, setShowNotifications] = useState(false)
    const notifRef = useRef(null)

    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user') || 'null');
    });
    useEffect(() => {
        function onUserUpdated() {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        }
        // escuta o nosso evento customizado
        window.addEventListener('userUpdated', onUserUpdated);
        // opcional: também escuta mudanças vindas de outras tabs
        window.addEventListener('storage', e => {
            if (e.key === 'user') onUserUpdated();
        });
        return () => {
            window.removeEventListener('userUpdated', onUserUpdated);
        };
    }, []);

    // fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(e) {
            if (showNotifications && notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotifications])

    return (
        <div className="topIcons">
            <div className={`searchContainerIcon${showSearch ? ' active' : ''}`}>
                {showSearch && (
                    <input
                        className="searchInputIcon"
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search..."
                        autoFocus
                    />
                )}
                <FiSearch
                    className="topIcon"
                    onClick={() => {
                        setShowSearch(b => !b)
                        setQuery('')
                    }}
                />
                {showSearch && results.length > 0 && (
                    <ul className="suggestionsIcon">
                        {results.map(r => {
                            let item, subtitle, thumbClass, imageUrl, to
                            if (r.type === 'Playlist') {
                                item = testPlaylists.find(p => p.id === r.id)
                                subtitle = item.owner
                                thumbClass = 'playlistThumbIcon'
                                imageUrl = item.imageUrl
                                to = `/playlist/${r.id}`
                            } else if (r.type === 'Song') {
                                item = testMusics.find(m => m.id === r.id)
                                subtitle = item.artist
                                thumbClass = 'songThumbIcon'
                                imageUrl = item.imageUrl
                                to = `/player/${r.id}`
                            } else {
                                item = testUsers.find(u => u.id === r.id)
                                subtitle = item.username
                                thumbClass = 'userThumbIcon'
                                imageUrl = item.avatarUrl
                                to = `/profile/${encodeURIComponent(item.username)}`
                            }
                            return (
                                <NavLink
                                    key={`${r.type}-${r.id}`}
                                    to={to}
                                    className="suggestionItemIcon"
                                    onClick={() => setShowSearch(false)}
                                >
                                    <div
                                        className={`suggestionThumbIcon ${thumbClass}`}
                                        style={{ backgroundImage: `url(${imageUrl||'/placeholder.png'})` }}
                                    />
                                    <div className="suggestionTextIcon">
                                        <div className="suggestionTitleIcon">
                                            {item.title || item.name}
                                        </div>
                                        <div className="suggestionSubtitleIcon">
                                            {subtitle}
                                        </div>
                                    </div>
                                </NavLink>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* --- sino de notificações --- */}
            <div className="notificationsContainer" ref={notifRef}>
                <FiBell
                    className={`topIcon${showNotifications ? ' active' : ''}`}
                    onClick={() => setShowNotifications(n => !n)}
                />
                {showNotifications && (
                    <ul className="notificationsDropdown">
                        {notifications.map(n => (
                            <li key={n.id} className="notificationItem">
                                <NavLink
                                    to={n.link}
                                    className="notificationLink"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    {n.message}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
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
                to={`/profile/${user?.username}`}
                end
                className={({ isActive }) =>
                    // mantém sempre a class userIcon, mas adiciona `active` quando on profile
                    `userAvatarContainer${isActive ? ' active' : ''}`
                }
                title="Profile"
            >
                {user?.foto
                    ? (
                        <div
                            className="userAvatar"
                            style={{
                                backgroundImage: `url(${baseUrl}${user.foto.startsWith('/') ? '' : '/'}${user.foto})`
                            }}
                        />
                    ) : (
                        <FiUser className="userAvatarFallback" />
                    )
                }
            </NavLink>
        </div>
    )
}
