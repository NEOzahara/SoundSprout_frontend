import React, { useEffect, useState } from 'react';
import Layout from '../LoggedInComponents/Layout';
import '../../css/Pages/Home.css';
import api from "../services/api";

export default function HomePage() {
    // Estado para Top Artists
    const [topArtists, setTopArtists] = useState([]);
    const topCount = 6; // número de artistas a mostrar

    // Handler genérico de clique (pode navegar para perfil, por exemplo)
    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);
    const handleArtistClick = artist => console.log(`Artist ${artist.username} clicado!`);

    // Fetch de Top Artists
    useEffect(() => {
        console.log(`-> A pedir Top Artists: /utilizadores/top-artists?limit=${topCount}`);
        api.get(`/utilizadores/top-artists?limit=${topCount}`)
            .then(({ data }) => {
                console.log('◀ Top Artists recebidos do servidor:', data);
                setTopArtists(data);
            })
            .catch(err => console.error('Erro ao carregar Top Artists:', err));
    }, []);

    // Base URL do backend (sem o /api)
    const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
        : 'http://localhost:5000';

    // Renderiza cards de capa (sempre estático neste ponto)
    const renderCovers = (count) =>
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
          Song {n}
        </span>
                <span
                    className="coverArtist"
                    onClick={() => handleCoverClick(n)}
                >
          Artist {n}
        </span>
            </div>
        ));

    // Renderiza playlists fictícias
    const renderCharts = (count) =>
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

    // Renderiza Top Artists dinamicamente
    const renderTopArtists = () =>
        topArtists.map((artist) => (
            <div key={artist.username} className="coverCard">
                {artist.foto ? (
                    <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${artist.foto}`}
                        alt={`Foto de ${artist.username}`}
                        onClick={() => handleArtistClick(artist)}
                    />
                ) : (
                    <div
                        className="coverPlaceholder"
                        onClick={() => handleArtistClick(artist)}
                    />
                )}
                <span
                    className="coverTitle"
                    onClick={() => handleArtistClick(artist)}
                >
          {artist.username}

        </span>
                <span className="coverInfo">

          {Number(artist.totalviews).toLocaleString('pt-PT')} views

        </span>
            </div>
        ));

    // Mantém a seção de Favourite Artists estática ou pode ser preenchida de outra forma
    const renderFavArtists = (count) =>
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
          Artist {n}
        </span>
            </div>
        ));

    return (
        <>
            {/* Primeira caixa */}
            <div className="recommendSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Recommended songs</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderCovers(6)}
                    </div>
                </div>
            </div>

            {/* Segunda caixa */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Charts: Top 50</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderCharts(6)}
                    </div>
                </div>
            </div>

            {/* Terceira caixa: Top Artists */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Top Artists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {topArtists.length > 0
                            ? renderTopArtists()
                            : <p>Carregando artistas...</p>
                        }
                    </div>
                </div>
            </div>

            {/* Quarta caixa */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Favourite Artists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderFavArtists(6)}
                    </div>
                </div>
            </div>
        </>
    );
}
