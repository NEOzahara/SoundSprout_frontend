import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../../css/Pages/Following.css';
import {FiBarChart, FiSearch, FiUser, FiUserPlus, FiX} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { testUsers } from '../../data/test';

export default function FollowingPage() {

    // estados para o autocomplete
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return testUsers
            .filter(u => u.name.toLowerCase().includes(q))
            .map(u => ({
                id:         u.id,
                name:       u.name,
                username:   u.username,
                avatarUrl:  u.avatarUrl
            }));
    }, [query]);

    const handleCoverClick = (n) => console.log(`Music ${n} clicado!`);
    const handleFollowedClick = (name) => console.log(`Clicked Followed: ${name}`);
    const handleSongClick = (song) => console.log(`Clicked Song: ${song}`);
    const handleArtistClick = (artist) => console.log(`Clicked Artist: ${artist}`);

    const renderFollowedPlaylists = (count) =>
        Array.from({ length: count }, (_, i) => i + 1).map((n) => (
            <div key={n} className="coverCard">
                <div
                    className="coverPlaceholder"
                    onClick={() => handleCoverClick(n)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(n)}
                >
                    Playlist {n}
                </span>
            </div>
        ));

    const followedBoxes = [
        {
            followedName: 'Followed 1',
            songName: 'Song 1',
            artistName: 'Artist 1',
            isListening: true,
            renderCarousel: renderFollowedPlaylists,
        },
        {
            followedName: 'Followed 2',
            songName: 'Song 2',
            artistName: 'Artist 2',
            isListening: false,
            renderCarousel: renderFollowedPlaylists,
        },
        {
            followedName: 'Followed 3',
            songName: 'Song 3',
            artistName: 'Artist 3',
            isListening: true,
            renderCarousel: renderFollowedPlaylists,
        },
        // adicionar aqui quantos objetos necessários,
        // por exemplo:
        // {
        //   followedName: 'Followed 4',
        //   songName: 'Song 4',
        //   artistName: 'Artist 4',
        //   renderCarousel: renderAlgumaOutraCoisa
        // },
    ];

    return (
        <>
            <div className="searchBarContainerFollowing">
                {/*  Ícone de lupa à esquerda, colado na borda interna */}
                <div className="searchWrapperFollowing searchContainerFollowing">
                    <div
                        className="searchIconWrapperFollowing"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIconFollowing" />
                    </div>
                    <input
                        type="text"
                        className="searchInputFollowing"
                        placeholder="Search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />

                    {results.length > 0 && (
                        <ul className="suggestions">
                            {results.map(u => (
                                <NavLink
                                    key={u.id}
                                    to={`/profile/${encodeURIComponent(u.username)}`}
                                    className="suggestionItem"
                                    onClick={() => setQuery('')}
                                >
                                    <div
                                        className="suggestionThumb userThumb"
                                        style={{
                                            backgroundImage: `url(${u.avatarUrl||'/placeholder.png'})`
                                    }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{u.name}</div>
                                        <div className="suggestionSubtitle">{u.username}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>

                {/*  Ícone de “adicionar pessoa” à direita da barra */}
                <button
                    className="addPersonButton"
                    onClick={() => console.log('Adicionar pessoa')}
                >
                    <FiUserPlus className="addPersonIcon" />
                </button>
            </div>

            {followedBoxes.map((box, index) => (
                <div key={index} className="chartsSection">
                    <div className="recommendHeader">
                        <div className="followedHeader">
                            {/* Ícone de perfil estático */}
                            <FiUser className="followedIcon" />

                            <div className="followedText">
                                {/* 1) Nome do followed (clicável) */}
                                <span
                                    className="followedName"
                                    onClick={() => handleFollowedClick(box.followedName)}
                                >
                                    {box.followedName}
                                </span>

                                {/* 2.2) Se estiver ouvindo, mostra FiBarChart + nome da música + “– Artist” */}
                                {box.isListening ? (
                                    <span className="followedSong">
                    <FiBarChart className="audioIcon" />
                    <span
                        className="songName"
                        onClick={() => handleSongClick(box.songName)}
                    >
                      {box.songName}
                    </span>
                    <span
                        className="dashArtist"
                        onClick={() => handleArtistClick(box.artistName)}
                    >
                      &nbsp;– {box.artistName}
                    </span>
                  </span>
                                ) : (
                                    /* 2.3) Se NÃO estiver ouvindo, mostra só uma cruz (FiX) */
                                    <span className="followedSong">
                    <FiX className="audioIcon" />
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2.4) Carrossel específico para este followed */}
                    <div className="carouselWrapper">
                        <div className="carousel">{box.renderCarousel(7)}</div>
                    </div>
                </div>
            ))}
        </>
    );
}
