import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../../css/Pages/Explore.css';
import {FiSearch, FiUser, FiUserPlus} from 'react-icons/fi';

export default function ExploreLoggedOffPage() {

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);

    const sections = [
        { title: 'Discover',   render: count => renderDiscover(count) },
        { title: 'Genres',      render: count => renderGenres(count) },
        { title: 'Playlists',         render: count => renderPlaylists(count) },
        { title: 'Artists',   render: count => renderArtists(count) },
    ];

    function renderDiscover(count) {
        return Array.from({ length: count }, (_, i) => i + 1).map(n => (
            <div key={n} className="coverCard">
                <div className="coverPlaceholder" onClick={() => handleCoverClick(n)} />
                <span className="coverTitle"       onClick={() => handleCoverClick(n)}>Song {n}</span>
            </div>
        ));
    }

    function renderGenres(count) {
        return Array.from({ length: count }, (_, i) => i + 1).map(n => (
            <div key={n} className="coverCard">
                <div className="coverPlaceholder" onClick={() => handleCoverClick(n)} />
                <span className="coverTitle"       onClick={() => handleCoverClick(n)}>Playlist {n}</span>
            </div>
        ));
    }

    function renderPlaylists(count) {
        return Array.from({ length: count }, (_, i) => i + 1).map(n => (
            <div key={n} className="coverCard">
                <div className="coverPlaceholder" onClick={() => handleCoverClick(n)} />
                <span className="coverTitle"       onClick={() => handleCoverClick(n)}>Artist {n}</span>
            </div>
        ));
    }

    function renderArtists(count) {
        return Array.from({ length: count }, (_, i) => i + 1).map(n => (
            <div key={n} className="coverCard">
                <div
                    className="profilePlaceholder"
                    onClick={() => handleCoverClick(n)}
                >
                    <FiUser className="profileIcon" />
                </div>
                <span className="coverTitle"       onClick={() => handleCoverClick(n)}>Artist {n}</span>
            </div>
        ));
    }

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

            <div className="exploreSection">
                {sections.map(({ title, render }, idx) => (
                    <React.Fragment key={idx}>
                        <div className="recommendHeader">
                            <span className="sectionTitle">{title}</span>
                            <button className="seeAll" onClick={() => console.log('see all clicked')}>
                                see all
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">{render(7)}</div>
                        </div>
                        {idx < sections.length - 1 && (
                            <div className="exploreSpacer" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
}
