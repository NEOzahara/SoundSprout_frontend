import React, {useEffect, useState} from 'react';
import Layout from '../components/Layout';
import '../../css/Home.css';
import api from "../services/api";

export default function HomePage () {

    const [songs, setSongs] = useState([]);
    const username = 'joao';

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);
    const handleArtistClick = n => console.log(`Artist ${n} clicado!`);

    useEffect(() => {
        api.get(`/musicas/utilizador/${username}`)
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setSongs(list);
            })
            .catch(err => console.error('Erro ao listar músicas:', err));
    }, [username]);

    // Base URL do backend (sem o /api)
    const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
        : 'http://localhost:5000';

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
                    onClick={() => handleArtistClick(n)}
                >
                    Artist {n}
                </span>
            </div>
        ));

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

    const renderTopArtists = (count) =>
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
                        {renderCovers(7)}
                    </div>
                </div>
            </div>

            {/* Segunda caixa, 20px abaixo */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Charts: Top 50</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderCharts(7)}
                    </div>
                </div>
            </div>

            {/* Terceira caixa, 20px abaixo */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Top Artists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderTopArtists(7)}
                    </div>
                </div>
            </div>

            {/* Quarta caixa, 20px abaixo */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Favourite Artists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderFavArtists(7)}
                    </div>
                </div>
            </div>
        </>
    );
};
