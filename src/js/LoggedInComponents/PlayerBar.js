import React, {useState, useRef, useEffect, useContext, useLayoutEffect, useCallback} from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FiSkipBack,
    FiPause,
    FiPlay,
    FiSkipForward,
    FiShuffle,
    FiRepeat,
    FiVolume2,
    FiHeart,
    FiPlus,
    FiMessageCircle,
    FiList
} from 'react-icons/fi';
import { PlayerContext } from '../../context/PlayerContext';
import api from '../services/api';

export default function PlayerBar() {

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');
    const { track, setTrack } = useContext(PlayerContext);
    const id = track.id;
    const [liked, setLiked] = useState(false);
    const formatTime = time => {
        const minutes = Math.floor(time / 60);
        const seconds = String(Math.floor(time % 60)).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const [isShuffling, setIsShuffling] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [shuffledPlaylist, setShuffledPlaylist] = useState([]);

    const { playlist, setPlaylist, insertedCount } = useContext(PlayerContext);
    const [trackIndex, setTrackIndex] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);
    const titleInnerRef = useRef(null);
    const artistInnerRef = useRef(null);

    const [titleOverflow, setTitleOverflow] = useState(false);
    const [artistOverflow, setArtistOverflow] = useState(false);

    const [showVolume, setShowVolume] = useState(false);
    const [volume, setVolume] = useState(1); // 0–1

    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // ref para detetar clicks fora do popup
    const volumeRef = useRef(null);

    const shuffleArray = (array) => {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    // sempre que o popup estiver aberto, adiciona listener para clicks fora
    useEffect(() => {
        if (!showVolume) return;
        function handleClickOutside(e) {
            if (volumeRef.current && !volumeRef.current.contains(e.target)) {
                setShowVolume(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showVolume]);

    useEffect(() => {
        if (initialFetchDone) return;
        (async () => {
            try {
                // 1) buscar settings do utilizador
                const { data: settings } = await api.get('/utilizadores/settings');
                console.log('[PlayerBar] settings:', settings);
                const autoplay = settings.autoplay;
                // 2) tentar buscar a última música tocada
                const { data: last } = await api.get('/musicas/last-listened');
                console.log('[PlayerBar] last-listened:', last);
                if (last && last.id) {
                    // usuário já ouviu algo
                    if (autoplay) {
                        // com autoplay ON, fazemos append das recommended
                        const { data: rec } = await api.get('/musicas/recommended');
                        const recList = Array.isArray(rec) ? rec : rec ? [rec] : [];
                        console.log('[PlayerBar] recommended:', recList);
                        setPlaylist([last, ...recList]);
                    } else {
                        // autoplay OFF, só tocamos a última
                        setPlaylist([last]);
                    }
                } else if (autoplay) {
                    // sem histórico e autoplay ON: tocamos só as recommended
                    const { data: rec } = await api.get('/musicas/recommended');
                    const recList = Array.isArray(rec) ? rec : rec ? [rec] : [];
                    console.log('[PlayerBar] recommended (no history):', recList);
                    setPlaylist(recList);
                } else {
                    // sem histórico e autoplay OFF: não enfileiramos nada
                    setPlaylist([]);
                }
            } catch (err) {
                console.error('Erro ao inicializar PlayerBar:', err);
            } finally {
                setInitialFetchDone(true);
            }
        })();
    }, [initialFetchDone, setPlaylist]);

    useEffect(() => {
        if (!initialFetchDone) return;
        console.debug('[PlayerBar] playlist completa:', playlist);
        console.debug('[PlayerBar] insertedCount:', insertedCount);

        // separar a playlist "injetada" vs o resto
        const injected = playlist.slice(0, insertedCount);
        const rest = playlist.slice(insertedCount);
        console.debug('[PlayerBar] injected segment:', injected);
        console.debug('[PlayerBar] rest segment:', rest);

        // embaralhar cada segmento
        const shuffledInjected = shuffleArray(injected);
        const shuffledRest = shuffleArray(rest);

        // se não houver injected, e sem autoplay, desativa shuffle
        if (shuffledInjected.length === 0 && shuffledRest.length === 0) {
            console.debug('[PlayerBar] sem músicas pendentes — shuffle desativado');
            setShuffledPlaylist([]);
            setTrackIndex(0);
            return;
        }

        // concatena: injected primeiro, depois resto
        const combined = [...shuffledInjected, ...shuffledRest];
        console.debug('[PlayerBar] shuffledPlaylist final:', combined);
        setShuffledPlaylist(combined);
        setTrackIndex(0);
    }, [playlist, insertedCount, initialFetchDone]);

    useEffect(() => {
        setTrackIndex(0);
    }, [playlist]);

    const viewedRef = useRef(new Set());
    useEffect(() => {
        if (!track.id) return;
        if (viewedRef.current.has(track.id)) {
            // se já registei para esta música, então ignoro
            return;
        }
        // registo a primeira view
        (async () => {
            try {
                console.log('[PlayerBar] registarView para música:', track.id);
                await api.post('/musicas/visualizar', { musica_id: track.id });
                console.log('[PlayerBar] ✅ visualização registada');
                viewedRef.current.add(track.id);
            } catch (err) {
                console.error('[PlayerBar] ⚠️ erro ao registar view:', err);
            }
        })();
    }, [track.id]);


    const currentTrack = (isShuffling ? shuffledPlaylist : playlist)[trackIndex] || {};

    // Sempre que a faixa muda, verifica overflow
    // detecta overflow logo após o layout
    useLayoutEffect(() => {
        const t = titleInnerRef.current;
        const a = artistInnerRef.current;
        if (t) {
            const parentWidth = t.parentElement.clientWidth;
            setTitleOverflow(t.scrollWidth > parentWidth);
        }
        if (a) {
            const parentWidth = a.parentElement.clientWidth;
            setArtistOverflow(a.scrollWidth > parentWidth);
        }
        console.log("titleOverflow:", titleOverflow, "artistOverflow:", artistOverflow);
    }, [currentTrack.titulo, currentTrack.username]);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        api.get(`/musicas/${id}/is-liked`)
            .then(({ data }) => {
                if (mounted) setLiked(data.liked);
            })
            .catch(console.error);
        return () => { mounted = false };
    }, [id]);

    async function toggleLike() {
        if (!id) return;
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

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        const list = isShuffling ? shuffledPlaylist : playlist;
        const selectedTrack = list[trackIndex];
        console.log('[PlayerBar] 🎯 Track selecionada:', selectedTrack);
        if (!selectedTrack) return;
        setTrack({
            id: selectedTrack.id,
            title: selectedTrack.titulo,
            artist: selectedTrack.username,
            coverUrl: selectedTrack.foto ? `${baseUrl}/${selectedTrack.foto.replace(/^\/+/, '')}` : null        });
    }, [trackIndex, isShuffling, playlist]);

    useEffect(() => {
        if (!track.id) return;
        const audio = audioRef.current;
        if (audio) {
            const url = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${track.id}`;
            audio.src = url;
            audio.load();

            // Se não for o primeiro load, então toca a música
            if (initialLoadDone) {
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => console.error("Erro ao reproduzir áudio:", err));
            } else {
                setInitialLoadDone(true); // da próxima já toca
            }
        }
    }, [track.id]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onLoaded = () => setDuration(audio.duration);
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onEnded = () => {
            if (isRepeating) {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleNext();
            }
        };
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, [track.id, isRepeating]);


    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause(); else audio.play();
        setIsPlaying(prev => !prev);
    };

    const handlePrev = () => {
        const list = isShuffling ? shuffledPlaylist : playlist;
        if (!list.length) return;
        setTrackIndex(prev => (prev - 1 + list.length) % list.length);
        setIsPlaying(true);
    };

    const handleNext = () => {
        const list = isShuffling ? shuffledPlaylist : playlist;
        console.log('[PlayerBar] ⏭ handleNext — playlist actual é:', list, 'trackIndex:', trackIndex);
        if (!list.length) return;
        setTrackIndex(prev => {
            const nextIndex = (prev + 1) % list.length;
            console.log('[PlayerBar] ⏭ nextIndex:', nextIndex);
            return nextIndex;
        });
        setIsPlaying(true);
    };


    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [savedPlaylists, setSavedPlaylists] = useState([]);
    const [remainingPlaylists, setRemainingPlaylists] = useState([]);
    const addToRef = useRef(null);

    // Fecha popup ao clicar fora
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
                // pré-seleciona as que já tinham a música
                setSelectedIds(new Set(saved.map(pl => pl.nome)));
            })
            .catch(console.error);
        }, [showAddToPlaylist, id]);

    // filtros e estado inicial
    const savedFiltered = savedPlaylists.filter(pl =>
            pl.nome.toLowerCase().includes(filterText.toLowerCase())
    );
    const remainingFiltered = remainingPlaylists.filter(pl =>
            pl.nome.toLowerCase().includes(filterText.toLowerCase())
    );
    const initialSet = new Set(savedPlaylists.map(pl => pl.nome));
    const hasChanged =
        selectedIds.size !== initialSet.size ||
        [...selectedIds].some(pid => !initialSet.has(pid));

    function toggleSelect(id) {
        setSelectedIds(prev => {
            const nxt = new Set(prev);
            if (nxt.has(id)) nxt.delete(id);
            else nxt.add(id);
            return nxt;
        });
    }

    function handleConfirmAdd() {
        const toAdd = [...selectedIds].filter(pl => !initialSet.has(pl));
        const toRemove = [...initialSet].filter(pl => !selectedIds.has(pl));
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const { username } = JSON.parse(stored);
        api.post('/playlists/atualizar-musicas', {
            playlist_username: username,
            musica_id: id,
            to_add: toAdd,
            to_remove: toRemove
        })
            .then(() => setShowAddToPlaylist(false))
            .catch(console.error);
    }

    const location = useLocation();
    const commentsActive =
        location.pathname === `/player/${id}` &&
        new URLSearchParams(location.search).get("comments") === "true";

    return (
        <>
            <div className="playerBar">
                <audio ref={audioRef} preload="metadata"/>

                <FiSkipBack className="controlIcon" onClick={handlePrev}/>
                <button className="playButton" onClick={togglePlay}>
                    {isPlaying
                        ? <FiPause className="icon pauseIcon"/>
                        : <FiPlay className="icon playIcon"/>
                    }
                </button>
                <FiSkipForward className="controlIcon" onClick={handleNext}/>
                <FiShuffle
                    className={`controlIcon ${isShuffling ? 'active' : ''}`}
                    onClick={() => setIsShuffling(prev => !prev)}
                />
                <FiRepeat
                    className={`controlIcon ${isRepeating ? 'active' : ''}`}
                    onClick={() => setIsRepeating(prev => !prev)}
                />

                <span className="currentTime">{formatTime(currentTime)}</span>
                <div className="progressContainer" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    if (audioRef.current) audioRef.current.currentTime = pct * duration;
                }}>
                    <div className="progressTrack"/>
                    <div className="progressFill"   style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}/>
                </div>
                <span className="totalTime">{formatTime(duration)}</span>
                <div className="volumeContainer" ref={volumeRef}>
                    <FiVolume2
                        className="volumeIcon"
                        onClick={() => setShowVolume(v => !v)}
                    />
                    {showVolume && (
                        <div className="volumePopup">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={e => setVolume(parseFloat(e.target.value))}
                                style={{
                                    background: `linear-gradient(
                                    to right,
                                    #B08D57 ${volume * 100}%,
                                    #c0c0c0 ${volume * 100}%
                                    )`
                                }}
                            />
                        </div>
                    )}
                </div>

                <NavLink to={`/player/${track.id}`} className="albumArtLink">
                    <div
                        className="albumArt"
                        style={{
                            backgroundImage: track.coverUrl
                                ? `url(${track.coverUrl})`
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </NavLink>

                <div className="trackInfo">
                    <NavLink
                        to={`/player/${track.id}`}
                        className={`trackTitle ${titleOverflow ? "marquee-hover" : ""}`}
                        ref={titleInnerRef}
                    >
                        {track.title} {/*currentTrack.titulo*/}
                    </NavLink>
                    <NavLink
                        to={`/profile/${encodeURIComponent(track.artist)}`}
                        className={`trackArtist ${artistOverflow ? "marquee-hover" : ""}`}
                        ref={artistInnerRef}
                    >
                        {track.artist } {/*currentTrack.username*/}
                    </NavLink>
                </div>

                <FiHeart
                    className={`actionIcon${liked ? ' liked' : ''}`}
                    onClick={toggleLike}
                />
                <FiPlus
                    className="actionIcon"
                    onClick={() => setShowAddToPlaylist(true)}
                />
                <NavLink
                    to={`/player/${id}?comments=true`}
                    className={`actionIcon${commentsActive ? ' commentActive' : ''}`}
                >
                    <FiMessageCircle />
                </NavLink>
                <NavLink to="/queue" className="actionIcon">
                    <FiList />
                </NavLink>
            </div>

            {showAddToPlaylist && createPortal(
                <div
                    className="modalOverlay"
                    onClick={() => setShowAddToPlaylist(false)}
                    tabIndex={-1}
                    role="dialog"
                >
                    <div
                        className="addToPlaylistModal"
                        ref={addToRef}
                        onClick={e => e.stopPropagation()}
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
                            {savedPlaylists.length > 0 && (
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
                                                    <div className="playlistCount">{pl.total_songs} songs</div>
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
                </div>,
                document.body
            )}
        </>
    );
}