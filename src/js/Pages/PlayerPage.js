import React, {useEffect, useRef, useState} from "react";
import {FiPlay, FiHeart, FiPlus, FiMessageCircle, FiList, FiMoreHorizontal, FiUser, FiPause} from 'react-icons/fi';
import '../../css/Pages/Player.css';
import {NavLink, useParams} from "react-router-dom";
import { musics } from '../../data/musics';
export default function PlayerPage () {

    const { songId } = useParams();
    const id = parseInt(songId, 10) || 0;
    const music = musics.find(m => m.id === id) || musics[0];

    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [songId]);

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
        /*Teste*/
        setIsPlaying(prev => !prev);

        /*if (!audio) return;
        if (isPlaying) audio.pause(); else audio.play();
        setIsPlaying(prev => !prev);*/
    };

    // usa diretamente do objeto music
    const { title, artist, date, duration, listens, genres, participants, creditsInfo } = music;

    return (
        <div key={songId} className="playerScroll" ref={scrollRef}>
            <div className="playerSection">
                {/* === PARTE SUPERIOR === */}
                <div className="playerDetail">
                    <div className="coverLarge" onClick={() => console.log('Cover clicked')} />

                    <div className="detailInfo">
                        <h1 className="songTitle">{title}</h1>
                        <p className="songMeta">
                            <span className="metaArtist">{artist}</span>
                            <span className="metaRest">
                                {' '}
                                — {date} — {duration} — {listens} listens
                            </span>
                        </p>

                        <div className="playerIcons">
                            <div className="playButtonWrapper">
                                <div className="playGlow" />
                                <button className="pagePlayButton" onClick={togglePlay}>
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
                            {genres.map((g, i) => (
                                <span key={i} className="genreTag">{g}</span>
                            ))}
                        </div>

                        <div className="userRoles">
                            {participants.map((u, i) => (
                                <div key={i} className="userRole">
                                    <FiUser className="userIconPlayer" />
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
                {activeTab === 'Lyrics' && (
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
                )}

                {activeTab === 'More Like This' && (
                    <div className="songList">
                        {credits.map((item, i) => (
                            <div key={i} className="trackRow">
                                <span className="trackNumber">{i+1}</span>

                                <NavLink to={`/player/${i}`}>
                                    <div className="coverPlaceholderSmall" />
                                </NavLink>

                                <div className="trackInfoSmall">
                                    <NavLink to={`/player/${i}`} className="infoLink">
                                        <span className="smallTitle">{item.title}</span>
                                    </NavLink>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(item.artist)}`}
                                        className="smallArtist"
                                    >
                                        {item.artist}
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
                )}

                {activeTab === 'Credits' && (
                    <div className="creditsBox">
                        {creditsInfo.map((sec, i) => (
                            <div key={i} className="creditSection">
                                <h3 className="creditLabel">{sec.label}:</h3>
                                {sec.names.map((n, j) => (
                                    <p key={j} className="creditName">{n}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
