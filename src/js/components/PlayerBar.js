import React, {useState, useRef, useEffect} from 'react'
import {FiSkipBack, FiPause, FiPlay, FiSkipForward, FiShuffle, FiRepeat, FiVolume2, FiHeart, FiPlus, FiMessageCircle, FiList
} from 'react-icons/fi'

import { NavLink } from 'react-router-dom';

export default function PlayerBar() {

    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => setIsPlaying(p => !p);
    const [progress, setProgress] = useState(40); // inicial 40%
    const progressRef = useRef(null);
    const dragging = useRef(false);

    // quando o mouse for solto, deixa de arrastar
    useEffect(() => {
        const onUp = () => { dragging.current = false; };
        window.addEventListener('mouseup', onUp);
        return () => window.removeEventListener('mouseup', onUp);
    }, []);

    // se estiver em arraste, atualiza o progress
    useEffect(() => {
        const onMove = e => {
            if (!dragging.current || !progressRef.current) return;
            const rect = progressRef.current.getBoundingClientRect();
            let pct = ((e.clientX - rect.left) / rect.width) * 100;
            pct = Math.max(0, Math.min(100, pct));
            setProgress(pct);
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    // ao clicar ou tocar na barra, inicia arraste e define novo valor
    const startDrag = e => {
        e.preventDefault();            // ⬅️ evita seleção de texto
        if (!progressRef.current) return;
        dragging.current = true;
        const rect = progressRef.current.getBoundingClientRect();
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        setProgress(pct);
    };

    return (
        <div className="playerBar">
            <NavLink
                to="/player"
                className="playerBarBackgroundLink"
            />
            <FiSkipBack className="controlIcon"/>
            <button className="playButton" onClick={togglePlay}>
                {isPlaying
                    ? <FiPause className="icon pauseIcon"/>    // mostra o ícone de pausa
                    : <FiPlay  className="icon playIcon"/>   // mostra o ícone de play
                }
            </button>
            <FiSkipForward className="controlIcon"/>
            <FiShuffle className="controlIcon"/>
            <FiRepeat className="controlIcon"/>

            <span className="currentTime">0:12</span>

            <div
                className="progressContainer"
                ref={progressRef}
                onMouseDown={startDrag}
            >
                <div className="progressTrack"/>
                <div className="progressFill"
                     style={{
                         width: `${progress}%`,
                         backgroundColor: isPlaying ? '#B08D57' : '#B0B0B0'
                     }}></div>
            </div>
            <span className="totalTime">3:45</span>
            <FiVolume2
                className="volumeIcon"
                onClick={() => {
                  /* aqui a tua função de volume, por ex: */
                    console.log('Volume clicado!')
                }}
            />

            <div className="albumArt"></div>
            <div className="trackInfo">
                <span
                    className="trackTitle"
                    onClick={() => console.log('Título clicado!')}
                >
                    Song Name
                </span>
                <span className="trackArtist"
                      onClick={() => console.log('Artista clicado!')}
                >
                    Artist Name
                </span>
            </div>

            <FiHeart className="actionIcon"/>
            <FiPlus className="actionIcon"/>
            <FiMessageCircle className="actionIcon"/>
            <FiList className="actionIcon"/>
        </div>
    )
}
