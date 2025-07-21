// src/js/contexts/PlayerContext.js
import React, { createContext, useState } from 'react';

export const PlayerContext = createContext({
    track: {
        id: null,
        title: '',
        artist: '',
        coverUrl: '',
        duration: 0
    },
    setTrack: () => {},
    playlist: [],
    setPlaylist: () => {},

});

export function PlayerProvider({ children }) {
    const [track, setTrack] = useState({
        id: null,
        title: '',
        artist: '',
        coverUrl: '',
        duration: 0
    });

    const [playlist, setPlaylist] = useState([]);


    return (
        <PlayerContext.Provider value={{ track, setTrack, playlist, setPlaylist }}>
            {children}
        </PlayerContext.Provider>
    );
}
