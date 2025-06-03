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

    // Carregar playlist do utilizador 'joao'
    useEffect(() => {
        api.get(`/musicas/utilizador/joao`)
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setPlaylist(list);
            })
            .catch(err => console.error('Erro ao carregar playlist:', err));
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

    return (
        <div className="playerBar">
            <audio ref={audioRef} preload="metadata" />

            <FiSkipBack className="controlIcon" onClick={handlePrev} />
            <button className="playButton" onClick={togglePlay}>
                {isPlaying
                    ? <FiPause className="icon pauseIcon" />
                    : <FiPlay className="icon playIcon" />
                }
            </button>
            <FiSkipForward className="controlIcon" onClick={handleNext} />
            <FiShuffle className="controlIcon" onClick={() => console.log('Shuffle clicado!')} />
            <FiRepeat className="controlIcon" onClick={() => {
                const audio = audioRef.current;
                if (audio) audio.loop = !audio.loop;
                console.log('Loop toggled');
            }} />

            <span className="currentTime">{formatTime(currentTime)}</span>
            <div className="progressContainer" onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) audioRef.current.currentTime = pct * duration;
            }}>
                <div className="progressTrack" />
                <div className="progressFill" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
            <span className="totalTime">{formatTime(duration)}</span>
            <FiVolume2 className="volumeIcon" onClick={() => console.log('Volume clicado!')} />

            <NavLink to="/player" className="albumArtLink">
                <div className="albumArt" />
            </NavLink>

            <div className="trackInfo">
                <NavLink
                    to="/player"
                    className={`trackTitle ${titleOverflow ? "marquee-hover" : ""}`}
                    ref={titleInnerRef}
                 >
                    {currentTrack.titulo || "TESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"}
                </NavLink>
                <NavLink
                   to="/player"
                   className={`trackArtist ${artistOverflow ? "marquee-hover" : ""}`}
                   ref={artistInnerRef}
                >
                    {currentTrack.username || "ARTISTA"}
                </NavLink>
            </div>

            <FiHeart className="actionIcon" onClick={() => console.log('Heart clicado!')} />
            <FiPlus className="actionIcon" onClick={() => console.log('Plus clicado!')} />
            <FiMessageCircle className="actionIcon" onClick={() => console.log('MessageCircle clicado!')} />
            <FiList className="actionIcon" onClick={() => console.log('List clicado!')} />
        </div>
    );
}
