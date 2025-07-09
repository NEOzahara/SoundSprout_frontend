import React, {useState, useMemo } from 'react';
import '../../css/Pages/Playlist.css';
import { playlists } from '../../data/playlists';
import { musics } from '../../data/musics';
import {
    FiShuffle,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiSearch,
    FiMoreHorizontal,
    FiHeart,
    FiMessageCircle
} from 'react-icons/fi';
import { NavLink, useParams } from 'react-router-dom';

export default function PlaylistPage() {

    const { id } = useParams();
    const playlist = playlists.find(pl => pl.id === Number(id)) || {};
    const {
        type = 'Public',
        title = 'Unknown Playlist',
        owner = '',
        listens = '',
        songs = '',
        duration = '',
        trackIds
    } = playlist;


    const [isPlaying, setIsPlaying] = useState(false);
    const [recentAsc, setRecentAsc] = useState(true);
    const playlistSongs = trackIds
        ? musics.filter(m => trackIds.includes(m.id))
        : musics;

    // === autocomplete ===
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return playlistSongs
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({ id: m.id, title: m.title, artist: m.artist }));
    }, [query, playlistSongs]);

    return (
        <div className="playlistSection">
            {/* === Seção superior === */}
            <div className="playlistHeader">
                <div className="playlistMain">
                    {/* 1) Quadrado de capa */}
                    <div className="playlistCover" />

                    {/* 2) Textos */}
                    <div className="playlistDetails">
                        {/* 2.1) Tipo de playlist */}
                        <span className="playlistTypeLabel">{type} Playlist</span>
                        {/* 2.2) Título da playlist */}
                        <span className="playlistTitle">{title}</span>
                        {/* 2.3) Meta (avatar pequeno + texto) */}
                        <div className="playlistMeta">
                            <div className="userAvatarSmall" />
                            <span className="metaOwner">{owner}</span>
                            <span className="metaRest">– {listens} listens – {songs} songs – {duration} total time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Linha separadora (tabDivider) === */}
            <div className="playlistTabsContainer">
                <hr className="playlistTabDivider"/>
            </div>

            {/* === Toolbar (icons) === */}
            <div className="playlistToolbar">
                <div className="playlistViewToggleWrapper">
                    {/* FiList: sempre com glow, dourado */}
                    <div className="playlistIconButtonWrapper alwaysGlow">
                        <div className="playlistIconGlow" />
                        <button
                            className="playlistPageIconButton noHover"
                            onClick={() => setIsPlaying(p => !p)}
                        >
                            {isPlaying ? (
                            <svg
                                className="playlistToggleIcon"
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="#e0e0e0"
                                stroke="#e0e0e0"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                                style={{ display: 'block' }}
                            >
                                <rect x="4" y="4" width="4" height="14" />
                                <rect x="14" y="4" width="4" height="14" />
                            </svg>

                            ) : (

                                <svg
                                    className="playlistToggleIcon"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="#e0e0e0"
                                    stroke="#e0e0e0"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    style={{ display: 'block' }}
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <polygon points="6,4 18,11 6,18" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {/* FiGrid: cinza, sem efeitos */}
                    <div className="playlistIconButtonWrapper">
                        <button className="playlistPageIconButton gridOnly">
                            <FiShuffle className="playlistIcon playlistGridIcon" />
                        </button>
                    </div>
                </div>

                <div className="playlistToolbarItem playlistRecentItem" onClick={()=>setRecentAsc(p=>!p)}>
                    <div className="playlistOrderIcons">
                        <FiArrowUp className={`playlistOrderIcon${recentAsc ? ' active' : ''}`}/>
                        <FiArrowDown className={`playlistOrderIcon${recentAsc ? '' : ' active'}`}/>
                    </div>
                    <span className="playlistToolbarText">Recent</span>
                </div>
                <FiFilter className="playlistToolbarIcon playlistToolbarItem playlistFilterItem" />
                <span className="playlistToolbarText playlistToolbarItem">Filter: All</span>

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
                        className="playlistToolbarIcon playlistToolbarItem playlistSearchItem"
                        onClick={() => {
                            setShowSearch(b => !b);
                            setQuery('');
                        }}
                    />
                    {showSearch && results.length > 0 && (
                        <ul className="suggestionsLib">
                            {results.map(m => (
                                <li key={m.id} className="suggestionItem">
                                    <NavLink
                                        to={`/player/${m.id}`}
                                        onClick={() => setShowSearch(false)}
                                        className="suggestionText"
                                    >
                                        <div className="suggestionTitle">{m.title}</div>
                                        <div className="suggestionSubtitle">{m.artist}</div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <FiMoreHorizontal className="playlistToolbarIcon playlistAddIcon" />
            </div>

            {/* === Song list === */}
            <div className="playlistContent">
                <div className="playlistSongList">
                    {playlistSongs.map((track, idx) => (
                        <NavLink
                            key={track.id}
                            to={`/player/${track.id}`}
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
                                    onClick={() => console.log(`Title ${idx+1} clicked`)}
                                >
                                    {track.title}
                                </span>
                                <NavLink
                                    to={`/profile/${encodeURIComponent(track.artist)}`}
                                    className="smallArtist"
                                >
                                    {track.artist}
                                </NavLink>
                            </div>

                            <span className="playlistTotalDuration">{track.duration}</span>
                            <span className="playlistLikesCount">{track.listens}</span>

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
