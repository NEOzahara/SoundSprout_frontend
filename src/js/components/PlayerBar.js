import React, {useState} from 'react'
import {FiSkipBack, FiPause, FiPlay, FiSkipForward, FiShuffle, FiRepeat, FiVolume2, FiHeart, FiPlus, FiMessageCircle, FiList
} from 'react-icons/fi'

import { useNavigate } from 'react-router-dom';

export default function TopIcons() {

    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => setIsPlaying(p => !p);

    return (
        <div className="playerBar">
            <FiSkipBack className="controlIcon"/>
            <button
                className="playButton"
                onClick={togglePlay}
            >
                {isPlaying
                    ? <FiPause className="icon pauseIcon"/>    // mostra o ícone de pausa
                    : <FiPlay  className="icon playIcon"/>   // mostra o ícone de play
                }
            </button>
            <FiSkipForward className="controlIcon"/>
            <FiShuffle className="controlIcon"/>
            <FiRepeat className="controlIcon"/>

            <span className="currentTime">0:12</span>
            <div className="progressContainer">
                <div className="progressTrack"></div>
                <div className="progressFill" style={{ width: isPlaying ? '60%' : '40%' }}></div>
            </div>
            <span className="totalTime">3:45</span>
            <FiVolume2 className="volumeIcon"/>

            <div className="albumArt"></div>
            <div className="trackInfo">
                <span className="trackTitle">Song Name</span>
                <span className="trackArtist">Artist Name</span>
            </div>

            <FiHeart className="actionIcon"/>
            <FiPlus className="actionIcon"/>
            <FiMessageCircle className="actionIcon"/>
            <FiList className="actionIcon"/>
        </div>
    )
}
