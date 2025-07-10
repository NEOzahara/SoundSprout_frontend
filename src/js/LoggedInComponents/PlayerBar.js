import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import { NavLink } from 'react-router-dom';
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
import api from '../services/api';
import { playlists } from '../../data/playlists';
import { musics } from '../../data/musics';

export default function PlayerBar() {
    const [playlist, setPlaylist] = useState([]);
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

    // ref para detetar clicks fora do popup
    const volumeRef = useRef(null);

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

        //Comentado temporariamente
    // Carregar playlist do utilizador 'joao'
    /* useEffect(() => {
        api.get(`/musicas/utilizador/joao`)
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setPlaylist(list);
            })
            .catch(err => console.error('Erro ao carregar playlist:', err));
    }, []);*/

    //Usado para testes
    useEffect(() => {
        setPlaylist(musics);
    }, []);

    const currentTrack = playlist[trackIndex] || {};
    const streamUrl = currentTrack.titulo
        ? `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/` +
        `${currentTrack.features}/${encodeURIComponent(currentTrack.titulo)}/${currentTrack.username}`
        : '';

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

    // Atualizar áudio ao mudar de faixa
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && streamUrl) {
            audio.src = streamUrl;
            audio.load();
            if (isPlaying) audio.play();
        }
    }, [streamUrl]);

    // Eventos: metadata, progresso e fim da faixa
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onLoaded = () => setDuration(audio.duration);
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onEnded = () => handleNext();
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, [playlist, trackIndex]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause(); else audio.play();
        setIsPlaying(prev => !prev);
    };

    const handlePrev = () => {
        if (!playlist.length) return;
        setTrackIndex(prev => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    const handleNext = () => {
        if (!playlist.length) return;
        setTrackIndex(prev => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const formatTime = time => {
        const minutes = Math.floor(time / 60);
        const seconds = String(Math.floor(time % 60)).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
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

    // sempre que muda a faixa, reinicia seleção
    const currentTrackId = currentTrack.id; // pressupõe que currentTrack.id existe
    useEffect(() => {
        const saved = playlists
            .filter(pl => pl.trackIds.includes(currentTrackId))
            .map(pl => pl.id);
        setSelectedIds(new Set(saved));
        setFilterText('');
    }, [currentTrackId]);

    // separa playlists em “Saved” e “Remaining”
    const saved = playlists.filter(pl =>
        pl.trackIds.includes(currentTrackId)
    );
    const remaining = playlists.filter(pl =>
        !pl.trackIds.includes(currentTrackId)
    );
    // filtra segundo o texto
    const savedFiltered = saved.filter(pl =>
        pl.title.toLowerCase().includes(filterText.toLowerCase())
    );
    const remainingFiltered = remaining.filter(pl =>
        pl.title.toLowerCase().includes(filterText.toLowerCase())
    );

    // detecta se houve alguma mudança para habilitar “Confirmar”
    const initialSet = new Set(saved.map(pl => pl.id));
    const hasChanged =
        selectedIds.size !== initialSet.size ||
        [...selectedIds].some(id => !initialSet.has(id));

    function toggleSelect(id) {
        setSelectedIds(prev => {
            const nxt = new Set(prev);
            if (nxt.has(id)) nxt.delete(id);
            else nxt.add(id);
            return nxt;
        });
    }

    function handleConfirmAdd() {
        console.log('Playlists seleccionadas:', [...selectedIds]);
        setShowAddToPlaylist(false);
    }

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
                <FiShuffle className="controlIcon" onClick={() => console.log('Shuffle clicado!')}/>
                <FiRepeat className="controlIcon" onClick={() => {
                    const audio = audioRef.current;
                    if (audio) audio.loop = !audio.loop;
                    console.log('Loop toggled');
                }}/>

                <span className="currentTime">{formatTime(currentTime)}</span>
                <div className="progressContainer" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    if (audioRef.current) audioRef.current.currentTime = pct * duration;
                }}>
                    <div className="progressTrack"/>
                    <div className="progressFill" style={{width: `${(currentTime / duration) * 100}%`}}/>
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

                <NavLink to={`/player/${currentTrack.id}`} className="albumArtLink">
                    <div className="albumArt"/>
                </NavLink>

                <div className="trackInfo">
                    <NavLink
                        to={`/player/${currentTrack.id}`}
                        className={`trackTitle ${titleOverflow ? "marquee-hover" : ""}`}
                        ref={titleInnerRef}
                    >
                        {currentTrack.title || "TESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"} {/*currentTrack.titulo*/}
                    </NavLink>
                    <NavLink
                        to={`/profile/${encodeURIComponent(currentTrack.artist)}`}
                        className={`trackArtist ${artistOverflow ? "marquee-hover" : ""}`}
                        ref={artistInnerRef}
                    >
                        {currentTrack.artist || "ARTISTA"} {/*currentTrack.username*/}
                    </NavLink>
                </div>

                <FiHeart className="actionIcon" onClick={() => console.log('Heart clicado!')}/>
                <FiPlus
                    className="actionIcon"
                    onClick={() => setShowAddToPlaylist(true)}
                />
                <NavLink
                    to={`/player/${currentTrack.id}?comments=true`}
                    className="actionIcon"
                >
                    <FiMessageCircle />
                </NavLink>
                <NavLink to="/queue" className="actionIcon">
                    <FiList />
                </NavLink>
            </div>

            {/* === Popup “Add to playlist” === */}
            {showAddToPlaylist && (
                <div className="modalOverlay">
                    <div
                        className="addToPlaylistModal"
                        ref={addToRef}
                    >
                        {/* campo de filtro */}
                        <input
                            type="text"
                            className="playlistFilterInput"
                            placeholder="Find a playlist"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />

                        {/* linha “New Playlist” */}
                        <div
                            className="newPlaylistRow"
                            onClick={() => console.log('Criar nova playlist')}
                        >
                            <FiPlus className="subIcon" />
                            <span className="subText">New Playlist</span>
                        </div>

                        {/* divisor pequeno */}
                        <hr className="modalDividerSmall" />

                        {/* “Saved in” só se houver playlists salvas */}
                        <div className="playlistsScrollWrapper">
                            {saved.length > 0 && (
                                <div className="playlistSection">
                                    <div className="playlistSectionTitle">Saved in</div>
                                    <div className="playlistList">
                                        {savedFiltered.map(pl => (
                                            <div
                                                key={pl.id}
                                                className="playlistItem"
                                                onClick={() => toggleSelect(pl.id)}
                                            >
                                                <div
                                                    className="playlistThumbSquare"
                                                    style={{
                                                        backgroundImage: `url(${pl.imageUrl || '/placeholder.png'})`
                                                    }}
                                                />
                                                <div className="playlistText">
                                                    <div className="playlistTitle">{pl.title}</div>
                                                    <div className="playlistCount">{pl.songs} songs</div>
                                                </div>
                                                <button
                                                    className={`checkButton${selectedIds.has(pl.id) ? ' checked' : ''}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remaining */}
                            <div className="playlistSection">
                                <div className="playlistSectionTitle">Remaining</div>
                                <div className="playlistList">
                                    {remainingFiltered.map(pl => (
                                        <div
                                            key={pl.id}
                                            className="playlistItem"
                                            onClick={() => toggleSelect(pl.id)}
                                        >
                                            <div
                                                className="playlistThumbSquare"
                                                style={{
                                                    backgroundImage: `url(${pl.imageUrl || '/placeholder.png'})`
                                                }}
                                            />
                                            <div className="playlistText">
                                                <div className="playlistTitle">{pl.title}</div>
                                                <div className="playlistCount">{pl.songs} songs</div>
                                            </div>
                                            <button
                                                className={`checkButton${selectedIds.has(pl.id) ? ' checked' : ''}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* botões Cancel / Confirm */}
                        <div className="modalButtons">
                            <button type="button" onClick={() => setShowAddToPlaylist(false)}>
                                Cancel
                            </button>
                            <button type="button" disabled={!hasChanged} onClick={handleConfirmAdd}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}