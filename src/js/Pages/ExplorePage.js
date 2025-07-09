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

    // ** Carrosseis — cada um recebe o seu conjunto de dados **
    const discoverMusics = testMusics.slice(0, 7);     // Carrossel só de músicas
    const genresPlaylists = testPlaylists.slice(0, 7);  // Carrossel de playlists por género
    const mainPlaylists = testPlaylists.slice(1, 8);  // Outro carrossel só de playlists
    const topUsers = testUsers.slice(0, 3);      // Carrossel só de users

    // Renders genéricos para cada tipo, fácil de trocar pelo resultado do API
    function renderMusicCarrousel(musics) {
        return musics.map(music => (
            <NavLink
                key={music.id}
                to={`/player/${music.id}`}
                className="coverCard"
            >
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: `url(${music.imageUrl || '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <span className="coverTitle">{music.title}</span>
            </NavLink>
        ));
    }

    function renderPlaylistCarrousel(playlists) {
        return playlists.map(playlist => (
            <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="coverCard"
            >
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: `url(${playlist.imageUrl || '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <span className="coverTitle">{playlist.title}</span>
            </NavLink>
        ));
    }

    function renderUserCarrousel(users) {
        return users.map(user => (
            <NavLink
                key={user.id}
                to={`/profile/${user.username}`}
                className="coverCard"
            >
                <div
                    className="profilePlaceholder"
                    style={{
                        backgroundImage: `url(${user.avatarUrl || '/avatars/default.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {!user.avatarUrl && <FiUser className="profileIcon" />}
                </div>
                <span className="coverTitle">{user.name}</span>
            </NavLink>
        ));
    }

    const sections = [
        { title: 'Discover', render: () => renderMusicCarrousel(discoverMusics) },
        { title: 'Genres',   render: () => renderPlaylistCarrousel(genresPlaylists) },
        { title: 'Playlists',render: () => renderPlaylistCarrousel(mainPlaylists) },
        { title: 'Artists',  render: () => renderUserCarrousel(topUsers) }
    ];

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
                            <div className="carousel">{render()}</div>
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
