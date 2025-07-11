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
import { playlists } from '../../data/playlists';

export default function LibraryPlaylistsPage() {
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
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return playlists
            .filter(pl => pl.title.toLowerCase().includes(q))
            .map(pl => ({ id: pl.id, title: pl.title, owner: pl.owner, imageUrl: pl.imageUrl }));
    }, [query]);

    // --- novos estados para o modal “New Playlist” ---
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
    const [newPlName, setNewPlName] = useState('');
    const [newPlCover, setNewPlCover] = useState(null);
    const [newPlVisibility, setNewPlVisibility] = useState(null);
    const plCoverRef = useRef(null);
    const [plDragOver, setPlDragOver] = useState(false);

    const closeAll = () => {
        setCreatePlaylistOpen(false);
        setNewPlName('');
        setNewPlCover(null);
        setNewPlVisibility(null);
    };

    const handleConfirmPlaylist = () => {
        console.log({
            name: newPlName,
            cover: newPlCover,
            visibility: newPlVisibility
        });
        closeAll();
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
                    <div className={`searchContainerLib${showSearch ? ' active' : ''}`}>
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
                        {showSearch && results.length > 0 && (
                            <ul className="suggestionsLib">
                                {results.map(pl => (
                                    <NavLink
                                        key={pl.id}
                                        to={`/playlist/${pl.id}`}
                                        className="suggestionItem"
                                        onClick={() => {
                                            // fecha a autocomplete ao navegar
                                            setShowSearch(false);
                                            setQuery('');
                                        }}
                                    >
                                        <div
                                            className="suggestionThumb playlistThumb"
                                            style={{
                                                backgroundImage: `url(${pl.imageUrl || '/placeholder.png'})`
                                            }}
                                        />
                                        <div className="suggestionText">
                                            <div className="suggestionTitle">{pl.title}</div>
                                            <div className="suggestionSubtitle">{pl.owner}</div>
                                        </div>
                                    </NavLink>
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
                            <NavLink
                                key={idx}
                                to={`/playlist/${pl.id}`}
                                className="trackRow"
                            >
                                <span className="trackNumber">{idx+1}</span>
                                <div
                                    className="coverPlaceholderSmall"
                                    onClick={() => console.log(`Cover ${idx+1} clicked`)}
                                />
                                <div className="trackInfoSmall">
                                        <span
                                            className="smallTitle"
                                            onClick={() => console.log(`Title ${idx+1} clicked`)}
                                        >
                                            {pl.title}
                                        </span>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(pl.owner)}`}
                                        className="smallArtist"
                                    >
                                        {pl.owner}
                                    </NavLink>
                                </div>
                                <span className="playlistSongsCount">{pl.songs}</span>
                                <span className="playlistTotalDuration">{pl.duration}</span>
                                <span className="playlistLikesCount">{pl.listens}</span>
                                <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* === Modal “New Playlist” (usar mesmo CSS de Menu.css) === */}
            {createPlaylistOpen && createPortal(
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Playlist</h2>
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
