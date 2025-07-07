import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { FiSearch, FiBell, FiAward, FiUser } from 'react-icons/fi'
import { testPlaylists, testMusics, testUsers } from '../../data/test'

export default function TopIcons() {

    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])

    // Sempre que a query muda, faz filtro simples
    useEffect(() => {
        const q = query.trim().toLowerCase()
        if (!q) {
            setResults([])
            return
        }
        const pMatches = testPlaylists
            .filter(p => p.title.toLowerCase().includes(q))
            .map(p => ({ type: 'Playlist', id: p.id }))
        const mMatches = testMusics
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({ type: 'Song',     id: m.id }))
        const uMatches = testUsers
            .filter(u => u.name.toLowerCase().includes(q))
            .map(u => ({ type: 'User',     id: u.id }))

        setResults([ ...pMatches, ...mMatches, ...uMatches ])
    }, [query])

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
                    <ul className="suggestions">
                        {results.map(r => {
                            // Resolve o item completo e define thumb + subtitle
                            let item, subtitle, thumbClass, imageUrl
                            if (r.type === 'Playlist') {
                                item       = testPlaylists.find(p => p.id === r.id)
                                subtitle   = item.owner      // ex.: "Alice"
                                thumbClass = 'playlistThumb'
                                imageUrl   = item.imageUrl   // podes adicionar em test.js
                            } else if (r.type === 'Song') {
                                item       = testMusics.find(m => m.id === r.id)
                                subtitle   = item.artist     // ex.: "Artist A"
                                thumbClass = 'songThumb'
                                imageUrl   = item.imageUrl
                            } else {
                                item       = testUsers.find(u => u.id === r.id)
                                subtitle   = 'Artista'
                                thumbClass = 'userThumb'
                                imageUrl   = item.avatarUrl
                            }

                            return (
                                <li key={`${r.type}-${r.id}`} className="suggestionItem">
                                    <div
                                        className={`suggestionThumb ${thumbClass}`}
                                        style={{
                                            backgroundImage: `url(${imageUrl || '/placeholder.png'})`
                                        }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">
                                            {item.title || item.name}
                                        </div>
                                        <div className="suggestionSubtitle">
                                            {subtitle}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <FiBell className="topIcon" />
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
