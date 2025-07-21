import React, {useEffect, useState} from 'react';
import Layout from '../LoggedInComponents/Layout';
import '../../css/Pages/Home.css';
import api from "../services/api";

export default function HomeLoggedOffPage () {

    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    //const username = 'joao';

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);
    const handleArtistClick = n => console.log(`Artist ${n} clicado!`);

    useEffect(() => {
        api.get(`/musicas/top-liked`)
            .then(({ data }) => {setSongs(data);})
            .catch(err => console.error('Erro ao buscar Top Liked:', err));
        api.get('/playlists/top?limit=8')                          // ALTERAÇÃO: rota para top playlists
            .then(({ data }) => setPlaylists(data))               // ALTERAÇÃO: popula playlists
            .catch(err => console.error('Erro ao buscar Top Playlists:', err));
        api.get('/utilizadores/top-artists?limit=7')           // ALTERAÇÃO: rota para top-artists
            .then(({ data }) => setTopUsers(data))             // ALTERAÇÃO: popula topUsers
            .catch(err => console.error('Erro ao buscar Top Users:', err));
     }, []);

    // Base URL do backend (sem o /api)
    const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
        : 'http://localhost:5000';


    const renderCharts = () =>
        playlists.map(pl => (
            <div key={`${pl.nome}-${pl.username}`} className="coverCard">
                <div
                    className="coverPlaceholder"
                    style={{ backgroundImage: `url(${baseUrl}/${pl.foto})` }}  // capa da playlist
                    onClick={() => handleCoverClick(pl.nome)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(pl.nome)}
                >
                    {pl.nome}                                            {/* nome da playlist */}
                </span>
                <span
                    className="coverArtist"
                    onClick={() => handleArtistClick(pl.username)}
                >
                    {pl.username}                                        {/* autor da playlist */}
                </span>
            </div>
    ));

    const renderTopArtists = () =>
        topUsers.map(user => (
            <div key={user.username} className="coverCard">
                <div
                    className="coverPlaceholder"
                    style={{ backgroundImage: `url(${baseUrl}/${user.foto})` }}
                    onClick={() => handleArtistClick(user.username)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleArtistClick(user.username)}
                >
                    {user.username}
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
                        {songs.map(song => (
                            <div key={song.id} className="coverCard">
                                <div
                                    className="coverPlaceholder"
                                    style={{ backgroundImage: `url(${baseUrl}/${song.cover})` }}
                                    onClick={() => handleCoverClick(song.id)}
                                />
                                <span
                                    className="coverTitle"
                                    onClick={() => handleCoverClick(song.id)}
                                >
                                    {song.titulo}
                                </span>
                                <span
                                    className="coverArtist"
                                    onClick={() => handleArtistClick(song.artist_username)}
                                >
                                    {song.artist_username}
                                </span>
                            </div>
                        ))}
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
                        {renderCharts()}
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
                        {renderTopArtists()}
                    </div>
                </div>
            </div>
        </>
    );
};
