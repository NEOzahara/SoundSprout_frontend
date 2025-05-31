import '../../css/Home.css';
import React, {useRef, useState} from "react";
import {FiPlay, FiHeart, FiPlus, FiMessageCircle, FiList, FiMoreHorizontal, FiUser, FiPause} from 'react-icons/fi';
import '../../css/Player.css';
export default function PlayerPage () {

    const genres = ['Rock', 'Pop', 'Jazz'];// ... mais items
    const userRoles = [
        { name: 'Alice', role: 'Vocal' },
        { name: 'Bob',   role: 'Guitar' },
        { name: 'Carol', role: 'Drums' },
        // ... mais items
    ];

    const [activeTab, setActiveTab] = useState('More Like This');

    const credits = [
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

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause(); else audio.play();
        setIsPlaying(prev => !prev);
    };

    return (
        <div className="playerScroll">
            <div className="playerSection">
                {/* === PARTE SUPERIOR === */}
                <div className="playerDetail">
                    <div className="coverLarge" onClick={() => console.log('Cover clicked')} />

                    <div className="detailInfo">
                        <h1 className="songTitle">Song Name</h1>
                        <p className="songMeta">
                            <span className="metaArtist">Artist Name</span>
                            <span className="metaRest"> — 2025-05-29 — 04:20 — 1.5M listens</span>
                        </p>

                        <div className="playerIcons">
                            <div className="playButtonWrapper">
                                <div className="playGlow" />
                                <button className="playIcon" onClick={togglePlay}>
                                    {isPlaying ? <FiPause className="icon pauseIcon" />
                                                : <FiPlay  className="icon playIcon"  />
                                    }
                                </button>
                            </div>
                            <FiHeart className="playerIcon" onClick={() => console.log('Like clicked')} />
                            <FiPlus className="playerIcon" onClick={() => console.log('Add clicked')} />
                            <FiMessageCircle className="playerIcon" onClick={() => console.log('Comment clicked')} />
                            <FiList className="playerIcon" onClick={() => console.log('Queue clicked')} />
                            <FiMoreHorizontal className="playerIcon" onClick={() => console.log('More clicked')} />
                        </div>

                        <div className="genres">
                            {genres.map((g,i) => (
                                <span key={i} className="genreTag">{g}</span>
                            ))}
                        </div>

                        <div className="userRoles">
                            {userRoles.map((u,i) => (
                                <div key={i} className="userRole">
                                    <FiUser className="userIconPlayer"/>
                                    <div className="userText">
                                        <span className="userName">{u.name}</span>
                                        <span className="userRoleText">{u.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === PARTE INFERIOR === */}
                <div className="tabsContainer">
                    <div className="playerTabs">
                        {['Lyrics','More Like This','Credits'].map(t => (
                            <button
                                key={t}
                                className={`tab${activeTab===t?' active':''}`}
                                onClick={()=>setActiveTab(t)}
                            >{t}</button>
                        ))}
                    </div>
                    <hr className="tabDivider"/>
                </div>

                {/* === CONTEÚDO ABAIXO DAS TABS === */}
                {activeTab === 'Lyrics' ? (
                    <div className="lyricsBox">
                        <p className="lyricsText">
                            {/* Aqui você pode colar toda a letra da música. Exemplo de texto longo: */}
                            Mais, mais um verso que seja suficientemente grande para testar o scroll vertical. Lorem ipsum dolor sit amet,
                            consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum
                            facilisis porta. Sed nec diam eu diam mattis viverra. Nulla fringilla, orci ac euismod semper, magna
                            diam porttitor mauris, quis sollicitudin sapien justo in libero. Fusce vel dui. Donec purus orci, porta
                            quis lacinia ut, interdum a nibh. Aenean at elit in tellus imperdiet ullamcorper. Quisque eu turpis
                            euismod, sodales elit quis, dictum sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                            posuere cubilia curae; Integer blandit lectus mauris, nec ultricies orci vehicula quis. Vivamus non
                            posuere risus. Fusce facilisis nisl turpis, at dictum risus sodales eu. Etiam at volutpat magna. In id
                            libero quis libero suscipit dignissim in nec nunc. Integer pretium augue vitae magna iaculis, sit amet
                            vulputate sapien pharetra. testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                            testtttteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                        </p>
                    </div>
                ) : (
                <div className="songList">
                    {credits.map((item, idx) => (
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
                                    {item.title}
                                </span>
                                <span
                                   className="smallArtist"
                                   onClick={() => console.log(`Artist ${idx+1} clicked`)}
                                >
                                    {item.artist}
                                </span>
                            </div>
                            <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                            <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />
                            <span className="smallDuration" onClick={() => console.log(`Duration ${idx+1}`)}>
                                {item.duration}
                            </span>
                            <span className="smallListens"  onClick={() => console.log(`Listens ${idx+1}`)}>
                                {item.listens}
                            </span>
                            <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};
