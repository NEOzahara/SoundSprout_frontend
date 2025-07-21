import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiUser } from 'react-icons/fi'
import api from '../services/api'

export default function TopIconsLoggedOff() {
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery]       = useState('')
    const [results, setResults]   = useState([])
    const searchRef               = useRef(null)

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')

    // Debounce de 300ms para pesquisa
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const { data } = await api.get('/search', { params: { q: query } })
                setResults(data)
            } catch {
                setResults([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    // Fecha a search ao clicar fora
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                showSearch &&
                searchRef.current &&
                !searchRef.current.contains(e.target)
            ) {
                setShowSearch(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showSearch])

    return (
        <div className="topIcons">
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
                        setShowSearch(v => !v)
                        setQuery('')
                    }}
                />

                {showSearch && results.length > 0 && (
                    <ul className="suggestionsIcon">
                        {results.map(r => {
                            const { type, id, title, subtitle, imageUrl } = r
                            const thumbClass =
                                type === 'Playlist'
                                    ? 'playlistThumbIcon'
                                    : type === 'Song'
                                        ? 'songThumbIcon'
                                        : 'userThumbIcon'

                            return (
                                <li
                                    key={`${type}-${id}`}
                                    className="suggestionItemIcon"
                                    onClick={() => {
                                        console.log(`Selecionado: ${type} "${title}"`)
                                        setShowSearch(false)
                                    }}
                                >
                                    <div
                                        className={`suggestionThumbIcon ${thumbClass}`}
                                        style={{
                                            backgroundImage: imageUrl
                                                ? `url(${baseUrl}/${imageUrl})`
                                                : `url(/placeholder.png)`
                                        }}
                                    />
                                    <div className="suggestionTextIcon">
                                        <div className="suggestionTitleIcon">
                                            {title}
                                            {(type === 'Playlist' || type === 'Song') && (
                                                <span className="suggestionTypeIcon"> – {type}</span>
                                            )}
                                        </div>
                                        {(type === 'Playlist' || type === 'Song') && subtitle && (
                                            <div className="suggestionSubtitleIcon">
                                                {subtitle}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <div className="guestBox">Guest User</div>
        </div>
    )
}
