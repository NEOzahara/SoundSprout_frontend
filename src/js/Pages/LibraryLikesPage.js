import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useContext } from "react";
import { FiList, FiGrid, FiArrowUp, FiArrowDown, FiFilter, FiSearch, FiPlus, FiMoreHorizontal, FiHeart, FiMessageCircle } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import api from '../services/api';
import { PlayerContext } from '../../context/PlayerContext';
import '../../css/Pages/LibraryLikes.css';

export default function LibraryLikesPage() {
    // Tab ativa: playlists ou songs
    const [activeTab, setActiveTab] = useState("Playlists");
    const [likedTracks, setLikedTracks] = useState({});
    const [likedPlaylistStatus, setLikedPlaylistStatus] = useState({});
    const [openMenuIdx, setOpenMenuIdx] = useState(null);

    const [followingStatus, setFollowingStatus] = useState({});
    const [trackDurations, setTrackDurations] = useState({});
    const [playlistTracks, setPlaylistTracks]   = useState({});

    useEffect(() => {
        if (openMenuIdx === null) return;
        function handleClickOutside(e) {
            // se o clique não foi dentro de nenhum .moreMenuWrapper, fecha
            if (!e.target.closest('.moreMenuWrapper')) {
                setOpenMenuIdx(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuIdx]);

    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const username = stored?.username;

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const { setTrack } = useContext(PlayerContext);

    // Toolbar e filtros (como nas outras pages)
    const [view, setView] = useState("list");
    const [recentAsc, setRecentAsc] = useState(true);
    const filterRef = useRef(null);
    const [filterOverflow, setFilterOverflow] = useState(false);

    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    const toggleRecent = () => setRecentAsc(p => !p);

    const [likedPlaylists, setLikedPlaylists] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);

    // === autocomplete ===
    const searchRef = useRef(null);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");

    // fecha o dropdown ao clicar fora
    useEffect(() => {
        if (!showSearch) return;
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSearch]);

    // combina playlists + songs em results para autocomplete
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        // playlists que o user gostou
        const pMatches = likedPlaylists
            .filter(pl => pl.playlist_name.toLowerCase().includes(q))
            .map(pl => ({
                type: "Playlist",
                id: `${pl.creator_username}|${pl.playlist_name}`, // só para key
                title: pl.playlist_name,
                subtitle: pl.creator_username,
                imageUrl: pl.playlist_photo
                    ? `${baseUrl}/${pl.playlist_photo.replace(/^\/+/, "")}`
                    : "/placeholder.png"
            }));
        // músicas que o user gostou
        const mMatches = likedSongs
            .filter(m => m.titulo.toLowerCase().includes(q))
            .map(m => ({
                type: "Song",
                id: m.id,
                title: m.titulo,
                subtitle: m.artist_username,
                imageUrl: m.cover
                    ? `${baseUrl}/${m.cover.replace(/^\/+/, "")}`
                    : "/placeholder.png"
            }));
        return [...pMatches, ...mMatches];
    }, [query, likedPlaylists, likedSongs, baseUrl]);

    const location = useLocation();

    const [playlistInfo, setPlaylistInfo] = useState({}); // key -> { songs, likes, duration }

    // 1) busca playlists que o user deu like
    useEffect(() => {
        if (!username) return;
        api.get(`/utilizadores/${username}/recent-playlists-month`)
            .then(({ data }) => setLikedPlaylists(data))
            .catch(err => console.error('Erro a carregar liked playlists:', err));
        }, [username]);

    useEffect(() => {
        if (!username) return;
        api.get(`/utilizadores/${username}/following`)
            .then(({ data }) => {
                // data = [ { following_username, following_photo }, … ]
                const map = {};
                data.forEach(u => map[u.following_username] = true);
                setFollowingStatus(map);
            })
            .catch(console.error);
        }, [username]);

    useEffect(() => {
        likedSongs.forEach(ms => {
            api.get(`/musicas/${ms.id}/is-liked`)
                .then(({ data }) =>
                        setLikedTracks(prev => ({ ...prev, [ms.id]: data.liked }))
                )
                .catch(console.error);
        });
    }, [likedSongs]);

    const handleClickTitle = m => e => {
        e.preventDefault();
        e.stopPropagation();

        const audio = new Audio();
        audio.preload = 'metadata';
        audio.addEventListener('loadedmetadata', () => {
            setTrack({
                id: m.id,
                title: m.titulo,
                artist: m.artist_username,
                coverUrl: m.cover
                    ? `${baseUrl}/${m.cover.replace(/^\/+/, '')}`
                    : '',
                duration: audio.duration
            });
        });
        audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${m.id}`;
        audio.load();
    };

    // 2) para cada playlist gostada, busca metadata e calcula duração total
    useEffect(() => {
        likedPlaylists.forEach(pl => {
            const key = `${pl.creator_username}|${pl.playlist_name}`;

            // 2.a) metadata: nº faixas e likes
            api.get(
                `/playlists/${encodeURIComponent(pl.playlist_name)}/${encodeURIComponent(pl.creator_username)}`
            )
                .then(({ data }) => {
                    setPlaylistInfo(prev => ({
                        ...prev,
                        [key]: {
                            ...prev[key],
                            songs: data.songs,
                            likes: data.listens
                        }
                    }));
                })
                .catch(console.error);

            /*
            // 2.b) lista de faixas e cálculo de duração
            api.get(
                `/playlists/${encodeURIComponent(pl.playlist_name)}/${encodeURIComponent(pl.creator_username)}/musicas`
            )
                .then(({ data: tracks }) => {
                    const prom = tracks.map(t =>
                            new Promise(res => {
                                const audio = new Audio();
                                audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${t.id}`;
                                audio.preload = 'metadata';
                                audio.addEventListener('loadedmetadata', () => res(audio.duration));
                                audio.addEventListener('error', () => res(0));
                                audio.load();
                            })
                    );
                    Promise.all(prom).then(arr => {
                        const total = arr.reduce((a,b)=>a+b,0);
                        const mins = Math.floor(total/60);
                        const secs = Math.round(total%60).toString().padStart(2,'0');
                        const duration = `${mins}:${secs}`;
                        setPlaylistInfo(prev => ({
                            ...prev,
                            [key]: { ...prev[key], duration }
                        }));
                    });
                })
                .catch(console.error);*/
        });
        }, [likedPlaylists]);

    /*useEffect(() => {
        if (!username) return;
        likedPlaylists.forEach(pl => {
            const key = `${pl.creator_username}|${pl.playlist_name}`;
            api
                .get(
                    `/playlists/${encodeURIComponent(pl.playlist_name)}/${encodeURIComponent(
                        pl.creator_username
                    )}/is-liked`
                )
                .then(({ data }) =>
                    setLikedPlaylistStatus(prev => ({ ...prev, [key]: data.liked }))
                )
                .catch(console.error);
        });
    }, [likedPlaylists, username]);*/

        useEffect(() => {
            if (!username) return;

            // 1) busca lista de músicas de cada playlist
            const trackListPromises = likedPlaylists.map(pl => {
                const key = `${pl.creator_username}|${pl.playlist_name}`;
                return api
                    .get(
                        `/playlists/${encodeURIComponent(pl.playlist_name)}/${encodeURIComponent(pl.creator_username)}/musicas`
                    )
                    .then(({ data: tracks }) => ({
                        key,
                        ids: tracks.map(t => t.id)
                    }));
            });

            Promise.all(trackListPromises)
                .then(results => {
                    // guarda mapping playlistKey → [ids]
                    const newMap = {};
                    results.forEach(r => newMap[r.key] = r.ids);
                    setPlaylistTracks(newMap);

                    // descobre quais IDs ainda não temos no cache
                    const toLoad = new Set();
                    results.forEach(r =>
                        r.ids.forEach(id => {
                            if (trackDurations[id] == null) toLoad.add(id);
                        })
                    );
                    return Array.from(toLoad);
                })
                .then(idsToLoad => {
                    // 2) carrega metadados apenas para tracks que faltam
                    const durationPromises = idsToLoad.map(id =>
                        new Promise(res => {
                            const audio = new Audio();
                            audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${id}`;
                            audio.preload = 'metadata';
                            audio.addEventListener('loadedmetadata', () => res([id, audio.duration]));
                            audio.addEventListener('error', () => res([id, 0]));
                            audio.load();
                        })
                    );
                    return Promise.all(durationPromises);
                })
                .then(pairs => {
                    if (pairs.length === 0) return;
                    setTrackDurations(prev => {
                        const next = { ...prev };
                        pairs.forEach(([id, dur]) => next[id] = dur);
                        return next;
                    });
                })
                .catch(console.error);
        }, [likedPlaylists]);

    async function togglePlaylistLike(pl) {
        const key = `${pl.creator_username}|${pl.playlist_name}`;
        try {
            if (likedPlaylistStatus[key]) {
                // remove
                await api.delete(
                    `/playlists/like/${encodeURIComponent(pl.playlist_name)}/${encodeURIComponent(
                        pl.creator_username
                    )}`
                );
                setLikedPlaylistStatus(prev => ({ ...prev, [key]: false }));
                // opcional: remover imediatamente da lista de “Liked Playlists”
                setLikedPlaylists(prev =>
                    prev.filter(p => `${p.creator_username}|${p.playlist_name}` !== key)
                );
            } else {
                // add
                await api.post('/playlists/like', {
                    playlist_nome: pl.playlist_name,
                    playlist_username: pl.creator_username
                });
                setLikedPlaylistStatus(prev => ({ ...prev, [key]: true }));
            }
        } catch (err) {
            console.error('Erro ao (un)like playlist:', err);
        }
    }

    const renderPlaylists = () => (
        <div className="songList">
            {likedPlaylists.map((pl, idx) => {
                const key = `${pl.creator_username}|${pl.playlist_name}`;
                const info = playlistInfo[key] || {};
                const isFollowing = !!followingStatus[pl.creator_username];

                // ── Usa cache para compor duração ────────────────────────
                const ids = playlistTracks[key] || [];
                const totalSec= ids.reduce((sum, id) => sum + (trackDurations[id]||0), 0);
                const mins= Math.floor(totalSec / 60);
                const secs= String(Math.round(totalSec % 60)).padStart(2,'0');
                const duration = ids.length > 0 ? `${mins}:${secs}` : (info.duration ?? '--:--');

                return (
                    <NavLink
                        key={key}
                        to={`/playlist/${encodeURIComponent(pl.creator_username)}/${encodeURIComponent(pl.playlist_name)}`}
                        className="trackRow"
                    >
                        <span className="trackNumber">{idx + 1}</span>

                        <div
                            className="coverPlaceholderSmall"
                            style={{
                                backgroundImage: pl.playlist_photo
                                    ? `url(${baseUrl}/${pl.playlist_photo.replace(/^\/+/,'')})`
                                    : undefined
                        }}
                        />

                        <div className="trackInfoSmall">
                            <NavLink
                                to={`/playlist/${encodeURIComponent(pl.creator_username)}/${encodeURIComponent(pl.playlist_name)}`}
                                className="smallTitle"
                            >
                                {pl.playlist_name}
                            </NavLink>
                            <NavLink
                                to={`/profile/${encodeURIComponent(pl.creator_username)}`}
                                className="smallArtist"
                            >
                                {pl.creator_username}
                            </NavLink>
                        </div>

                        <span className="playlistSongsCount">{info.songs ?? '–'}</span>
                        <span className="playlistTotalDuration">{duration}</span>
                        <span className="playlistLikesCount">{info.likes ?? '–'}</span>

                        <div
                            className="moreMenuWrapper"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                            }}
                        >
                            <FiMoreHorizontal className="actionIcon" />
                            {openMenuIdx === idx && (
                                <ul className={`playlistOptions ${idx + 1 > likedPlaylists.length / 2 ? 'above' : 'below'}`}>
                                    <li
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            togglePlaylistLike(pl);
                                            setOpenMenuIdx(null);
                                        }}
                                    >
                                        {likedPlaylistStatus[key] ? 'Remove Like' : 'Like'}
                                    </li>
                                    <li
                                        onClick={async e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            try {
                                                if (isFollowing) {
                                                    await api.delete(`/utilizadores/seguir/${pl.creator_username}`);
                                                } else {
                                                    await api.post('/utilizadores/seguir', { seguido_username: pl.creator_username });
                                                }
                                                setFollowingStatus(prev => ({
                                                    ...prev,
                                                    [pl.creator_username]: !isFollowing
                                                }));
                                            } catch (err) {
                                                console.error('Erro ao (un)follow:', err);
                                            }
                                            setOpenMenuIdx(null);
                                        }}
                                    >
                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                    </li>
                                </ul>
                            )}
                        </div>
                    </NavLink>
                );
            })}
        </div>
    );

    const [songDurations, setSongDurations] = useState({});
    const [songListens, setSongListens] = useState({});

    // 1) busca músicas que o user deu like
    useEffect(() => {
        if (!username) return;
        api.get(`/utilizadores/${username}/recent-songs-month`)
            .then(({ data }) => setLikedSongs(data))
            .catch(err => console.error('Erro a carregar liked songs:', err));
        }, [username]);

    // 2) para cada música gostada, calcula duração e busca visualizações
    useEffect(() => {
        likedSongs.forEach(ms => {
            // duração via áudio
            const audio = new Audio();
            audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${ms.id}`;
            audio.preload = 'metadata';
            audio.addEventListener('loadedmetadata', () => {
                const mins = Math.floor(audio.duration / 60);
                const secs = Math.round(audio.duration % 60).toString().padStart(2,'0');
                setSongDurations(prev => ({ ...prev, [ms.id]: `${mins}:${secs}` }));
            });
            audio.addEventListener('error', () => {
                setSongDurations(prev => ({ ...prev, [ms.id]: '--:--' }));
            });
            audio.load();

            // visualizações via metadata
            api.get(`/musicas/${ms.id}`)
                .then(({ data }) =>
                        setSongListens(prev => ({ ...prev, [ms.id]: data.visualizacoes }))
                )
                .catch(console.error);
        });
        }, [likedSongs]);

    async function toggleTrackLike(musicId) {
        try {
            const currentlyLiked = likedTracks[musicId];
            if (currentlyLiked) {
                await api.delete(`/musicas/like/${musicId}`);
                // atualiza o estado do coração
                setLikedTracks(prev => ({ ...prev, [musicId]: false }));
                // remove a música logo da lista de likedSongs
                setLikedSongs(prev => prev.filter(m => m.id !== musicId));
                window.dispatchEvent(new Event('likeChanged'));
            } else {
                await api.post('/musicas/like', { id: musicId });
                setLikedTracks(prev => ({ ...prev, [musicId]: true }));
                window.dispatchEvent(new Event('likeChanged'));
            }
        } catch (err) {
            console.error('Erro ao (un)like:', err);
        }
    }

    const renderMusics = () => (
        <div className="songList">
            {likedSongs.map((m, idx) => (
                <NavLink
                    key={m.id}
                    to={`/player/${m.id}`}
                    className="trackRow"
                >
                    <span className="trackNumber">{idx + 1}</span>
                     <div
                        className="coverPlaceholderSmall"
                        style={{
                            backgroundImage: m.cover
                                ? `url(${baseUrl}/${m.cover.replace(/^\/+/,'')})`
                                : undefined
                     }}
                     />

                    <div className="trackInfoSmall">
                        <a
                            href="#!"
                            className="smallTitle"
                            onClick={handleClickTitle(m)}
                        >
                            {m.titulo}
                        </a>
                        <NavLink
                            to={`/profile/${encodeURIComponent(m.artist_username)}`}
                            className="smallArtist"
                        >
                            {m.artist_username}
                        </NavLink>
                    </div>
                    <FiHeart
                        className={`actionIcon${likedTracks[m.id] ? ' liked' : ''}`}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleTrackLike(m.id);
                        }}
                    />
                    <NavLink
                        to={`/player/${m.id}?comments=true`}
                        className="actionIcon"
                    >
                        <FiMessageCircle />
                    </NavLink>

                    <span className="smallDuration">{songDurations[m.id] || '--:--'}</span>
                    <span className="smallListens">{songListens[m.id] ?? '–'}</span>

                    <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                </NavLink>
            ))}
        </div>
    );

    return (
        <div className="librarySection">
            <h1 className="libraryTitle">Library &gt; Likes</h1>
            {/* Toolbar igual às outras páginas */}
            <div className="libraryLikesToolbar">
                <div className="viewToggleWrapper">
                    <div className={`iconButtonWrapper${view === 'list' ? ' active' : ''}`}>
                        {view === 'list' && <div className="iconGlow" />}
                        <button
                            className={`pageIconButton${view === 'list' ? '' : ' inactive'}`}
                            onClick={() => setView('list')}
                        >
                            <FiList className="icon playIcon" />
                        </button>
                    </div>
                    <div className={`iconButtonWrapper${view === 'grid' ? ' active' : ''}`}>
                        {view === 'grid' && <div className="iconGlow" />}
                        <button
                            className={`pageIconButton${view === 'grid' ? '' : ' inactive'}`}
                            onClick={() => setView('grid')}
                        >
                            <FiGrid className="icon playIcon" />
                        </button>
                    </div>
                </div>
                <div className="toolbarItem recentItem" onClick={toggleRecent}>
                    <div className="orderIcons">
                        <FiArrowUp className={`orderIcon${recentAsc ? ' active' : ''}`} />
                        <FiArrowDown className={`orderIcon${recentAsc ? '' : ' active'}`} />
                    </div>
                    <span className="toolbarText">Recent</span>
                </div>
                <FiFilter className="toolbarIcon toolbarItem filterItem" />
                <div
                    ref={filterRef}
                    className={`toolbarText toolbarItem${filterOverflow ? ' marquee' : ''}`}
                >
                    Filter: All
                </div>
                {/* === início autocomplete === */}
                <div ref={searchRef} className={`searchContainerLib${showSearch ? ' active' : ''}`}>
                    {showSearch && (
                        <input
                            className="searchInputLib"
                            type="text"
                            value={query}
                            onChange={e=>setQuery(e.target.value)}
                            placeholder="Search likes..."
                            autoFocus
                        />
                    )}
                    <FiSearch
                        className="toolbarIcon toolbarItem searchItem"
                        onClick={()=>{
                            setShowSearch(b=>!b);
                            setQuery('');
                        }}
                    />
                    {showSearch && query.trim() !== "" && results.length > 0 && (
                        <ul className="suggestionsLib">
                            {results.map(r => (
                                <NavLink
                                    key={`${r.type}-${r.id}`}
                                    to={
                                        r.type === 'Playlist'
                                            ? `/playlist/${encodeURIComponent(r.subtitle)}/${encodeURIComponent(r.title)}`
                                            : `/player/${r.id}`
                                    }
                                    className="suggestionItem"
                                    onClick={() => { setShowSearch(false); setQuery(""); }}
                                >
                                    <div
                                        className={`suggestionThumb ${r.type === 'Playlist' ? 'playlistThumb' : 'songThumb'}`}
                                        style={{ backgroundImage: `url(${r.imageUrl})` }}
                                    />
                                    <div className="suggestionText suggestionTextLikes">
                                        <div className="suggestionType">{r.type}</div>                {/* ← nova linha */}
                                        <div className="suggestionTitle suggestionTitleLikes">{r.title}</div>
                                        <div className="suggestionSubtitle suggestionSubtitleLikes">{r.subtitle}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Tabs estilo PlayerPage */}
            <div className="libraryTabsContainer">
                <div className="likesTabs">
                    {['Playlists', 'Songs'].map(tab => (
                        <button
                            key={tab}
                            className={`likesTab tab${activeTab === tab ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <hr className="tabDivider" />
            </div>

            <div className="libraryContent">
                {activeTab === 'Playlists' ? renderPlaylists() : renderMusics()}
            </div>
        </div>
    );
}