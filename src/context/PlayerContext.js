// src/js/contexts/PlayerContext.js
import React, {createContext, useMemo, useState} from 'react';

    export const PlayerContext = createContext({
        track: {
            id: null,
            title: '',
            artist: '',
            coverUrl: '',
            duration: 0
        },
        setTrack: () => {},
        injected: [],         // músicas da playlist / última música tocada
        setInjected: ()=>{},
        queued: [],           // músicas que o utilizador pôs em Queue
        queueSong: ()=>{},
        recommended: [],      // músicas de autoplay fallback
        setRecommended: ()=>{},

    });

    export function PlayerProvider({ children }) {
        const [track, setTrack] = useState({
            id: null,
            title: '',
            artist: '',
            coverUrl: '',
            duration: 0
        });

        const [injected, setInjected] = useState([]);
        const [queued, setQueued] = useState([]);
        const [recommended, setRecommended] = useState([]);

        const queueSong = song =>
            setQueued(q => [...q, song]);

        // a playlist “real” que o PlayerBar vai ver:
        const playlist = useMemo(
            () => [...injected, ...queued, ...recommended],
            [injected, queued, recommended]
        );


        return (
            <PlayerContext.Provider value={{
                track, setTrack,
                injected, setInjected,
                queued, queueSong,
                recommended, setRecommended,
                playlist
            }}>
                {children}
            </PlayerContext.Provider>
        );
    }
