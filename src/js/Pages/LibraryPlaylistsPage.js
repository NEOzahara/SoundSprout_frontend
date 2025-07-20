import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import {
    FiList,
    FiGrid,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiSearch,
    FiPlus, FiHeart, FiMessageCircle, FiMoreHorizontal,
} from 'react-icons/fi';
import '../../css/Pages/LibraryPlaylists.css';
import {NavLink} from "react-router-dom";
import { createPortal } from 'react-dom';
import api from '../services/api';

export default function LibraryPlaylistsPage() {

    const formatDuration = totalSec => {
        const h = Math.floor(totalSec/3600);
        const m = Math.floor((totalSec%3600)/60);
        const s = totalSec%60;
        if (h>0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        return `${m}:${s.toString().padStart(2,'0')}`;
    };

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '/');
    const [playlists, setPlaylists] = useState([]);
    const [durations, setDurations] = useState({});

    // 1) obter user auth
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const token  = localStorage.getItem('accessToken');
    const username = stored?.username;
    const isPremium = stored?.premium;

    // 2) fetch das playlists do usuário
    useEffect(() => {
        if (!username) return;
        api.get(`/playlists/utilizador/${username}/library`)
            .then(({ data }) => setPlaylists(data))
            .catch(err => console.error('Erro ao carregar playlists:', err));
    }, [username, token]);

    // 3) para cada playlist, carregar músicas e calcular duração
    useEffect(() => {
        playlists.forEach(pl => {
            api.get(`/playlists/${encodeURIComponent(pl.nome)}/${encodeURIComponent(pl.username)}/musicas`)
                .then(({ data: tracks }) => {
                    const promises = tracks.map(track => {
                        return new Promise(resolve => {
                            const raw = track.pathFicheiro || track.pathficheiro;
                            if (!raw) return resolve(0);
                            const src = `${process.env.REACT_APP_API_BASE_URL.replace(/\/api$/,'')}`
                                + (raw.startsWith('/') ? raw : `/${raw}`);
                            const audio = new Audio(src);
                            audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
                            audio.addEventListener('error', () => resolve(0));
                        });
                    });
                    Promise.all(promises).then(durationsArr => {
                        const totalSec = durationsArr.reduce((sum, d) => sum + d, 0);
                        setDurations(d => ({
                            ...d,
                            [`${pl.nome}|${pl.username}`]: formatDuration(Math.round(totalSec))
                        }));
                    });
                })
                .catch(console.error);
        });
    }, [playlists, token]);

    // qual view está ativa: 'list' ou 'grid'
    const [view, setView] = useState('list');

    // ordem de recent: asc/desc
    const [recentAsc, setRecentAsc] = useState(true);

    // refs para medir overflow de texto "Filter: All" se for o caso
    const filterRef = useRef(null);
    const [filterOverflow, setFilterOverflow] = useState(false);
    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    // === estados para o search-autocomplete ===
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return playlists
            .filter(pl => pl.nome.toLowerCase().includes(q))
            .map(pl => ({
                nome: pl.nome,
                username: pl.username,
                foto: pl.foto
            }));
        }, [query, playlists]);

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

    // --- novos estados para o modal “New Playlist” ---
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
    const [newPlName, setNewPlName] = useState('');
    const [newPlCover, setNewPlCover] = useState(null);
    const [newPlVisibility, setNewPlVisibility] = useState(null);
    const [newPlError, setNewPlError] = useState('');
    const [newPlSuccess, setNewPlSuccess] = useState(false);
    const plCoverRef = useRef(null);
    const [plDragOver, setPlDragOver] = useState(false);

    const closeAll = () => {
        setCreatePlaylistOpen(false);
        setNewPlName('');
        setNewPlCover(null);
        setNewPlVisibility(null);
        setNewPlError('');
        setNewPlSuccess(false);
    };

    const handleConfirmPlaylist = async () => {

        setNewPlError('');
        setNewPlSuccess(false);

        if (!isPremium) {
            setNewPlError("Its required to be a Premium user to create a Playlist");
            return;
        }

        const form = new FormData();
        form.append('nome', newPlName);
        form.append('privacidade', newPlVisibility === 'public' ? 'publico' : 'privado');
        form.append('onlyPremium', 'false');
        form.append('dataCriacao', new Date().toISOString());
        if (newPlCover) form.append('foto', newPlCover);

        try {
            // decide qual endpoint usar
            if (newPlCover) {
                await api.post(
                    '/playlists/with-cover',
                    form,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            } else {
                const priv = newPlVisibility === 'public' ? 'publico' : 'privado';
                await api.post('/playlists', {
                    nome: newPlName,
                    privacidade: priv,
                    onlyPremium: false,
                    foto: null,
                    dataCriacao: new Date().toISOString()
                });
            }
            // atualiza a lista
            const { data: updated } = await api.get(`/playlists/utilizador/${username}/library`);
            setPlaylists(updated);
            setNewPlSuccess(true);

            // fecha modal depois de 2s, dando tempo para ver a mensagem
            setTimeout(closeAll, 2000);
        } catch (err) {
            console.error('Erro ao criar playlist:', err);
            if (err.response?.status === 400 && err.response.data.error.includes('Já existe')) {
                setNewPlError('Já existe uma playlist com esse nome');
            } else {
                setNewPlError('Erro ao criar playlist. Tente novamente.');
            }
        }
    };

    const toggleRecent = () => setRecentAsc((p) => !p);

    return (
        <>
            <div className="librarySection">
                <h1 className="libraryTitle">Library &gt; Playlists</h1>
                <div className="libraryToolbar">
                    <div className="viewToggleWrapper">
                        <div
                            className={`iconButtonWrapper${view==='list' ? ' active' : ''}`}
                        >
                            {view === 'list' && <div className="iconGlow" />}
                            <button
                                className={`pageIconButton${view === 'list' ? '' : ' inactive'}`}
                                onClick={() => setView('list')}
                            >
                                <FiList className="icon playIcon" />
                            </button>
                        </div>

                        <div
                            className={`iconButtonWrapper${view==='grid' ? ' active' : ''}`}
                        >
                            {view === 'grid' && <div className="iconGlow" />}
                            <button
                                className={`pageIconButton${view === 'grid' ? '' : ' inactive'}`}
                                onClick={() => setView('grid')}
                            >
                                <FiGrid className="icon playIcon" />
                            </button>
                        </div>
                    </div>

                    {/* espaçamento 10px após este wrapper */}

                    {/* toggle Recent asc/desc */}
                    <div className="toolbarItem recentItem" onClick={toggleRecent}>
                        <div className="orderIcons">
                            <FiArrowUp
                                className={`orderIcon${recentAsc ? ' active' : ''}`}
                            />
                            <FiArrowDown
                                className={`orderIcon${recentAsc ? '' : ' active'}`}
                            />
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

                    {/* === aqui começa o search-autocomplete === */}
                    <div ref={searchRef} className={`searchContainerLib${showSearch ? ' active' : ''}`}>
                        {showSearch && (
                            <input
                                className="searchInputLib"
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search playlists..."
                                autoFocus
                            />
                        )}
                        <FiSearch
                            className="toolbarIcon toolbarItem searchItem"
                            onClick={() => {
                                setShowSearch(b => !b);
                                setQuery('');
                            }}
                        />
                        {showSearch && query.trim() !== '' && results.length > 0 && (
                            <ul className="suggestionsLib">
                                {results.map(pl => (
                                    <li key={`${pl.username}|${pl.nome}`} className="suggestionItem">
                                        <NavLink
                                            to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                                            className="suggestionItemLib"
                                            onClick={() => {
                                                setShowSearch(false);
                                                setQuery('');
                                            }}
                                        >
                                            <div
                                                className="suggestionThumbLib"
                                                style={{
                                                    backgroundImage: pl.foto
                                                        ? `url(${pl.foto})`
                                                        : `url(/placeholder.png)`
                                            }}
                                            />
                                            <div className="suggestionTextLib">
                                                <div className="suggestionTitleLib">{pl.nome}</div>
                                                <div className="suggestionSubtitleLib">{pl.username}</div>
                                            </div>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* empurra o "+" para a borda direita */}
                    <FiPlus
                        className="toolbarIcon addIcon"
                        onClick={() => setCreatePlaylistOpen(true)}
                    />
                </div>

                {/* === NOVO HEADER STICKY COM COLUNAS === */}
                <div className="libraryTabsContainer">
                    <div className="libraryColumnHeaders">
                        <span className="columnHeader titleHeader">Title</span>
                        <span className="columnHeader songsHeader">Songs</span>
                        <span className="columnHeader durationHeader">Duration</span>
                        <span className="columnHeader likesHeader">Likes</span>
                    </div>
                    <hr className="tabDivider"/>
                </div>

                {/* === AQUI VEM O TEU CONTEÚDO/SONGLIST === */}
                <div className="libraryContent">
                    <div className="songList">
                        {playlists.map((pl, idx) => (
                            <div key={idx} className="trackRow">
                                <span className="trackNumber">{idx+1}</span>

                                {/* cover clicável */}
                                <NavLink
                                    to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                                >
                                    <div
                                        className="coverPlaceholderSmall"
                                        style={{
                                            backgroundImage: pl.foto
                                                ? `url(${
                                                    pl.foto.startsWith('http')
                                                        ? pl.foto
                                                        : `${baseUrl}${pl.foto}`
                                                })`
                                                : undefined
                                        }}
                                    />


                                </NavLink>
                                {/* título clicável */}
                                <div className="trackInfoSmall">
                                    <NavLink
                                        to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                                        className="smallTitle"
                                    >
                                        {pl.nome}
                                    </NavLink>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(pl.username)}`}
                                        className="smallArtist"
                                    >
                                        {pl.username}
                                    </NavLink>
                                </div>
                                <span className="playlistSongsCount">{pl.songs}</span>
                                <span className="playlistTotalDuration">{durations[`${pl.nome}|${pl.username}`] || '–:–'}</span>
                                <span className="playlistLikesCount">{pl.listens}</span>
                                <FiMoreHorizontal
                                    className="actionIcon"
                                    onClick={() => console.log('Options')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === Modal “New Playlist” (usar mesmo CSS de Menu.css) === */}
            {createPlaylistOpen && createPortal(
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Playlist</h2>

                        {/* **ALTERAÇÃO**: mensagens de erro/sucesso */}
                        {newPlError && <div className="modalMessage error">{newPlError}</div>}
                        {newPlSuccess && <div className="modalMessage success">Playlist criada com sucesso</div>}

                        <form onSubmit={e => { e.preventDefault(); handleConfirmPlaylist(); }}>
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={newPlName}
                                    onChange={e => setNewPlName(e.target.value)}
                                    required
                                />
                            </label>

                            <label>Cover Image (optional)</label>
                            <div
                                className={`fileDropArea${plDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setPlDragOver(true); }}
                                onDragLeave={() => setPlDragOver(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setPlDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewPlCover(f);
                                }}
                                onClick={() => plCoverRef.current.click()}
                            >
                                <span className="fileName">
                                    {newPlCover ? newPlCover.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => plCoverRef.current.click()}
                                >Choose File</button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={plCoverRef}
                                    style={{display:'none'}}
                                    onChange={e => setNewPlCover(e.target.files[0]||null)}
                                />
                            </div>

                            <label>
                                Visibility
                                <select
                                    value={newPlVisibility||''}
                                    onChange={e => setNewPlVisibility(e.target.value||null)}
                                    required
                                >
                                    <option value="" disabled>Choose…</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </label>

                            <div className="modalButtons">
                                <button type="button" onClick={closeAll}>Cancel</button>
                                <button type="submit" disabled={!newPlName||!newPlVisibility}>
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
