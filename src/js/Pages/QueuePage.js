// src/pages/QueuePage.js
import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import {
    FiList,
    FiGrid,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiSearch,
    FiHeart,
    FiMessageCircle,
    FiMoreHorizontal,
} from 'react-icons/fi';
import '../../css/Pages/LibraryPlaylists.css';
import '../../css/Pages/LibraryMusics.css';
import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { musics } from '../../data/musics';

export default function QueuePage() {
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

    const toggleRecent = () => setRecentAsc(p => !p);

    const location = useLocation();

    return (
        <>
            <div className="librarySection">
                {/* título alterado para "Queue" */}
                <h1 className="libraryTitle">Queue</h1>

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
                                            setShowSearch(false);
                                            setQuery('');
                                        }}
                                    >
                                        <div
                                            className="suggestionThumb songThumb"
                                            style={{
                                                backgroundImage: `url(${m.imageUrl || '/placeholder.png'})`
                                        }}
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
        </>
    );
}
