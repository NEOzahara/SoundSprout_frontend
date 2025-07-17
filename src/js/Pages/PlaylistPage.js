import React, {useState, useMemo, useEffect, useRef } from 'react';
import '../../css/Pages/Playlist.css';
import { eventPlaylists } from '../../data/eventPlaylists';
import { playlists } from '../../data/playlists';
import { musics } from '../../data/musics';
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
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PlaylistPage() {

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const [showDropdown, setShowDropdown] = useState(false);
    const moreRef = useRef(null);
    const navigate = useNavigate();

    const [likedTracks, setLikedTracks] = useState({});
    const [playlistLiked, setPlaylistLiked] = useState(false);
    const [isFollowingCreator, setIsFollowingCreator] = useState(false);

    const { creator, playlistName } = useParams();
    const [meta, setMeta] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [creatorFoto, setCreatorFoto] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recentAsc, setRecentAsc] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    const [durations, setDurations] = useState({});
    const [totalDuration, setTotalDuration] = useState('');
    const [openTrackDropdown, setOpenTrackDropdown] = useState(null);

    useEffect(() => {
        // 1) metadata da playlist
        api.get(`/playlists/${encodeURIComponent(playlistName)}/${encodeURIComponent(creator)}`)
            .then(({ data }) => setMeta(data))
            .catch(err => console.error('Erro metadata:', err));
        // 2) músicas da playlist
        api.get(`/playlists/${encodeURIComponent(playlistName)}/${encodeURIComponent(creator)}/musicas`)
            .then(({ data }) => setTracks(data))
            .catch(err => console.error('Erro músicas:', err));
    }, [creator, playlistName]);

    useEffect(() => {
        tracks.forEach(track => {
            api.get(`/musicas/${track.id}/is-liked`)
                .then(({ data }) => {
                    setLikedTracks(prev => ({ ...prev, [track.id]: data.liked }));
                })
                .catch(err => console.error('Erro is-liked:', err));
        });
    }, [tracks]);

    async function toggleTrackLike(trackId) {
        try {
            if (likedTracks[trackId]) {
                await api.delete(`/musicas/like/${trackId}`);
            } else {
                await api.post('/musicas/like', { id: trackId });
            }
            setLikedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
        } catch (err) {
            console.error('Erro ao (un)like:', err);
        }
    }

    useEffect(() => {
        api.get(`/utilizadores/${encodeURIComponent(creator)}`)
            .then(({ data }) => setCreatorFoto(data.foto))
            .catch(err => console.error('Erro ao obter foto do criador:', err));
    }, [creator]);

    useEffect(() => {
        tracks.forEach(track => {
            // 1) tenta os dois nomes de propriedade
            const raw = track.pathFicheiro ?? track.pathficheiro;
            // 2) se não houver caminho, sai
            if (!raw) {
                console.warn('track sem pathFicheiro:', track);
                return;
            }
            // 3) normaliza a barra
            const normalized = raw.startsWith('/') ? raw : `/${raw}`;
            const src = `${baseUrl}${normalized}`;
            const audio = new Audio(src);
            audio.addEventListener('loadedmetadata', () => {
                const d = audio.duration;
                const m = Math.floor(d / 60);
                const s = Math.round(d % 60).toString().padStart(2, '0');
                setDurations(prev => ({ ...prev, [track.id]: `${m}:${s}` }));
            });
        });
    }, [tracks, baseUrl]);

    useEffect(() => {
        const ids = Object.keys(durations);
        if (!tracks.length || ids.length === 0) return;
        // Somar apenas as tracks cujas durações já temos
        const totalSec = tracks.reduce((sum, track) => {
            const dur = durations[track.id];
            if (!dur) return sum;
            const [min, sec] = dur.split(':').map(Number);
            return sum + min * 60 + sec;
        }, 0);
        const hours = Math.floor(totalSec / 3600);
        const mins  = Math.floor((totalSec % 3600) / 60);
        const secs  = totalSec % 60;
        // Formato condicional: H:MM:SS se houver horas, senão M:SS
        const formatted = hours > 0
            ? `${hours}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
            : `${mins}:${secs.toString().padStart(2,'0')}`;
        setTotalDuration(formatted);
    }, [durations, tracks]);

    // Fecha a search ao clicar fora
    useEffect(() => {
        if (!showSearch) return;
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSearch]);

    useEffect(() => {
        if (!showDropdown) return;
        function handleClickOutside(e) {
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    useEffect(() => {
        if (!meta) return;
        api.get(`/playlists/${encodeURIComponent(playlistName)}/${encodeURIComponent(creator)}/is-liked`)
            .then(({ data }) => setPlaylistLiked(data.liked))
            .catch(console.error);
    }, [meta, creator, playlistName]);

    // 3) Estado inicial de Follow do criador
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const { username: logged } = JSON.parse(stored);
        if (logged === creator) return; // não seguir a si mesmo
        api.get(`/utilizadores/${encodeURIComponent(logged)}/following`)
            .then(({ data }) => {
                const names = data.map(u => u.following_username);
                setIsFollowingCreator(names.includes(creator));
            })
            .catch(console.error);
    }, [creator]);

    useEffect(() => {
        function handleClickOutside() {
            setOpenTrackDropdown(null);
        }
        if (openTrackDropdown !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openTrackDropdown]);

    // lista ordenada / filtrada
    const displayedTracks = useMemo(() => {
        return recentAsc ? [...tracks] : [...tracks].reverse();
    }, [tracks, recentAsc]);

    // sugestões de autocomplete: filtra por título dentro de tracks
    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return tracks
            .filter(m => m.titulo.toLowerCase().includes(q))
            .map(m => ({ id: m.id, titulo: m.titulo, username: m.username, foto: m.foto }));
    }, [tracks, query]);

    const { id: rawId } = useParams();
    const playlist = useMemo(() => {
        // tenta encontrar em eventPlaylists primeiro
        const community = eventPlaylists.find(pl => pl.id === rawId);
        if (community) return community;
        // senão é playlist normal
        const num = Number(rawId);
        return playlists.find(pl => pl.id === num) || {};
    }, [rawId]);

    async function togglePlaylistLike() {
        try {
            if (playlistLiked) {
                await api.delete(
                    `/playlists/like/${encodeURIComponent(playlistName)}/${encodeURIComponent(creator)}`
                );
            } else {
                await api.post('/playlists/like', {
                    playlist_nome: playlistName,
                    playlist_username: creator
                });
            }
            setPlaylistLiked(pl => !pl);
        } catch (err) {
            console.error('Erro ao (un)like playlist:', err);
        }
    }

    // função de toggle Follow/Unfollow do criador
    async function toggleFollowCreator() {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        try {
            if (isFollowingCreator) {
                await api.delete(`/utilizadores/seguir/${encodeURIComponent(creator)}`);
            } else {
                await api.post('/utilizadores/seguir', { seguido_username: creator });
            }
            setIsFollowingCreator(f => !f);
        } catch (err) {
            console.error('Erro ao (un)follow usuário:', err);
        }
        setShowDropdown(false);
    }

    const {
        type = 'Public',
        title = 'Unknown Playlist',
        owner = '',
        listens = '',
        songs = '',
        duration = '',
        trackIds = []
    } = playlist;


    //const [isPlaying, setIsPlaying] = useState(false);
    //const [recentAsc, setRecentAsc] = useState(true);
    const playlistSongs = trackIds
        ? musics.filter(m => trackIds.includes(m.id))
        : musics;

    // === autocomplete ===
    //const [showSearch, setShowSearch] = useState(false);
    //const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return playlistSongs
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({ id: m.id, title: m.title, artist: m.artist }));
    }, [query, playlistSongs]);

    if (!meta) return <div>Loading…</div>;

    return (
        <div className="playlistSection">
            {/* === Seção superior === */}
            <div className="playlistHeader">
                <div className="playlistMain">
                    {/* 1) Quadrado de capa */}
                    <div
                        className="playlistCover"
                        style={{
                            backgroundImage: meta.cover
                                ? `url(${baseUrl}/${meta.cover.replace(/^\/+/, '')})`
                                : undefined
                        }}
                    />

                    {/* 2) Textos */}
                    <div className="playlistDetails">
                        {/* 2.1) Tipo de playlist */}
                        <span className="playlistTypeLabel">{meta.type} Playlist</span>
                        {/* 2.2) Título da playlist */}
                        <span className="playlistTitle">{meta.title}</span>
                        {/* 2.3) Meta (avatar pequeno + texto) */}
                        <div className="playlistMeta">
                            <div
                                className="userAvatarSmall"
                                style={{
                                    backgroundImage: creatorFoto
                                        ? `url(${baseUrl}/${creatorFoto.replace(/^\/+/, '')})`
                                        : undefined
                                }}
                            />
                            <NavLink
                                to={`/profile/${encodeURIComponent(meta.owner)}`}
                                className="metaOwner"
                            >
                                {meta.owner}
                            </NavLink>
                            <span className="metaRest">– {meta.listens} listens – {meta.songs} songs – {totalDuration} total time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Linha separadora (tabDivider) === */}
            <div className="playlistTabsContainer">
                <hr className="playlistTabDivider"/>
            </div>

            {/* === Toolbar (icons) === */}
            <div className="playlistToolbar">
                <div className="playlistViewToggleWrapper">
                    {/* FiList: sempre com glow, dourado */}
                    <div className="playlistIconButtonWrapper alwaysGlow">
                        <div className="playlistIconGlow" />
                        <button
                            className="playlistPageIconButton noHover"
                            onClick={() => setIsPlaying(p => !p)}
                        >
                            {isPlaying ? (
                                <svg
                                    className="playlistToggleIcon"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="#e0e0e0"
                                    stroke="#e0e0e0"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    style={{ display: 'block' }}
                                >
                                    <rect x="4" y="4" width="4" height="14" />
                                    <rect x="14" y="4" width="4" height="14" />
                                </svg>

                            ) : (

                                <svg
                                    className="playlistToggleIcon"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="#e0e0e0"
                                    stroke="#e0e0e0"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    style={{ display: 'block' }}
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <polygon points="6,4 18,11 6,18" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {/* FiGrid: cinza, sem efeitos */}
                    <div className="playlistIconButtonWrapper">
                        <button className="playlistPageIconButton gridOnly">
                            <FiShuffle className="playlistIcon playlistGridIcon" />
                        </button>
                    </div>
                </div>

                <div className="playlistToolbarItem playlistRecentItem" onClick={()=>setRecentAsc(p=>!p)}>
                    <div className="playlistOrderIcons">
                        <FiArrowUp className={`playlistOrderIcon${recentAsc ? ' active' : ''}`}/>
                        <FiArrowDown className={`playlistOrderIcon${recentAsc ? '' : ' active'}`}/>
                    </div>
                    <span className="playlistToolbarText">Recent</span>
                </div>
                <FiFilter className="playlistToolbarIcon playlistToolbarItem playlistFilterItem" />
                <span className="playlistToolbarText playlistToolbarItem">Filter: All</span>

                {/* === autocomplete search === */}
                <div
                    ref={searchRef}
                    className={`searchContainerLib${showSearch ? ' active' : ''}`}
                >
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
                    {showSearch && query.trim() !== '' && suggestions.length > 0 && (
                        <ul className="suggestionsLib">
                            {suggestions.map(item => (
                                <li key={item.id} className="suggestionItem">
                                    <NavLink
                                        to={`/player/${item.id}`}
                                        onClick={() => setShowSearch(false)}
                                        className="suggestionItemLib"
                                    >
                                        <div
                                            className="suggestionThumbLib"
                                            style={{
                                                backgroundImage: item.foto
                                                    ? `url(${baseUrl}/${item.foto.replace(/^\/+/, '')})`
                                                    : undefined
                                            }}
                                        />
                                        <div className="suggestionTextLib">
                                            <div className="suggestionTitleLib">{item.titulo}</div>
                                            <div className="suggestionSubtitleLib">{item.username}</div>
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="moreDropdownWrapper playlistAddIcon" ref={moreRef}>
                    <FiMoreHorizontal
                        className="playlistToolbarIcon playlistAddIcon moreIcon"
                        onClick={() => setShowDropdown(v => !v)}
                    />
                    {showDropdown && (
                        <div className="dropdownMenu">
                            <div className="dropdownItem"
                                 onClick={() => {
                                     togglePlaylistLike();
                                     setShowDropdown(false);
                                 }}
                            >
                                {playlistLiked ? 'Remove Like' : 'Like'}
                            </div>
                            <div className="dropdownItem"
                                 onClick={() => {
                                     toggleFollowCreator();
                                     setShowDropdown(false);
                                 }}
                            >
                                {isFollowingCreator ? 'Unfollow' : 'Follow'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* === Song list === */}
            <div className="playlistContent">
                <div className="playlistSongList">
                    {displayedTracks.map((track, idx) => (
                        <NavLink
                            key={track.id}
                            to={`/player/${track.id}`}
                            className="trackRow"
                            onClick={() => setOpenTrackDropdown(null)}
                        >
                            <span className="trackNumber">{idx + 1}</span>

                            <div
                                className="coverPlaceholderSmall"
                                style={{
                                    backgroundImage: track.foto
                                        ? `url(${baseUrl}/${track.foto.replace(/^\/+/, '')})`
                                        : undefined
                                }}
                                onClick={() => console.log(`Cover ${idx + 1} clicked`)}
                            />

                            <div className="trackInfoSmall">
                                <span
                                    className="smallTitle"
                                    onClick={() => console.log(`Title ${idx+1} clicked`)}
                                >
                                    {track.titulo}
                                </span>
                                <NavLink
                                    to={`/profile/${encodeURIComponent(track.username)}`}
                                    className="smallArtist"
                                >
                                    {track.username}
                                </NavLink>
                            </div>

                            <FiHeart
                                className={`actionIcon${likedTracks[track.id] ? ' liked' : ''}`}
                                onClick={e => {
                                    e.preventDefault(); /* like */
                                    toggleTrackLike(track.id);
                                }} />
                            <div
                                className="actionIcon"
                                onClick={e => {
                                    e.preventDefault();      // não deixa o NavLink pai disparar
                                    e.stopPropagation();     // não propaga o clique para a linha inteira
                                    navigate(`/player/${track.id}?comments=true`);
                                }}
                            >
                                <FiMessageCircle />
                            </div>

                            <span className="smallDuration">{durations[track.id] || '--:--'}</span>
                            <span className="smallListens">{track.visualizacoes}</span>

                            <div className="trackMoreWrapper">
                                <FiMoreHorizontal
                                    className="actionIcon"
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOpenTrackDropdown(track.id);
                                    }}
                                />
                                {openTrackDropdown === track.id && (
                                    <div className="dropdownMenu">
                                        <div
                                            className="dropdownItem"
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            Follow
                                        </div>
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}