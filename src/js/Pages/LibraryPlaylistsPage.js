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

    const playlists = [
        { title: 'Roadtrip Classics', owner: 'Alice', songs: 42, duration: '2:35:12', likes: '1.2K' },
        { title: 'Jazz Vibes', owner: 'Bob', songs: 27, duration: '1:47:05', likes: '980'  },
        { title: 'Top Hits', owner: 'Carol', songs: 50, duration: '3:05:33', likes: '2.3K' },
        { title: 'Country Classics', owner: 'Steve', songs: 42, duration: '2:35:12', likes: '1.2K' },
        { title: 'House Vibes', owner: 'Larry', songs: 27, duration: '1:47:05', likes: '980'  },
        { title: 'Classic Hits', owner: 'John', songs: 50, duration: '3:05:33', likes: '2.3K' },
        { title: 'Blues Classics', owner: 'Matilda', songs: 42, duration: '2:35:12', likes: '1.2K' },
        { title: 'Rock Concerts', owner: 'Daniel', songs: 27, duration: '1:47:05', likes: '980'  },
        { title: 'Hip-Pop Hits', owner: 'Henry', songs: 50, duration: '3:05:33', likes: '2.3K' },
        { title: 'Old Classics', owner: 'Maria', songs: 42, duration: '2:35:12', likes: '1.2K' },
        { title: 'Study Vibes', owner: 'Jeff', songs: 27, duration: '1:47:05', likes: '980'  },
        { title: 'Radio Hits', owner: 'Sammy', songs: 50, duration: '3:05:33', likes: '2.3K' },

        // ... mais items
    ];

    return (
        <div className="librarySection">
            <h1 className="libraryTitle">Library &gt; Playlists</h1>
            <div className="libraryToolbar">
                {/* wrapper view-toggle com glow */}
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
                        <div key={idx} className="trackRow">
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
                            <span className="playlistLikesCount">{pl.likes}</span>
                            <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
