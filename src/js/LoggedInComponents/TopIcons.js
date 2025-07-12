import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'
import { notifications } from '../../data/notifications'
import api from '../services/api'

export default function TopIcons() {
    // Base URL sem o /api para servir imagens estáticas
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')

    // Estado da searchbox
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const searchRef = useRef(null)

    // Efeito de pesquisa com debounce de 300 ms
    useEffect(() => {
        if (!query.trim()) {
            setResults([])        // sem texto, limpa resultados
            return
        }
        const timer = setTimeout(async () => {
            try {
                // Chama o endpoint /api/search?q=<query>
                const { data } = await api.get('/search', { params: { q: query } })
                setResults(data)     // atualiza resultados
            } catch (err) {
                console.error('Erro a pesquisar:', err)
                setResults([])       // em caso de erro, limpa
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Fecha o dropdown de sugestões ao clicar fora da searchbar ← ADDED
    useEffect(() => {
        function handleSearchClickOutside(e) {
            if (showSearch &&
                searchRef.current &&
                !searchRef.current.contains(e.target)
            ) {
                setShowSearch(false)
                setQuery('')    // opcional: limpa o texto
            }
        }
        document.addEventListener('mousedown', handleSearchClickOutside)
        return () => document.removeEventListener('mousedown', handleSearchClickOutside)
    }, [showSearch])

    // Estado das notificações (sino)
    const [showNotifications, setShowNotifications] = useState(false)
    const notifRef = useRef(null)

    // Estado do utilizador logado (ler do localStorage)
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem('user') || 'null')
    )

    // Atualiza user quando há evento customizado ou mudança noutro tab
    useEffect(() => {
        function onUserUpdated() {
            const stored = localStorage.getItem('user')
            setUser(stored ? JSON.parse(stored) : null)
        }
        window.addEventListener('userUpdated', onUserUpdated)
        window.addEventListener('storage', e => {
            if (e.key === 'user') onUserUpdated()
        })
        return () => {
            window.removeEventListener('userUpdated', onUserUpdated)
            window.removeEventListener('storage', onUserUpdated)
        }
    }, [])

    // Fecha o dropdown de notificações ao clicar fora
    useEffect(() => {
        function handleClickOutside(e) {
            if (showNotifications &&
                notifRef.current &&
                !notifRef.current.contains(e.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotifications])

    return (
        <div className="topIcons">
            {/* === Search Bar === */}
            <div
                className={`searchContainerIcon${showSearch ? ' active' : ''}`}
                ref={searchRef}
            >
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
                        setQuery('')    // ao abrir, limpar query
                    }}
                />
                {/* Sugestões */}
                {showSearch && results.length > 0 && (
                    <ul className="suggestionsIcon">
                        {results.map(r => {
                            // Extrair diretamente da resposta da API
                            const { type, id, title, subtitle, imageUrl } = r
                            let to = ''
                            let thumbClass = ''

                            if (type === 'Playlist') {
                                // id = "username/playlistName"
                                const [owner, name] = id.split('/')
                                to = `/playlist/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
                                thumbClass = 'playlistThumbIcon'
                            } else if (type === 'Song') {
                                to = `/player/${id}`
                                thumbClass = 'songThumbIcon'
                            } else { // User
                                to = `/profile/${encodeURIComponent(id)}`
                                thumbClass = 'userThumbIcon'
                            }

                            return (
                                <NavLink
                                    key={`${type}-${id}`}
                                    to={to}
                                    className="suggestionItemIcon"
                                    onClick={() => setShowSearch(false)}
                                >
                                    <div
                                        className={`suggestionThumbIcon ${thumbClass}`}
                                        style={{
                                            backgroundImage: imageUrl
                                                // se houver imagem, monta a url completa ao servidor
                                                ? `url(${baseUrl}/${imageUrl})`
                                                // caso contrário, usa placeholder local
                                                : `url(/placeholder.png)`
                                        }}
                                    />

                                    <div className="suggestionTextIcon">
                                        <div className="suggestionTitleIcon">
                                            {title}
                                            {(type === 'Playlist' || type === 'Song') && (
                                                <span className="suggestionTypeIcon"> – {type}</span> // ← ALTERAÇÃO: label do tipo
                                            )}
                                        </div>
                                        {(type === 'Playlist' || type === 'Song') && subtitle && (
                                            <div className="suggestionSubtitleIcon">{subtitle}</div>
                                        )}
                                    </div>
                                </NavLink>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* === Notificações (sino) === */}
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

            {/* === Achievements === */}
            <NavLink
                to="/achievements"
                className={({ isActive }) =>
                    `topIcon${isActive ? ' active' : ''}`
                }
                title="Achievements"
            >
                <FiAward />
            </NavLink>

            {/* === Avatar do Utilizador === */}
            <NavLink
                to={`/profile/${user?.username}`}
                end
                className={({ isActive }) =>
                    `userAvatarContainer${isActive ? ' active' : ''}`
                }
                title="Profile"
            >
                {user?.foto ? (
                    <div
                        className="userAvatar"
                        style={{
                            backgroundImage: `url(${baseUrl}${user.foto.startsWith('/') ? '' : '/'}${user.foto})`
                        }}
                    />
                ) : (
                    <FiUser className="userAvatarFallback" />
                )}
            </NavLink>
        </div>
    )
}
