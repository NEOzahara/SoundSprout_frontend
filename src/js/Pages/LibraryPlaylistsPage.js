import React, { useState, useRef, useLayoutEffect } from 'react';
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
        if (el) {
            setFilterOverflow(el.scrollWidth > el.clientWidth);
        }
    }, []);

    const toggleRecent = () => setRecentAsc((p) => !p);

    return (
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

                <FiSearch className="toolbarIcon toolbarItem searchItem" />

                {/* empurra o "+" para a borda direita */}
                <FiPlus className="toolbarIcon addIcon" />
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
                                <span
                                    className="smallArtist"
                                    onClick={() => console.log(`Artist ${idx+1} clicked`)}
                                >
                                        {pl.owner}
                                    </span>
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
    );
}
