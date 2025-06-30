import React, {useState} from 'react';
import '../../css/Pages/Playlist.css';
import { playlists } from '../../data/playlists';
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
        duration = ''
    } = playlist;


    const [isPlaying, setIsPlaying] = useState(false);
    const [recentAsc, setRecentAsc] = useState(true);

    const playlistSongs = [
        { title: 'Song A', artist: 'Artist A', duration: '03:45', listens: '1.2M' },
        { title: 'Song B', artist: 'Artist B', duration: '04:12', listens: '980K' },
        { title: 'Song C', artist: 'Artist B', duration: '03:31', listens: '292K' },
        { title: 'Song D', artist: 'Artist C', duration: '04:44', listens: '1.4K' },
        { title: 'Song E', artist: 'Artist D', duration: '05:11', listens: '431K' },
        { title: 'Song F', artist: 'Artist E', duration: '03:45', listens: '775K' },
        { title: 'Song G', artist: 'Artist E', duration: '03:22', listens: '324K' },
        { title: 'Song H', artist: 'Artist E', duration: '05:37', listens: '2.0K' },
        { title: 'Song I', artist: 'Artist F', duration: '04:15', listens: '858K' },
        { title: 'Song J', artist: 'Artist G', duration: '05:28', listens: '925K' },
        { title: 'Song K', artist: 'Artist H', duration: '04:57', listens: '540K' },
        { title: 'Song L', artist: 'Artist I', duration: '03:36', listens: '716K' },

        // ... mais items
    ];

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
                <FiSearch className="playlistToolbarIcon playlistToolbarItem playlistSearchItem" />
                <FiMoreHorizontal className="playlistToolbarIcon playlistAddIcon" />
            </div>

            {/* === Song list === */}
            <div className="playlistContent">
                <div className="playlistSongList">
                    {playlistSongs.map((item, i) => (
                        <div key={i} className="trackRow">
                            <span className="trackNumber">{i+1}</span>

                            <NavLink to={`/player/${i}`}>
                                <div className="coverPlaceholderSmall" />
                            </NavLink>

                            <div className="trackInfoSmall">
                                <NavLink to={`/player/${i}`} className="infoLink">
                                    <span className="smallTitle">{item.title}</span>
                                </NavLink>
                                <NavLink to={`/player/${i}`} className="infoLink">
                                    <span className="smallArtist">{item.artist}</span>
                                </NavLink>
                            </div>
                            <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                            <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />
                            <span className="smallDuration" onClick={() => console.log(`Duration ${i+1}`)}>
                                    {item.duration}
                                </span>
                            <span className="smallListens"  onClick={() => console.log(`Listens ${i+1}`)}>
                                    {item.listens}
                                </span>
                            <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
