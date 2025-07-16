import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
    FiShuffle,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiSearch,
    FiMoreHorizontal,
    FiHeart,
    FiMessageCircle
} from 'react-icons/fi';
import api from '../services/api';
import '../../css/Pages/Playlist.css';  // reaproveita estilos de lista

export default function GenrePlaylistPage() {
    const { genreName } = useParams();                     // /genre/:genreName
    const [tracks, setTracks]     = useState([]);
    const [durations, setDurations] = useState({});
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    // estados para toolbar (mesmos do PlaylistPage)
    const [isPlaying, setIsPlaying] = useState(false);
    const [recentAsc, setRecentAsc] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');

    // 1) fetch das músicas
    useEffect(() => {
        api.get(`/musicas/genres/${encodeURIComponent(genreName)}`)
            .then(({ data }) => setTracks(data))
            .catch(err => console.error('Erro ao carregar género:', err));
    }, [genreName]);

    // 2) metadata de duração idêntica ao PlaylistPage
    useEffect(() => {
        tracks.forEach(track => {
            const raw = track.pathFicheiro ?? track.pathficheiro;
            if (!raw) return;
            const normalized = raw.startsWith('/') ? raw : `/${raw}`;
            const src = `${baseUrl}${normalized}`;
            const audio = new Audio(src);
            audio.addEventListener('loadedmetadata', () => {
                const d = audio.duration;
                const m = Math.floor(d/60);
                const s = Math.round(d%60).toString().padStart(2,'0');
                setDurations(prev => ({ ...prev, [track.id]: `${m}:${s}` }));
            });
        });
    }, [tracks, baseUrl]);

    // 3) ordenação + pesquisa (igual PlaylistPage)
    const displayedTracks = useMemo(() => {
        let arr = recentAsc ? [...tracks] : [...tracks].reverse();
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            arr = arr.filter(m => m.titulo.toLowerCase().includes(q));
        }
        return arr;
    }, [tracks, recentAsc, query]);

    if (!tracks) return <div>Loading…</div>;

    return (
        <div className="playlistSection">
            {/* Header adaptado: só título */}
            <div className="playlistHeader">
                <div className="playlistMain">
                    <div className="playlistDetails">
                        <span className="playlistTitle">{genreName} Playlist</span>
                    </div>
                </div>
            </div>

            {/* === Linha separadora (tabDivider) dentro de container === */}
            <div className="playlistTabsContainer">
                <hr className="playlistTabDivider"/>
            </div>

            {/* === Toolbar (icons) === */}
            <div className="playlistToolbar">
                <div className="playlistViewToggleWrapper">
                    {/* Play/Pause */}
                    <div className="playlistIconButtonWrapper alwaysGlow">
                        <div className="playlistIconGlow" />
                        <button
                            className="playlistPageIconButton noHover"
                            onClick={() => setIsPlaying(p => !p)}
                        >
                            {isPlaying ? (
                                /* pause icon */
                                <svg
                                    className="playlistToggleIcon"
                                    width="22" height="22"
                                    viewBox="0 0 22 22"
                                    fill="#e0e0e0" stroke="#e0e0e0" strokeWidth="1.5"
                                    strokeLinejoin="round"
                                >
                                    <rect x="4" y="4" width="4" height="14" />
                                    <rect x="14" y="4" width="4" height="14" />
                                </svg>
                            ) : (
                                /* play icon */
                                <svg
                                    className="playlistToggleIcon"
                                    width="22" height="22"
                                    viewBox="0 0 22 22"
                                    fill="#e0e0e0" stroke="#e0e0e0" strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <polygon points="6,4 18,11 6,18" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {/* Shuffle */}
                    <div className="playlistIconButtonWrapper">
                        <button className="playlistPageIconButton gridOnly">
                            <FiShuffle className="playlistIcon playlistGridIcon" />
                        </button>
                    </div>
                </div>

                {/* Recent toggle */}
                <div
                    className="playlistToolbarItem playlistRecentItem"
                    onClick={() => setRecentAsc(p => !p)}
                >
                    <div className="playlistOrderIcons">
                        <FiArrowUp   className={`playlistOrderIcon${recentAsc ? ' active' : ''}`}/>
                        <FiArrowDown className={`playlistOrderIcon${recentAsc ? '' : ' active'}`}/>
                    </div>
                    <span className="playlistToolbarText">Recent</span>
                </div>

                {/* Filter placeholder */}
                <FiFilter className="playlistToolbarIcon playlistToolbarItem playlistFilterItem" />
                <span className="playlistToolbarText playlistToolbarItem">
          Filter: All
        </span>

                {/* Autocomplete search */}
                <div className={`searchContainerLib${showSearch ? ' active' : ''}`}>
                    {showSearch && (
                        <input
                            className="searchInputLib"
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search music..."
                            autoFocus
                        />
                    )}
                    <FiSearch
                        className="playlistToolbarIcon playlistToolbarItem playlistSearchItem"
                        onClick={() => {
                            setShowSearch(b => !b);
                            setQuery('');
                        }}
                    />
                    {showSearch && displayedTracks.length > 0 && (
                        <ul className="suggestionsLib">
                            {displayedTracks.map(m => (
                                <li key={m.id} className="suggestionItem">
                                    <NavLink
                                        to={`/player/${m.id}`}
                                        onClick={() => setShowSearch(false)}
                                        className="suggestionText"
                                    >
                                        <div className="suggestionTitle">{m.titulo}</div>
                                        <div className="suggestionSubtitle">{m.username}</div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* More options */}
                <FiMoreHorizontal className="playlistToolbarIcon playlistAddIcon" />
            </div>

            {/* lista de músicas */}
            <div className="playlistContent">
                <div className="playlistSongList">
                    {displayedTracks.map((track, idx) => (
                        <NavLink
                            key={track.id}
                            to={`/player/${track.id}`}
                            className="trackRow"
                        >
                            <span className="trackNumber">{idx+1}</span>
                            <div
                                className="coverPlaceholderSmall"
                                style={{
                                    backgroundImage: track.foto
                                        ? `url(${baseUrl}/${track.foto})`
                                        : undefined
                                }}
                            />
                            <div className="trackInfoSmall">
                                <span className="smallTitle">{track.titulo}</span>
                                <NavLink
                                    to={`/profile/${encodeURIComponent(track.username)}`}
                                    className="smallArtist"
                                >
                                    {track.username}
                                </NavLink>
                            </div>
                            <span className="smallDuration">{durations[track.id] || '--:--'}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}
