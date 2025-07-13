import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../../css/Pages/Explore.css';
import {FiSearch, FiUser} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { testPlaylists, testMusics, testUsers } from '../../data/test';

export default function ExplorePage() {
    // Search bar (mantenho intacto)
    const [query, setQuery] = useState('')
    const results = useMemo(() => {
        // ... mantém o teu autocomplete local se quiseres ...
        return []
    }, [query])

    // Base URL sem “/api” para imagens
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')

    // ─── Estados para cada carrossel ────────────────────────────────
    const [discoverMusics, setDiscoverMusics] = useState([])
    const [genresPlaylists, setGenresPlaylists]   = useState([])
    const [mainPlaylists, setMainPlaylists]       = useState([])
    const [exploreArtists, setExploreArtists]     = useState([])

    // ─── Discover Musics ────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/musicas/discover')
                setDiscoverMusics(data)
            } catch (err) {
                console.error('Erro a carregar Discover Musics:', err)
            }
        }
        load()
    }, [])

    // ─── Genres Playlists ───────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/musicas/genres-playlists')
                // data = [ { genre, songs: [ ... ] }, ... ]
                setGenresPlaylists(data)
            } catch (err) {
                console.error('Erro a carregar Genres Playlists:', err)
            }
        }
        load()
    }, [])

    // ─── Main Curated Playlists ─────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/playlists/playlists-explore')
                setMainPlaylists(data)
            } catch (err) {
                console.error('Erro a carregar Main Playlists:', err)
            }
        }
        load()
    }, [])

    // ─── Explore Artists ────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/utilizadores/explore-artists')
                setExploreArtists(data)
            } catch (err) {
                console.error('Erro a carregar Explore Artists:', err)
            }
        }
        load()
    }, [])

    // ─── Render Functions ──────────────────────────────────────────
    const renderMusicCarrousel = musics =>
        musics
            .slice(0, 8)
            .map(m => (
            <NavLink key={m.id} to={`/player/${m.id}`} className="coverCard">
                {m.foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${m.foto}`}
                        alt={m.titulo}
                    />
                    : <div className="coverPlaceholder" />
                }
                <span className="coverTitle">{m.titulo}</span>
            </NavLink>
        ))

    const renderGenreCarrousel = genres =>
        genres
            .slice(0, 8)
            .map(g => {
            // use a capa da primeira música ou placeholder
            const first = g.songs[0]
            const thumb = first
                ? `${baseUrl}/${first.capa}`
                : '/placeholder.png'
            return (
                <NavLink
                    key={g.genre}
                    to={`/genre/${encodeURIComponent(g.genre)}`}
                    className="coverCard"
                >
                    <div
                        className="coverPlaceholder"
                        style={{
                            backgroundImage: `url(${thumb})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    <span className="coverTitle">{g.genre}</span>
                </NavLink>
            )
        })

    const renderPlaylistCarrousel = pls =>
        pls.map(pl => (
            <NavLink
                key={`${pl.username}::${pl.nome}`}
                to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                className="coverCard"
            >
                {pl.foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${pl.foto}`}
                        alt={pl.nome}
                    />
                    : <div className="coverPlaceholder" />
                }
                <span className="coverTitle">{pl.nome}</span>
            </NavLink>
        ))

    const renderUserCarrousel = users =>
        users.map(u => (
            <NavLink
                key={u.username}
                to={`/profile/${encodeURIComponent(u.username)}`}
                className="coverCard"
            >
                {u.foto
                    ? <img
                        className="profilePlaceholder"
                        src={`${baseUrl}/${u.foto}`}
                        alt={u.username}
                    />
                    : (
                        <div className="profilePlaceholder">
                            <FiUser className="profileIcon" />
                        </div>
                    )}
                <span className="coverTitle">{u.username}</span>
            </NavLink>
        ))

    // ─── Seções com título e carrossel ─────────────────────────────
    const sections = [
        { title: 'Discover',          render: () => renderMusicCarrousel(discoverMusics)      },
        { title: 'Genres',            render: () => renderGenreCarrousel(genresPlaylists)   },
        { title: 'Playlists',         render: () => renderPlaylistCarrousel(mainPlaylists)  },
        { title: 'Artists to Explore',render: () => renderUserCarrousel(exploreArtists)     },
    ]

    return (
        <>
            <div className="searchBarContainer">
                {/*  Ícone de lupa à esquerda, colado na borda interna */}
                <div className="searchWrapper searchContainerExplore">
                    <div
                        className="searchIconWrapper"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIcon" />
                    </div>
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    {results.length > 0 && (
                        <ul className="suggestions">
                            {results.map(r => (
                                <NavLink
                                    key={`${r.type}-${r.id}`}
                                    to={ r.type === 'Playlist'
                                        ? `/playlist/${r.id}`
                                        : r.type === 'Song'
                                            ? `/player/${r.id}`
                                            : `/profile/${encodeURIComponent(r.title)}` }
                                    className="suggestionItem"
                                    onClick={() => setQuery('')}
                                >
                                    <div
                                        className={`suggestionThumb ${
                                            r.type === 'Playlist' ? 'playlistThumb'
                                                : r.type === 'Song'     ? 'songThumb'
                                                    :                         'userThumb'
                                        }`}
                                        style={{
                                            backgroundImage: `url(${r.imageUrl || '/placeholder.png'})`
                                        }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{r.title}</div>
                                        <div className="suggestionSubtitle">{r.subtitle}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="exploreSection">
                {sections.map(({ title, render }, idx) => (
                    <React.Fragment key={idx}>
                        <div className="recommendHeader">
                            <span className="sectionTitle">{title}</span>
                            <button className="seeAll">see all</button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {render()}
                            </div>
                        </div>
                        {idx < sections.length - 1 && <div className="exploreSpacer" />}
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}
