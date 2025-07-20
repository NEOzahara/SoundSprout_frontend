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
    queue: [],
    setQueue: () => {},
    index: 0,
    setIndex: () => {}
});

export function PlayerProvider({ children }) {
    const [track, setTrack] = useState({
        id: null,
        title: '',
        artist: '',
        coverUrl: '',
        duration: 0
    });
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(0);

    return (
        <PlayerContext.Provider value={{ track, setTrack }}>
            {children}
        </PlayerContext.Provider>
    );
}
