import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useContext } from 'react';
import {
    FiList,
    FiGrid,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiSearch,
    FiPlus,
    FiHeart,
    FiMessageCircle,
    FiMoreHorizontal,
} from 'react-icons/fi';
import '../../css/Pages/LibraryPlaylists.css';
import '../../css/Pages/LibraryMusics.css';
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import { PlayerContext } from '../../context/PlayerContext';
import { createPortal } from 'react-dom';
import api from '../services/api';

export default function LibraryMusicsPage() {

    const { setTrack } = useContext(PlayerContext);

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    const username = stored?.username;

    // lista das músicas carregadas pelo user
    const [musicsList, setMusicsList] = useState([]);
    // durações calculadas { [musicId]: "M:SS" }
    const [durations, setDurations] = useState({});

    const [likedTracks, setLikedTracks] = useState({});

    const [view, setView] = useState('list');
    const [recentAsc, setRecentAsc] = useState(true);
    const filterRef = useRef(null);
    const [filterOverflow, setFilterOverflow] = useState(false);

    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    // === buscar músicas do próprio utilizador ===
    const fetchUserMusics = async () => {
        if (!username) return;
        try {
            const { data } = await api.get(
                `/musicas/utilizador/${encodeURIComponent(username)}`
            );
            setMusicsList(data);
        } catch (err) {
            console.error('Erro ao carregar músicas:', err);
        }
    };

    useEffect(() => {
        fetchUserMusics();
        window.addEventListener('musicsUpdated', fetchUserMusics);
        return () => window.removeEventListener('musicsUpdated', fetchUserMusics);
        }, [username]);

    useEffect(() => {
        if (!musicsList.length) return;
        musicsList.forEach(m => {
            api.get(`/musicas/${m.id}/is-liked`)
                .then(({ data }) =>
                    setLikedTracks(prev => ({ ...prev, [m.id]: data.liked }))
                )
                .catch(err => console.error('Erro ao buscar is-liked:', err));
        });
    }, [musicsList]);

    // === calcular duração de cada ficheiro de áudio ===
    useEffect(() => {
        musicsList.forEach(m => {
            const audio = new Audio();
            // Apontamos ao nosso endpoint de stream para carregar os metadados
            audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${m.id}`;
            audio.preload = 'metadata';
            audio.addEventListener('loadedmetadata', () => {
                const d = audio.duration;
                const mins = Math.floor(d / 60);
                const secs = Math.round(d % 60).toString().padStart(2, '0');
                setDurations(prev => ({ ...prev, [m.id]: `${mins}:${secs}` }));
            });
            audio.addEventListener('error', () => {
                setDurations(prev => ({ ...prev, [m.id]: '--:--' }));
            });
            audio.load();
        });
    }, [musicsList]);

    async function toggleTrackLike(musicId) {
        try {
            if (likedTracks[musicId]) {
                await api.delete(`/musicas/like/${musicId}`);
                setLikedTracks(prev => ({ ...prev, [musicId]: false }));
            } else {
                await api.post('/musicas/like', { id: musicId });
                setLikedTracks(prev => ({ ...prev, [musicId]: true }));
            }
            window.dispatchEvent(new Event('likeChanged'));
        } catch (err) {
            console.error('Erro ao (un)like:', err);
        }
    }

    // === estados do autocomplete ===
    const searchRef = useRef(null);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return musicsList
            .filter(m => m.titulo.toLowerCase().includes(q))
            .map(m => ({
                id: m.id,
                title: m.titulo,
                username: m.username,
                foto: m.foto
            }));
    }, [query, musicsList]);

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

    // === ordenar por dataPublicacao ===
    const displayedMusics = useMemo(() => {
        const sorted = [...musicsList].sort((a, b) => {
            const dA = new Date(a.dataPublicacao);
            const dB = new Date(b.dataPublicacao);
            return recentAsc ? dA - dB : dB - dA;
        });
        return sorted;
    }, [musicsList, recentAsc]);

    const handleClickTitle = m => e => {
        e.preventDefault();

        api.post('/musicas/visualizar', { musica_id: m.id })
            .catch(err => console.error('Erro ao registar visualização:', err));

        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
            setTrack({
                id: m.id,
                title: m.titulo,
                artist: m.username,
                coverUrl: m.foto ? `${baseUrl}/${m.foto.replace(/^\/+/, '')}` : '',
                duration: audio.duration
            });
        });
        // usa o mesmo endpoint de stream do PlayerBar
        audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${m.id}`;
        audio.load();
    };

    // --- estados do modal “New Song” ---
    const [createSongOpen, setCreateSongOpen] = useState(false);
    const [newSongName, setNewSongName] = useState('');
    const [newAudioFile, setNewAudioFile] = useState(null);
    const [audioDragOver, setAudioDragOver] = useState(false);
    const audioRef = useRef(null);

    const [newSongCover, setNewSongCover] = useState(null);
    const [songCoverDrag, setSongCoverDrag] = useState(false);
    const songCoverRef = useRef(null);

    const [newLyricFile, setNewLyricFile] = useState(null);
    const [lyricDragOver, setLyricDragOver] = useState(false);
    const lyricRef = useRef(null);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    const closeAll = () => {
        setCreateSongOpen(false);
        setNewSongName('');
        setNewAudioFile(null);
        setNewSongCover(null);
        setNewLyricFile(null);
        setError(null);
        setSuccess(false);
        setAudioDragOver(false);
        setSongCoverDrag(false);
        setLyricDragOver(false);
    };

    const handleConfirmSong = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!newSongName || !newAudioFile) {
            setError('Título e ficheiro de áudio são obrigatórios.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('audio', newAudioFile);
            formData.append('titulo', newSongName);
            if (newSongCover) formData.append('foto', newSongCover);
            if (newLyricFile) formData.append('lyric', newLyricFile);

            const { data } = await api.post('/musicas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Música publicada:', data);
            setSuccess(true);
            closeAll();
            // 1) adiciona nova música localmente
            setMusicsList(prev => [data, ...prev]);
            // 2) dispara evento para Menu.js atualizar submenu
            window.dispatchEvent(new Event('musicsUpdated'));
        } catch (err) {
            console.error('Erro ao publicar música:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Erro ao publicar música');
        }
    };


    const toggleRecent = () => setRecentAsc(p => !p);

    const location = useLocation();

    return (
        <>
            <div className="librarySection">
                <h1 className="libraryTitle">Library &gt; Music</h1>

                <div className="libraryToolbar">
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
                            className="toolbarIcon toolbarItem searchItem"
                            onClick={() => {
                                setShowSearch(b => !b);
                                setQuery('');
                            }}
                        />
                        {showSearch && query.trim() !== '' && results.length > 0 && (
                            <ul className="suggestionsLib">
                                {results.map(item => (
                                    <li key={item.id} className="suggestionItem">
                                        <NavLink
                                            to={`/player/${item.id}`}
                                            className="suggestionItemLib"
                                            onClick={() => {
                                                // fecha o autocomplete
                                                setShowSearch(false);
                                                setQuery('');
                                            }}
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
                                                <div className="suggestionTitleLib">{item.title}</div>
                                                <div className="suggestionSubtitleLib">{item.username}</div>
                                            </div>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <FiPlus
                        className="toolbarIcon addIcon"
                        onClick={() => setCreateSongOpen(true)}
                    />
                </div>

                <div className="libraryTabsContainer">
                    <div className="libraryColumnHeaders"></div>
                    <hr className="tabDivider" />
                </div>

                <div className="libraryContent">
                    <div className="songList">
                        {displayedMusics.map((m, idx) => (
                            <div
                                key={m.id}
                                className="trackRow"
                            >
                                <span className="trackNumber">{idx + 1}</span>

                                <NavLink
                                    to={`/player/${m.id}`}
                                    className="coverPlaceholderSmall"
                                    style={{
                                        backgroundImage: m.foto
                                            ? `url(${baseUrl}/${m.foto.replace(/^\/+/, '')})`
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
                                        to={`/profile/${encodeURIComponent(m.username)}`}
                                        className="smallArtist"
                                    >
                                        {m.username}
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

                                <span className="smallDuration">{durations[m.id] || '--:--'}</span>
                                <span className="smallListens">{m.visualizacoes}</span>

                                <FiMoreHorizontal
                                    className="actionIcon"
                                    onClick={() => console.log('Options')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* --- Modal “New Song” --- */}
            {createSongOpen && createPortal(
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Song</h2>
                        <form onSubmit={handleConfirmSong} noValidate>
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={newSongName}
                                    onChange={e => setNewSongName(e.target.value)}
                                    required
                                />
                            </label>

                            <label>Audio File</label>
                            <div
                                className={`fileDropArea${audioDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setAudioDragOver(true); }}
                                onDragLeave={e => { e.preventDefault(); setAudioDragOver(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setAudioDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewAudioFile(f);
                                }}
                                onClick={() => audioRef.current.click()}
                            >
                                <span className="fileName">
                                    {newAudioFile ? newAudioFile.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => audioRef.current.click()}
                                >
                                    Choose File
                                </button>
                                <input
                                    type="file"
                                    name="audio"
                                    accept="audio/*"
                                    ref={audioRef}
                                    style={{ display: 'none' }}
                                    onChange={e => setNewAudioFile(e.target.files[0] || null)}
                                    required
                                />
                            </div>

                            <label>Cover Image (opcional)</label>
                            <div
                                className={`fileDropArea${songCoverDrag ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setSongCoverDrag(true); }}
                                onDragLeave={e => { e.preventDefault(); setSongCoverDrag(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setSongCoverDrag(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewSongCover(f);
                                }}
                                onClick={() => songCoverRef.current.click()}
                            >
                                <span className="fileName">
                                    {newSongCover ? newSongCover.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => songCoverRef.current.click()}
                                >
                                    Choose File
                                </button>
                                <input
                                    type="file"
                                    name="foto"
                                    accept="image/*"
                                    ref={songCoverRef}
                                    style={{ display: 'none' }}
                                    onChange={e => setNewSongCover(e.target.files[0] || null)}
                                />
                            </div>

                            <label>Lyric File (opcional)</label>
                            <div
                                className={`fileDropArea${lyricDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setLyricDragOver(true); }}
                                onDragLeave={e => { e.preventDefault(); setLyricDragOver(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setLyricDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewLyricFile(f);
                                }}
                                onClick={() => lyricRef.current.click()}
                            >
                                <span className="fileName">
                                    {newLyricFile ? newLyricFile.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => lyricRef.current.click()}
                                >
                                    Choose File
                                </button>
                                <input
                                    type="file"
                                    name="lyric"
                                    accept=".txt"
                                    ref={lyricRef}
                                    style={{ display: 'none' }}
                                    onChange={e => setNewLyricFile(e.target.files[0] || null)}
                                />
                            </div>

                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">Música publicada com sucesso!</p>}

                            <div className="modalButtons">
                                <button type="button" onClick={closeAll}>Cancelar</button>
                                <button type="submit" disabled={!newSongName || !newAudioFile}>
                                    Confirmar
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