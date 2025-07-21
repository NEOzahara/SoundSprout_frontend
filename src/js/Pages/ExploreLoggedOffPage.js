import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../../css/Pages/Explore.css';
import {FiSearch, FiUser, FiUserPlus} from 'react-icons/fi';

export default function ExploreLoggedOffPage() {

    const [discover, setDiscover] = useState([]);
    const [genres, setGenres] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [artists, setArtists] = useState([]);

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);

    useEffect(() => {
        api.get('/musicas/discover?limit=8')
            .then(({ data }) => setDiscover(data))
            .catch(err => console.error('Erro ao buscar Discover:', err));

        api.get('/musicas/genres-playlists')
            .then(({ data }) => setGenres(data))
            .catch(err => console.error('Erro ao buscar categorias:', err));

        api.get('/playlists/playlists-explore')
            .then(({ data }) => setPlaylists(data))
            .catch(err => console.error('Erro ao buscar playlists:', err));

        api.get('/utilizadores/top-artists?limit=8')
            .then(({ data }) => setArtists(data))
            .catch(err => console.error('Erro ao buscar artistas:', err));
        }, []);

    const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

    const sections = [
        { title: 'Discover', render: count => renderDiscover(count) },
        { title: 'Genres', render: () => renderGenres() },
        { title: 'Playlists', render: () => renderPlaylists() },
        { title: 'Artists', render: () => renderArtists() },
    ];

    function renderDiscover() {
        return discover.map(m => (
            <div key={m.id} className="coverCard">
                <div
                    className="coverPlaceholder"
                    style={{ backgroundImage: `url(${baseUrl}/${m.foto})` }}
                    onClick={() => handleCoverClick(m.id)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(m.id)}
                >
                    {m.titulo}
                </span>
                <span
                    className="coverArtist"
                    onClick={() => handleCoverClick(m.username)}
                >
                    {m.username}
                </span>
            </div>
        ));
    }

    function renderGenres() {
        return genres.map(g => (
            <div key={g.genre} className="coverCard">
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: `url(${g.songs[0]?.capa ? baseUrl + '/' + g.songs[0].capa : '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                    onClick={() => handleCoverClick(g.genre)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(g.genre)}
                >
                    {g.genre}
                </span>
            </div>
        ));
    }

    function renderPlaylists() {
        return playlists.map(pl => (
            <div key={`${pl.username}::${pl.nome}`} className="coverCard">
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: `url(${pl.foto ? `${baseUrl}${pl.foto.startsWith('/') ? '' : '/'}${pl.foto}` : '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                    onClick={() => handleCoverClick(pl.nome)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(pl.nome)}
                >
                    {pl.nome}
                </span>
                <span
                    className="coverArtist"
                    onClick={() => handleCoverClick(pl.username)}
                >
                    {pl.username}
                </span>
            </div>
        ));
    }

    function renderArtists() {
        return artists.map(u => (
            <div key={u.username} className="coverCard">
                <div
                    className="profilePlaceholder"
                    style={{
                        backgroundImage: u.foto
                            ? `url(${baseUrl}${u.foto.startsWith('/') ? '' : '/'}${u.foto})`
                            : undefined,
                    }}
                    onClick={() => handleCoverClick(u.username)}
                >
                    {!u.foto && <FiUser className="profileIcon" />}
                </div>
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(u.username)}
                >
                    {u.username}
                </span>
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
}
