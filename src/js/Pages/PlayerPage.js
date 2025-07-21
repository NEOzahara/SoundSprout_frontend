import React, {useEffect, useRef, useState, useMemo, useCallback, useContext} from "react";
import {FiPlay, FiHeart, FiPlus, FiMessageCircle, FiList, FiMoreHorizontal, FiUser, FiPause} from 'react-icons/fi';
import '../../css/Pages/Player.css';
import {NavLink, useParams, useLocation} from "react-router-dom";
import { createPortal } from 'react-dom';
import api from '../services/api';
import {PlayerContext} from "../../context/PlayerContext";

export default function PlayerPage () {

    // Adicione estes estados no início do componente
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const { songId } = useParams();
    const id = parseInt(songId, 10) || 0;
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, "");

    const [userPlaylists, setUserPlaylists] = useState([]);
    const [savedPlaylists, setSavedPlaylists] = useState([]);
    const [remainingPlaylists, setRemainingPlaylists] = useState([]);

    const [music, setMusic] = useState(null);
    const { setTrack } = useContext(PlayerContext);
    const [liked, setLiked] = useState(false);
    const [similarLiked, setSimilarLiked] = useState({});

    async function toggleLike() {
        try {
            if (liked) {
                await api.delete(`/musicas/like/${id}`);
                setLiked(false);
                window.dispatchEvent(new Event('likeChanged'));
            } else {
                await api.post(`/musicas/like`, { id });
                setLiked(true);
                window.dispatchEvent(new Event('likeChanged'));
            }
        } catch (err) {
            console.error('Erro ao (un)like:', err);
        }
    }

    async function toggleSimilarLike(trackId) {
        try {
            if (similarLiked[trackId]) {
                await api.delete(`/musicas/like/${trackId}`);
                setSimilarLiked(prev => ({ ...prev, [trackId]: false }));
                window.dispatchEvent(new Event('likeChanged'));
            } else {
                await api.post(`/musicas/like`, { id: trackId });
                setSimilarLiked(prev => ({ ...prev, [trackId]: true }));
                window.dispatchEvent(new Event('likeChanged'));
            }
        } catch (err) {
            console.error('Erro ao (un)like similar track:', err);
        }
    }

    const handleClickSimilar = item => e => {
        e.preventDefault();
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.addEventListener('loadedmetadata', () => {
            setTrack({
                id: item.id,
                title: item.title,
                artist: item.artist,
                coverUrl: item.cover ? `${baseUrl}/${item.cover.replace(/^\/+/, '')}` : '',
                duration: audio.duration
            });
        });
        audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${item.id}`;
        audio.load();
    };


    const [artistUser, setArtistUser] = useState({});
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


    // --- NOVOS ESTADOS PARA COMENTÁRIOS ---
    const [commentText, setCommentText]   = useState("");

    // 1) Buscar os comentários (e replies) ao abrir a secção
    useEffect(() => {
        if (!showComments) return;
        (async () => {
            try {
                // busca todos os comentários principais
                const { data: main } = await api.get(`/comentarios/musica/${id}`);
                // para cada um, busca as replies
                const withReplies = await Promise.all(
                    main.map(async cm => {
                        const { data: reps } = await api.get(`/comentarios/replies/${cm.idcomentario}`);
                        return { ...cm, replies: reps };
                    })
                );
                setComments(withReplies);
            } catch (err) {
                console.error("Erro a carregar comentários:", err);
            }
        })();
    }, [showComments, id]);

    // 2) Submeter um comentário novo
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await api.post('/comentarios', {
                musica_id:     id,
                conteudo:     commentText,
                tempoNaMusica: null,
                parentId:     null
            });
            setCommentText("");
            // recarrega os comentários
            const { data: main } = await api.get(`/comentarios/musica/${id}`);
            const withReplies = await Promise.all(
                main.map(async cm => {
                    const { data: reps } = await api.get(`/comentarios/replies/${cm.idcomentario}`);
                    return { ...cm, replies: reps };
                })
            );
            setComments(withReplies);
        } catch (err) {
            console.error("Erro ao postar comentário:", err);
        }
    };

    useEffect(() => {
        let mounted = true;
        setLiked(false);
        console.log('▶️  Debug: fetching music details for id', id);
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

                api.get(`/utilizadores/${data.username}`)
                    .then(({ data: u }) => {
                        if (!mounted) return;
                        setArtistUser(u);
                    })
                .catch(console.error);

                api.get(`/musicas/${id}/is-liked`)
                    .then(({ data }) => mounted && setLiked(data.liked))
                    .catch(console.error);

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
                console.log('🔍  Debug: similar tracks fetched, count=', data.length, data);
                setSimilarTracks(data.map(m => ({
                    id:      m.id,
                    title:   m.titulo,
                    artist:  m.username,
                    listens: m.visualizacoes,
                    cover:   m.foto,
                })));
            })
            .catch(err => console.error('❌  Debug: error fetching similar', err));
        return () => { mounted = false };
    }, [id, music]);

    useEffect(() => {
        if (similarTracks.length === 0) return;

        (async () => {
            try {
                const statuses = await Promise.all(
                    similarTracks.map(item =>
                        api
                            .get(`/musicas/${item.id}/is-liked`)
                            .then(res => res.data.liked)
                            .catch(() => false)
                    )
                );
                const likedMap = {};
                similarTracks.forEach((item, i) => {
                    likedMap[item.id] = statuses[i];
                });
                setSimilarLiked(likedMap);
            } catch (err) {
                console.error('Erro ao carregar estado de likes das faixas semelhantes:', err);
            }
        })();
    }, [similarTracks]);

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

    const handleConfirmDonate = async () => {
        try {
            const { data } = await api.post('/payments/checkout-session', {
                amount: parseFloat(donateValue),
                connectedAccountId: artistUser.stripe_account_id, // conta do artista
                musicaId: id                                   // ID da música
            });
            window.location.href = data.url;
        } catch (err) {
            console.error('Erro ao iniciar Checkout:', err);
        }
    };

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        setTrack({
            id: id,
            title: music.title,
            artist: music.artist,
            coverUrl: `${baseUrl}/${music.coverUrl}`,
            duration: 0  // A duração será atualizada no PlayerBar
        });
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
        setFilterText('');
        setSelectedIds(new Set());

        const stored = localStorage.getItem('user');
        if (!stored) {
            console.error('Usuário não autenticado');
            return;
        }
        const { username } = JSON.parse(stored);

        api.get(`/playlists/utilizador/${username}`)
            .then(({ data: playlists }) => {
                // 3) para cada playlist, buscar as músicas e marcar se contém a música atual
                return Promise.all(
                    playlists.map(pl =>
                            api.get(
                                `/playlists/${encodeURIComponent(pl.nome)}/${username}/musicas`
                            ).then(({ data: musics }) => ({
                                ...pl,
                                contains: musics.some(m => m.id === id),
                                total_songs: musics.length
                            }))
                    )
                );
            })
            .then(plsWithFlag => {
                const saved  = plsWithFlag.filter(pl => pl.contains);
                const remain = plsWithFlag.filter(pl => !pl.contains);
                setSavedPlaylists(saved);
                setRemainingPlaylists(remain);
                setSelectedIds(new Set(saved.map(pl => pl.nome))); // pré-seleciona
            })
            .catch(console.error);
        }, [showAddToPlaylist, id]);

    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    useEffect(() => {
        if (openMenuIdx === null) return;
        function handleClickOutside(e) {
            if (!e.target.closest('.moreMenuWrapper')) {
                setOpenMenuIdx(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuIdx]);

    // “Saved” e “Remaining”, memorizados
    const saved  = useMemo(() => savedPlaylists, [savedPlaylists]);
    const remaining = useMemo(() => remainingPlaylists, [remainingPlaylists]);
    const savedFiltered = useMemo(
        () => saved.filter(pl => pl.nome.toLowerCase().includes(filterText.toLowerCase())),
        [saved, filterText]
    );
    const remainingFiltered = useMemo(
        () => remaining.filter(pl => pl.nome.toLowerCase().includes(filterText.toLowerCase())),
        [remaining, filterText]
    );

    // detecta mudanças para habilitar “Confirm”
    const initialSet = useMemo(() => new Set(saved.map(pl => pl.nome)), [saved]);
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

    async function handleConfirmAdd() {
        // obtém o username do utilizador logado
        const stored = localStorage.getItem('user');
        if (!stored) {
            console.error('Usuário não autenticado');
            return;
        }
        const { username } = JSON.parse(stored);
        const toAdd = [...selectedIds].filter(pl => !initialSet.has(pl));
        const toRemove = [...initialSet].filter(pl => !selectedIds.has(pl));
        try {
            await api.post('/playlists/atualizar-musicas', {
                playlist_username: username,
                musica_id: id,
                to_add: toAdd,
                to_remove: toRemove
            });
            // só fecha o modal quando tudo tiver corrido bem
            setShowAddToPlaylist(false);
        } catch (err) {
            console.error('Erro ao atualizar playlists:', err);
        }
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

    const AddToPlaylistPopup = (  // ← ALTERAÇÃO: extraído para constante
        <div
            className="modalOverlay"
            onClick={() => setShowAddToPlaylist(false)}  // fecha ao clicar no overlay
            tabIndex={-1}
            role="dialog"
        >
            <div
                className="addToPlaylistModal"
                ref={addToRef}
                onClick={e => e.stopPropagation()}        // impede fechar ao clicar dentro
            >
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

                <div className="playlistsScrollWrapper">
                    {saved.length > 0 && (
                        <div className="playlistSection">
                            <div className="playlistSectionTitle">Saved in</div>
                            <div className="playlistList">
                                {savedFiltered.map(pl => (
                                    <div
                                        key={pl.nome}
                                        className="playlistItem"
                                        onClick={() => toggleSelect(pl.nome)}
                                    >
                                        <div
                                            className="playlistThumbSquare"
                                            style={{ backgroundImage: `url(${pl.imageUrl||'/placeholder.png'})` }}
                                        />
                                        <div className="playlistText">
                                            <div className="playlistTitle">{pl.nome}</div>
                                            <div className="playlistCount">
                                                {pl.total_songs} songs</div>
                                        </div>
                                        <button
                                            className={`checkButton${selectedIds.has(pl.nome)?' checked':''}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="playlistSection">
                        <div className="playlistSectionTitle">Remaining</div>
                        <div className="playlistList">
                            {remainingFiltered.map(pl => (
                                <div
                                    key={pl.nome}
                                    className="playlistItem"
                                    onClick={() => toggleSelect(pl.nome)}
                                >
                                    <div
                                        className="playlistThumbSquare"
                                        style={{ backgroundImage: `url(${pl.imageUrl||'/placeholder.png'})` }}
                                    />
                                    <div className="playlistText">
                                        <div className="playlistTitle">{pl.nome}</div>
                                        <div className="playlistCount">{pl.total_songs} songs</div>
                                    </div>
                                    <button className={`checkButton${selectedIds.has(pl.nome)?' checked':''}`}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modalButtons">
                    <button onClick={() => setShowAddToPlaylist(false)}>Cancel</button>
                    <button onClick={handleConfirmAdd} disabled={!hasChanged}>Confirm</button>
                </div>
            </div>
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
                        onClick={handleConfirmDonate}
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
                    <div
                        className="coverLarge"
                        onClick={() => console.log('Cover clicked')}
                        style={{
                            backgroundImage: music.coverUrl
                                ? `url(${baseUrl}/${music.coverUrl})`
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />

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
                            <FiHeart
                                className={`playerIcon${liked ? ' liked' : ''}`}
                                onClick={toggleLike}
                            />
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
                                            <a
                                                href="#!"
                                                className="smallTitle infoLink"
                                                onClick={handleClickSimilar(item)}
                                            >
                                                {item.title}
                                            </a>
                                            <NavLink to={`/profile/${item.artist}`} className="smallArtist">
                                                {item.artist}
                                            </NavLink>
                                        </div>
                                        <FiHeart
                                            className="actionIcon"
                                            onClick={() => toggleSimilarLike(item.id)}
                                            style={{
                                                color: similarLiked[item.id] ? '#B08D57' : '#b0b0b0',
                                                fill: similarLiked[item.id] ? '#B08D57' : 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
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
                                        <div
                                            className={`moreMenuWrapper ${openMenuIdx === i ? 'open' : ''}`}
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setOpenMenuIdx(openMenuIdx === i ? null : i);
                                            }}
                                        >
                                            <FiMoreHorizontal className="actionIcon" />
                                            {openMenuIdx === i && (
                                                <ul
                                                    className={`playlistOptions ${
                                                        i >= Math.ceil(similarTracks.length / 2)
                                                            ? 'above'
                                                            : 'below'
                                                    }`}
                                                >
                                                    <li
                                                        onClick={e => {
                                                            e.preventDefault(); e.stopPropagation();
                                                            console.log('Follow artist', item.artist);
                                                            setOpenMenuIdx(null);
                                                        }}
                                                    >
                                                        Follow
                                                    </li>
                                                    <li
                                                        onClick={e => {
                                                            e.preventDefault(); e.stopPropagation();
                                                            console.log('Queue song', item);
                                                            setOpenMenuIdx(null);
                                                        }}
                                                    >
                                                        Queue
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
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
                        {/* Formulário de comentário */}
                            <input
                                type="text"
                                className="commentInput"
                                placeholder="Escreve um comentário"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(e); }}
                            />

                        {/* Lista de comentários */}
                        <div className="commentsList">
                            {comments.map(cm => (
                                <div key={cm.idcomentario} className="commentItem">
                                    <div
                                        className="commentAvatar"
                                    />
                                    <div className="commentContent">
                                        <span className="commentUser">{cm.autor_username}:&nbsp; </span>
                                        <span className="commentText">{cm.conteudo}</span>
                                    </div>
                                    <div className="commentMeta">
                                        <FiHeart className="commentHeart" />
                                        <span className="commentTime">{new Date(cm.comentario_timestamp).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Replies aninhadas */}
                                    {cm.replies.length > 0 && (
                                        <div className="commentReplies">
                                            {cm.replies.map(rep => (
                                                <div key={rep.idcomentario} className="commentItem replyItem">
                                                    <div className="commentAvatar"/>
                                                    <div className="commentContent">
                                                        <span className="commentUser">{rep.autor_username}:&nbsp; </span>
                                                        <span className="commentText">{rep.conteudo}</span>
                                                    </div>
                                                    <div className="commentMeta">
                                                        <FiHeart className="commentHeart" />
                                                        <span className="commentTime">{new Date(rep.comentario_timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            {/* === Modal “Add to playlist” === */}
            {showAddToPlaylist && createPortal(AddToPlaylistPopup, document.body)}

            {/* Donate via portal (já estava assim) */}
            {showDonatePopup && createPortal(DonatePopup, document.body)}
        </div>
    );
}