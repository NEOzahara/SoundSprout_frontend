import React, { useState, useRef, useLayoutEffect } from 'react';
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
import {NavLink} from "react-router-dom";
import { musics } from '../../data/musics';

export default function LibraryMusicsPage() {
    const [view, setView] = useState('list');
    const [recentAsc, setRecentAsc] = useState(true);
    const filterRef = useRef(null);
    const [filterOverflow, setFilterOverflow] = useState(false);

    useLayoutEffect(() => {
        const el = filterRef.current;
        if (el) setFilterOverflow(el.scrollWidth > el.clientWidth);
    }, []);

    const toggleRecent = () => setRecentAsc(p => !p);

    return (
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

                <FiSearch className="toolbarIcon toolbarItem searchItem" />

                <FiPlus className="toolbarIcon addIcon" />
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
                            <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />

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
    );
}
