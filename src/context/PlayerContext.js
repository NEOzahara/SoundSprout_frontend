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
        insertedCount: 0,
        setInsertedCount: () => {}

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
        const [insertedCount, setInsertedCount] = useState(0);


        return (
            <PlayerContext.Provider value={{
                track, setTrack,
                playlist, setPlaylist,
                insertedCount, setInsertedCount
            }}>
                {children}
            </PlayerContext.Provider>
        );
    }
