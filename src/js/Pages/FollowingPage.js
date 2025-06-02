import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../../css/Pages/Following.css';
import {FiBarChart, FiSearch, FiUser, FiUserPlus, FiX} from 'react-icons/fi';

export default function FollowingPage() {

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
            <div className="searchBarContainer">
                {/*  Ícone de lupa à esquerda, colado na borda interna */}
                <div className="searchWrapper">
                    <div
                        className="searchIconWrapper"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIcon" />
                    </div>
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Search"
                        onChange={e => console.log('buscando por:', e.target.value)}
                    />
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
