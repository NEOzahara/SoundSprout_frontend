import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
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
import { createPortal } from 'react-dom';
import { musics } from '../../data/musics';
import api from '../services/api';

export default function LibraryMusicsPage() {
    const [view, setView] = useState('list');
    const [recentAsc, setRecentAsc] = useState(true);
    const filterRef = useRef(null);
    const [filterOverflow, setFilterOverflow] = useState(false);

    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    // === estados do autocomplete ===
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return musics
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({
                id: m.id,
                title: m.title,
                artist: m.artist,
                imageUrl: m.imageUrl
            }));
    }, [query]);

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

    // frontend/src/pages/LibraryMusicsPage.jsx
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
            formData.append('titulo', newSongName);
<<<<<<< HEAD
            if (newSongCover) formData.append('foto', newSongCover);
            if (newLyricFile) formData.append('lyric', newLyricFile);

            const { data } = await api.post('/musicas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
=======
            formData.append('audio', newAudioFile);
            if (newSongCover) formData.append('foto', newSongCover);
            if (newLyricFile) formData.append('lyric', newLyricFile);
>>>>>>> 3c466a75586c3dcbd34880f666555c95a8642fda

            const { data } = await api.post('/musicas', formData);
            console.log('Música publicada:', data);
            setSuccess(true);
            closeAll();
        } catch (err) {
            console.error('Erro ao publicar música:', err.response?.data || err);
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
                            className="toolbarIcon toolbarItem searchItem"
                            onClick={() => {
                                setShowSearch(b => !b);
                                setQuery('');
                            }}
                        />
                        {showSearch && results.length > 0 && (
                            <ul className="suggestionsLib">
                                {results.map(m => (
                                    <NavLink
                                        key={m.id}
                                        to={`/player/${m.id}`}
                                        className="suggestionItem"
                                        onClick={() => {
                                            // fecha o autocomplete
                                            setShowSearch(false);
                                            setQuery('');
                                        }}
                                    >
                                        <div
                                            className="suggestionThumb songThumb"
                                            style={{ backgroundImage: `url(${m.imageUrl||'/placeholder.png'})` }}
                                        />
                                        <div className="suggestionText">
                                            <div className="suggestionTitle">{m.title}</div>
                                            <div className="suggestionSubtitle">{m.artist}</div>
                                        </div>
                                    </NavLink>
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
                        {musics.map((m, idx) => (
                            <NavLink
                                key={m.id}
                                to={`/player/${m.id}`}
                                className="trackRow"
                            >
                                <span className="trackNumber">{idx + 1}</span>

                                <div
                                    className="coverPlaceholderSmall"
                                    onClick={() => console.log(`Cover ${idx + 1} clicked`)}
                                />

                                <div className="trackInfoSmall">
                                    <span
                                        className="smallTitle"
                                        onClick={() => console.log(`Title ${idx + 1} clicked`)}
                                    >
                                        {m.title}
                                    </span>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(m.artist)}`}
                                        className="smallArtist"
                                    >
                                        {m.artist}
                                    </NavLink>
                                </div>

                                <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                                <NavLink
                                    to={`/player/${m.id}?comments=true`}
                                    className="actionIcon"
                                >
                                    <FiMessageCircle />
                                </NavLink>

                                <span className="smallDuration" onClick={() => console.log(`Duration ${idx+1}`)}>
                                    {m.duration}
                                </span>
                                <span className="smallListens" onClick={() => console.log(`Listens ${idx+1}`)}>
                                    {m.listens}
                                </span>

                                <FiMoreHorizontal
                                    className="actionIcon"
                                    onClick={() => console.log('Options')}
                                />
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
            {/* --- Modal “New Song” --- */}
            {createSongOpen && createPortal(
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Song</h2>
                        <form onSubmit={handleConfirmSong}>
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