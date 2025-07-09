// src/data/followingTests.js

import {NavLink} from "react-router-dom";

export const followingBoxes = [
    {
        followedUser: { id: 0, name: "Alice", username: "alice", avatarUrl: "/avatars/alice.png" },
        isListening: true,
        song: { id: 0, title: "Song A", artist: { id: 10, name: "Artist A", username: "artist a", avatarUrl: "/avatars/artista.png" } },
        playlists: [
            { id: 0, title: 'Roadtrip Classics' },
            { id: 2, title: 'Top Hits' },
        ],
    },
    {
        followedUser: { id: 1, name: "Bob", username: "bob", avatarUrl: "/avatars/bob.png" },
        isListening: false,
        song: null, // Não está a ouvir nada
        playlists: [
            { id: 1, title: 'Jazz Vibes' },
            { id: 5, title: 'Classic Hits' },
            { id: 4, title: 'House Vibes' }
        ],
    },
    {
        followedUser: { id: 2, name: "Carol", username: "carol", avatarUrl: "/avatars/carol.png" },
        isListening: true,
        song: { id: 1, title: "Song B", artist: { id: 11, name: "Artist B", username: "artist b", avatarUrl: "/avatars/artistb.png" } },
        playlists: [
            { id: 0, title: 'Roadtrip Classics' },
            { id: 2, title: 'Top Hits' },
        ],
    },
    {
        followedUser: { id: 3, name: "Daniel", username: "daniel", avatarUrl: "/avatars/daniel.png" },
        isListening: true,
        song: { id: 2, title: "Song C", artist: { id: 12, name: "Artist C", username: "artist c", avatarUrl: "/avatars/artistc.png" } },
        playlists: [
            { id: 1, title: 'Jazz Vibes' },
            { id: 5, title: 'Classic Hits' },
            { id: 4, title: 'House Vibes' }
        ],
    },
    {
        followedUser: { id: 4, name: "Eve", username: "eve", avatarUrl: "/avatars/eve.png" },
        isListening: false,
        song: null,
        playlists: [
            { id: 0, title: 'Roadtrip Classics' },
            { id: 2, title: 'Top Hits' },
        ],
    }
];
