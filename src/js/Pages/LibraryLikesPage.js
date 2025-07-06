import { useState, useRef, useLayoutEffect } from "react";
import { FiList, FiGrid, FiArrowUp, FiArrowDown, FiFilter, FiSearch, FiPlus, FiMoreHorizontal, FiHeart, FiMessageCircle } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { playlists } from "../../data/playlists";
import { musics } from "../../data/musics";
import '../../css/Pages/LibraryLikes.css';

export default function LibraryLikesPage() {
    // Tab ativa: playlists ou songs
    const [activeTab, setActiveTab] = useState("Playlists");

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

    // renderização de playlists (copiado do LibraryPlaylistsPage)
    const renderPlaylists = () => (
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
    );

    // renderização de músicas (copiado do LibraryMusicsPage)
    const renderMusics = () => (
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
                    <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                </NavLink>
            ))}
        </div>
    );

    return (
        <div className="librarySection">
            <h1 className="libraryTitle">Library &gt; Likes</h1>

            <div className="likesTabsWrapper" style={{display: 'flex', gap: '12px', marginBottom: 16}}>
                <button
                    className={`likesTab${activeTab === 'Playlists' ? ' active' : ''}`}
                    onClick={() => setActiveTab('Playlists')}
                >
                    Playlists
                </button>
                <button
                    className={`likesTab${activeTab === 'Songs' ? ' active' : ''}`}
                    onClick={() => setActiveTab('Songs')}
                >
                    Songs
                </button>
            </div>

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
                <FiSearch className="toolbarIcon toolbarItem searchItem" />
                <FiPlus className="toolbarIcon addIcon" />
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