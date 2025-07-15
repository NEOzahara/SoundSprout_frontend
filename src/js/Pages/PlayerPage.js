import React, {useEffect, useRef, useState, useMemo, useCallback} from "react";
import {FiPlay, FiHeart, FiPlus, FiMessageCircle, FiList, FiMoreHorizontal, FiUser, FiPause} from 'react-icons/fi';
import '../../css/Pages/Player.css';
import {NavLink, useParams, useLocation} from "react-router-dom";
import { createPortal } from 'react-dom';
import api from '../services/api';
import { playlists } from '../../data/playlists';

export default function PlayerPage () {

    const { songId } = useParams();
    const id = parseInt(songId, 10) || 0;
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, "");

    const [music, setMusic] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const scrollRef = useRef(null);

    const location = useLocation();
    const showComments = useMemo(
        () => new URLSearchParams(location.search).get("comments") === "true",
        [location.search]
    );

    const [activeTab, setActiveTab] = useState('More Like This');

    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const moreRef = useRef(null);
    const handleMoreClickOutside = useCallback(e => {
        if (moreRef.current && !moreRef.current.contains(e.target)) {
            setShowMoreDropdown(false);
        }
    }, []);

    const [showDonatePopup, setShowDonatePopup] = useState(false);
    const [donateValue, setDonateValue] = useState("");
    const handleDonateInput = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        setDonateValue(val);
    };

    // === popup “Add to playlist” ===;
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const addToRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        api.get(`/musicas/${id}`)
            .then(({ data }) => {
                if (!mounted) return;

                const rawDate = data.dataPublicacao ?? data.datapublicacao;
                const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString()
                    : '';

                setMusic({
                    title: data.titulo,
                    artist: data.username,
                    date: formattedDate,
                    listens: data.visualizacoes,
                    lyrics: data.letra,
                    genres: [],
                    participants: [],
                    creditsInfo: [],
                    coverUrl: data.foto,
                    streamPath: data.pathFicheiro,
                });
            })
            .catch(console.error);
        return () => { mounted = false };
    }, [id]);

    // *** fetch similar tracks when music changes
    const [similarTracks, setSimilarTracks] = useState([]);
    useEffect(() => {
        if (!music) return;
        let mounted = true;
        api.get(`/musicas/${id}/similar`)
            .then(({ data }) => {
                if (!mounted) return;
                setSimilarTracks(data.map(m => ({
                    id:      m.id,
                    title:   m.titulo,
                    artist:  m.username,
                    listens: m.visualizacoes,
                    cover:   m.foto,
                })));
            })
            .catch(console.error);
        return () => { mounted = false };
    }, [id, music]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [songId]);

    useEffect(() => {
        if (!showMoreDropdown) return;
        document.addEventListener("mousedown", handleMoreClickOutside);
        return () => document.removeEventListener("mousedown", handleMoreClickOutside);
    }, [showMoreDropdown, handleMoreClickOutside]);

    // Previne scroll background quando o popup está aberto
    useEffect(() => {
        if (showDonatePopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showDonatePopup]);

    // Donate logic (igual ao ProfilePage)
    const handleQuickDonate = (value) => setDonateValue(value);

    const handleCloseDonate = () => {
        setShowDonatePopup(false);
        setDonateValue("");
    };
    const isConfirmEnabled = !!donateValue && parseInt(donateValue) >= 5;

    /*const credits = [
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
    ];*/

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

    // fecha popup ao clicar fora
    useEffect(() => {
        if (!showAddToPlaylist) return;
        function handleClickOutside(e) {
            if (addToRef.current && !addToRef.current.contains(e.target)) {
                setShowAddToPlaylist(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAddToPlaylist]);

    // inicializa seleção quando o popup abre
    useEffect(() => {
        if (!showAddToPlaylist) return;
        const saved = playlists
            .filter(pl => pl.trackIds.includes(id))
            .map(pl => pl.id);
        setSelectedIds(new Set(saved));
        setFilterText('');
    }, [showAddToPlaylist, id]);

    // “Saved” e “Remaining”, memorizados
    const saved = useMemo(
        () => playlists.filter(pl => pl.trackIds.includes(id)),
        [id]
    );
    const remaining = useMemo(
        () => playlists.filter(pl => !pl.trackIds.includes(id)),
        [id]
    );
    const savedFiltered = useMemo(
        () => saved.filter(pl => pl.title.toLowerCase().includes(filterText.toLowerCase())),
        [saved, filterText]
    );
    const remainingFiltered = useMemo(
        () => remaining.filter(pl => pl.title.toLowerCase().includes(filterText.toLowerCase())),
        [remaining, filterText]
    );

    // detecta mudanças para habilitar “Confirm”
    const initialSet = useMemo(() => new Set(saved.map(pl => pl.id)), [saved]);
    const hasChanged =
        selectedIds.size !== initialSet.size ||
        [...selectedIds].some(pid => !initialSet.has(pid));

    function toggleSelect(pid) {
        setSelectedIds(prev => {
            const nxt = new Set(prev);
            if (nxt.has(pid)) nxt.delete(pid);
            else nxt.add(pid);
            return nxt;
        });
    }

    if (!music) return <div>Loading song…</div>;

    function formatDuration(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // usa diretamente do objeto music
    const { title, artist, date, listens, lyrics, genres, participants, creditsInfo, streamPath } = music;

    function handleConfirmAdd() {
        console.log('Playlists seleccionadas:', [...selectedIds]);
        setShowAddToPlaylist(false);
    }

    // More menu & popup components
    const MoreDropdown = (
        <div className="moreDropdownWrapper" ref={moreRef}>
            <FiMoreHorizontal
                className="playerIcon moreIcon"
                onClick={() => setShowMoreDropdown(v => !v)}
            />
            {showMoreDropdown && (
                <div className="dropdownMenu">
                    <div className="dropdownItem"
                         onClick={() => { setShowMoreDropdown(false); alert("Share!"); }}>
                        Share
                    </div>
                    <div
                        className="dropdownItem"
                        onClick={() => {
                            setShowMoreDropdown(false);
                            setShowDonatePopup(true);
                        }}
                    >
                        Donate
                    </div>
                </div>
            )}
        </div>
    );

    const DonatePopup = (
        <div
            className="donatePopupOverlay"
            onClick={handleCloseDonate} // Fecha ao clicar no fundo
            tabIndex={-1} // permite foco
            role="dialog"
        >
            <div
                className="donatePopup"
                onClick={e => e.stopPropagation()} // NÃO fecha se clicares dentro do popup
            >
                <div className="donateTitle">
                    Donate to {music.artist}
                </div>
                <div className="quickDonateButtons">
                    {[5, 10, 15, 20].map((val) => (
                        <button
                            key={val}
                            className="quickDonateBtn"
                            type="button"
                            onClick={() => handleQuickDonate(val.toString())}
                        >
                            {val}€
                        </button>
                    ))}
                </div>
                <div className="donateInputSection">
                    <label className="donateInputLabel">
                        Specific ammount (min. 5€)
                    </label>
                    <input
                        className="donateInput"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        value={donateValue}
                        onChange={handleDonateInput}
                        placeholder="e.g. 10"
                    />
                </div>
                <div className="donateActions">
                    <button
                        className="donateCancelBtn"
                        type="button"
                        onClick={handleCloseDonate}
                    >
                        Cancel
                    </button>
                    <button
                        className="donateConfirmBtn"
                        type="button"
                        onClick={() => {
                            if (isConfirmEnabled) {
                                alert(`Doou ${donateValue}€ para ${music.artist}`);
                                handleCloseDonate();
                            }
                        }}
                        disabled={!isConfirmEnabled}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div key={songId} className="playerScroll" ref={scrollRef}>

            <audio
                ref={audioRef}
                src={`${baseUrl}/${streamPath}`}
                preload="metadata"
                onLoadedMetadata={() => {
                    if (audioRef.current) {
                        setAudioDuration(audioRef.current.duration);
                    }
                }}
                style={{ display: 'none' }}
            />
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
                                — {date} — {formatDuration(audioDuration)} — {listens} listens
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
                            <FiPlus
                                className="playerIcon"
                                onClick={() => setShowAddToPlaylist(true)}
                            />
                            {/* o ícone de comentários agora é um NavLink que adiciona/retira ?comments=true */}
                            <NavLink
                                to={ showComments
                                    ? `/player/${id}`               // fecha comments
                                    : `/player/${id}?comments=true` // abre comments
                                }
                                className={`playerIcon ${showComments ? 'commentActive' : ''}`}
                            >
                                <FiMessageCircle />
                            </NavLink>
                            <NavLink to="/queue" className="playerIcon">
                                <FiList />
                            </NavLink>
                            {MoreDropdown}
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

                {/* === PARTE INFERIOR: OU ABAS+CONTEÚDO, OU COMENTÁRIOS === */}
                { !showComments ? (
                    <>
                        <div className="tabsContainer">
                            <div className="playerTabs">
                                {/*{['Lyrics','More Like This','Credits'].map(t => (*/}
                                {['Lyrics','More Like This'].map(t => (
                                    <button
                                        key={t}
                                        className={`tab${activeTab===t?' active':''}`}
                                        onClick={()=>setActiveTab(t)}
                                    >{t}</button>
                                ))}
                            </div>
                            <hr className="tabDivider"/>
                        </div>

                        {activeTab === 'Lyrics' && (
                            <div className="lyricsBox">
                                {lyrics
                                    ? <p className="lyricsText">{lyrics}</p>
                                    : <p className="lyricsText">No Lyrics were added to this song yet</p>
                                }
                            </div>
                        )}

                        {activeTab === 'More Like This' && (
                            <div className="songList">
                                {similarTracks.map((item,i)=>(
                                    <div key={item.id} className="trackRow">
                                        <span className="trackNumber">{i+1}</span>
                                        <NavLink to={`/player/${item.id}`}>
                                            <div className="coverPlaceholderSmall"
                                                 style={{ backgroundImage: `url(${baseUrl}/${item.cover})` }}/>
                                        </NavLink>
                                        <div className="trackInfoSmall">
                                            <NavLink to={`/player/${item.id}`} className="infoLink">
                                                <span className="smallTitle">{item.title}</span>
                                            </NavLink>
                                            <NavLink to={`/profile/${item.artist}`} className="smallArtist">
                                                {item.artist}
                                            </NavLink>
                                        </div>
                                        <FiHeart className="actionIcon" onClick={()=>{}}/>
                                        <NavLink
                                            to={`/player/${item.id}?comments=true`}
                                            className={`actionIcon${
                                                (location.pathname===`/player/${item.id}` && showComments)
                                                    ? ' commentActive'
                                                    : ''
                                            }`}
                                        >
                                            <FiMessageCircle />
                                        </NavLink>
                                        <span className="smallDuration">{item.duration}</span>
                                        <span className="smallListens">{item.listens}</span>
                                        <FiMoreHorizontal className="actionIcon" onClick={()=>{}}/>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/*{activeTab === 'Credits' && (
                            <div className="creditsBox">
                                {creditsInfo.map((sec,i)=>(
                                    <div key={i} className="creditSection">
                                        <h3 className="creditLabel">{sec.label}:</h3>
                                        {sec.names.map((n,j)=>(
                                            <p key={j} className="creditName">{n}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                        */}
                    </>
                ) : (
                    <div className="commentsSection">
                        <input
                            type="text"
                            className="commentInput"
                            placeholder="Escreva um comentário"
                        />
                        <div className="commentsList">
                            {/* nada por enquanto, ou podes popular via API */}
                        </div>
                    </div>
                )}
            </div>


            {/* === Modal “Add to playlist” === */}
            {showAddToPlaylist && (
                <div className="modalOverlay">
                    <div className="addToPlaylistModal" ref={addToRef}>
                        <input
                            type="text"
                            className="playlistFilterInput"
                            placeholder="Find a playlist"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                        <div className="newPlaylistRow" onClick={() => console.log('Criar nova playlist')}>
                            <FiPlus className="subIcon" /><span className="subText">New Playlist</span>
                        </div>
                        <hr className="modalDividerSmall"/>

                        {saved.length > 0 && (
                            <div className="playlistSection">
                                <div className="playlistSectionTitle">Saved in</div>
                                <div className="playlistList">
                                    {savedFiltered.map(pl => (
                                        <div key={pl.id} className="playlistItem" onClick={() => toggleSelect(pl.id)}>
                                            <div
                                                className="playlistThumbSquare"
                                                style={{ backgroundImage: `url(${pl.imageUrl||'/placeholder.png'})` }}
                                            />
                                            <div className="playlistText">
                                                <div className="playlistTitle">{pl.title}</div>
                                                <div className="playlistCount">{pl.songs} songs</div>
                                            </div>
                                            <button className={`checkButton${selectedIds.has(pl.id)?' checked':''}`}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="playlistSection">
                            <div className="playlistSectionTitle">Remaining</div>
                            <div className="playlistList">
                                {remainingFiltered.map(pl => (
                                    <div key={pl.id} className="playlistItem" onClick={() => toggleSelect(pl.id)}>
                                        <div
                                            className="playlistThumbSquare"
                                            style={{ backgroundImage: `url(${pl.imageUrl||'/placeholder.png'})` }}
                                        />
                                        <div className="playlistText">
                                            <div className="playlistTitle">{pl.title}</div>
                                            <div className="playlistCount">{pl.songs} songs</div>
                                        </div>
                                        <button className={`checkButton${selectedIds.has(pl.id)?' checked':''}`}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modalButtons">
                            <button onClick={() => setShowAddToPlaylist(false)}>Cancel</button>
                            <button onClick={handleConfirmAdd} disabled={!hasChanged}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
            {showDonatePopup && createPortal(DonatePopup, document.body)}
        </div>
    );
}