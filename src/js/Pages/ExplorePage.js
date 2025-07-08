import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../../css/Pages/Explore.css';
import {FiSearch, FiUser} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { testPlaylists, testMusics, testUsers } from '../../data/test';

export default function ExplorePage() {

    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const pMatches = testPlaylists
            .filter(p => p.title.toLowerCase().includes(q))
            .map(p => ({ type: 'Playlist', id: p.id, title: p.title, subtitle: p.owner, imageUrl: p.imageUrl }));
        const mMatches = testMusics
            .filter(m => m.title.toLowerCase().includes(q))
            .map(m => ({ type: 'Song', id: m.id, title: m.title, subtitle: m.artist, imageUrl: m.imageUrl }));
        const uMatches = testUsers
            .filter(u => u.name.toLowerCase().includes(q))
            .map(u => ({ type: 'User',  id: u.id, title: u.name,  subtitle: u.username, imageUrl: u.avatarUrl }));
        return [ ...pMatches, ...mMatches, ...uMatches ];
    }, [query]);

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);

    const sections = [
        { title: 'Discover', render: count => renderDiscover(count) },
        { title: 'Genres', render: count => renderGenres(count) },
        { title: 'Playlists', render: count => renderPlaylists(count) },
        { title: 'Artists', render: count => renderArtists(count) },
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
                <span className="coverTitle"       onClick={() => handleCoverClick(n)}>Playlist {n}</span>
            </div>
        ));
    }

    function renderArtists(count) {
        return Array.from({ length: count }, (_, i) => i + 1).map(n => (
            <div key={n} className="coverCard">
                <div className="profilePlaceholder" onClick={() => handleCoverClick(n)}
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
                <div className="searchWrapper searchContainerExplore">
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
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    {results.length > 0 && (
                        <ul className="suggestions">
                            {results.map(r => (
                                <NavLink
                                    key={`${r.type}-${r.id}`}
                                    to={ r.type === 'Playlist'
                                        ? `/playlist/${r.id}`
                                        : r.type === 'Song'
                                            ? `/player/${r.id}`
                                            : `/profile/${encodeURIComponent(r.title)}` }
                                    className="suggestionItem"
                                    onClick={() => setQuery('')}
                                >
                                    <div
                                        className={`suggestionThumb ${
                                            r.type === 'Playlist' ? 'playlistThumb'
                                                : r.type === 'Song'     ? 'songThumb'
                                                    :                         'userThumb'
                                        }`}
                                        style={{
                                            backgroundImage: `url(${r.imageUrl || '/placeholder.png'})`
                                    }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{r.title}</div>
                                        <div className="suggestionSubtitle">{r.subtitle}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>
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

















    //const [songs, setSongs] = useState([]);
    //const username = 'joao';

    /*useEffect(() => {
        api.get(`/musicas/utilizador/${username}`)
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setSongs(list);
            })
            .catch(err => console.error('Erro ao listar músicas:', err));
    }, [username]);*/

    // Base URL do backend (sem o /api)
    /*const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
        : 'http://localhost:5000';*/

    /*return (
        <div className="recommendSection">
            <div className="recommendHeader">
                <span className="sectionTitle">Músicas Recomendadas</span>
                <button className="seeAll">Ver Todas</button>
            </div>
            <div className="carouselWrapper">
                <div className="carousel">
                    {songs.length > 0 ? (
                        songs.map(song => {
                            // extrai o nome do ficheiro da propriedade song.foto
                            const fotoFile = song.foto ? song.foto.split('/').pop() : null;
                            return (
                                <div key={song.titulo} className="coverCard">
                                    {fotoFile ? (
                                        <img
                                            className="coverPlaceholder"
                                            src={`${baseUrl}/uploads/fotos/${fotoFile}`}
                                            alt={song.titulo}
                                        />
                                    ) : (
                                        <div className="coverPlaceholder" />
                                    )}
                                    <span className="coverTitle">{song.titulo}</span>
                                    <span className="coverArtist">{song.username}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p>Nenhuma música disponível para "{username}".</p>
                    )}
                </div>
            </div>
        </div>
    );*/


}
