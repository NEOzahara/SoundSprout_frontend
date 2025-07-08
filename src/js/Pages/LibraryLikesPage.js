import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { FiList, FiGrid, FiArrowUp, FiArrowDown, FiFilter, FiSearch, FiPlus, FiMoreHorizontal, FiHeart, FiMessageCircle } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
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

    // === autocomplete ===
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery]           = useState("");
    const [results, setResults]       = useState([]);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (!q) return setResults([]);
        // filtra playlists + músicas
        const pMatches = playlists
            .filter(p => p.title.toLowerCase().includes(q))
            .map(p => ({
                type:     "Playlist",
                id:        p.id,
                title:     p.title,
                subtitle:  p.owner,
                imageUrl:  p.imageUrl
            }));
        const mMatches = musics
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({
                type:     "Song",
                id:        m.id,
                title:     m.title,
                subtitle:  m.artist,
                imageUrl:  m.imageUrl
            }));
        setResults([ ...pMatches, ...mMatches ]);
    }, [query]);

    const location = useLocation();

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
                <div className={`searchContainerLib${showSearch ? ' active' : ''}`}>
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
                    {showSearch && results.length>0 && (
                        <ul className="suggestionsLib">
                            {results.map(r=>(
                                <li key={`${r.type}-${r.id}`} className="suggestionItem">
                                    <div
                                        className={`suggestionThumb ${r.type==='Playlist'? 'playlistThumb':'songThumb'}`}
                                        style={{ backgroundImage: `url(${r.imageUrl||'/placeholder.png'})` }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{r.title}</div>
                                        <div className="suggestionSubtitle">{r.subtitle}</div>
                                    </div>
                                </li>
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