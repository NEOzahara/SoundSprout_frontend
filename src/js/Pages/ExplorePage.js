import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../../css/Home.css';

export default function ExplorePage() {
    const [songs, setSongs] = useState([]);
    const username = 'joao';

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

    return (
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
    );
}
