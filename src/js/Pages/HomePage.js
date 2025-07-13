import React, { useEffect, useState } from 'react';
import Layout from '../LoggedInComponents/Layout';
import '../../css/Pages/Home.css';
import api from "../services/api";

export default function HomePage() {
    // ─── Base URL sem o /api para montar URLs de imagens ──────────────
    const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')
        : 'http://localhost:5000'

    const ITEMS_PER_SECTION = 8

    // ─── Estados das secções ─────────────────────────────────────────
    const [recommended,    setRecommended]    = useState([])
    const [topPlaylists,   setTopPlaylists]   = useState([])
    const [topArtists,     setTopArtists]     = useState([])
    const [favArtists,     setFavArtists]     = useState([])

    // ─── Fetch Recommended Songs ──────────────────────────────────────
    useEffect(() => {
        async function loadRecommended() {
            try {
                const { data } = await api.get('/musicas/recommended')
                setRecommended(data.slice(0, ITEMS_PER_SECTION))
            } catch (err) {
                console.error('Erro a carregar Recommended Songs:', err)
            }
        }
        loadRecommended()
    }, [])

    // ─── Fetch Top Playlists ──────────────────────────────────────────
    useEffect(() => {
        async function loadTopPlaylists() {
            try {
                const { data } = await api.get(`/playlists/top?limit=${ITEMS_PER_SECTION}`)
                setTopPlaylists(data)
            } catch (err) {
                console.error('Erro ao carregar Top Playlists:', err)
                setTopPlaylists([])
            }
        }
        loadTopPlaylists()
    }, [])

    // ─── Fetch Top Artists ────────────────────────────────────────────
    useEffect(() => {
        async function loadTopArtists() {
            try {
                const { data } = await api.get(`/utilizadores/top-artists?limit=${ITEMS_PER_SECTION}`)
                setTopArtists(data)
            } catch (err) {
                console.error('Erro ao carregar Top Artists:', err)
                setTopArtists([])
            }
        }
        loadTopArtists()
    }, [])

    // ─── Fetch Favorite Artists ───────────────────────────────────────
    useEffect(() => {
        async function loadFavArtists() {
            try {
                const { data } = await api.get('/utilizadores/favorite-artists')
                // data = [] se houver < 3 artistas gostados
                setFavArtists(data)
            } catch (err) {
                console.error('Erro ao carregar Favorite Artists:', err)
                setFavArtists([])
            }
        }
        loadFavArtists()
    }, [])

    // ─── Handlers de clique (placeholders) ───────────────────────────
    const handleSongClick     = m  => console.log(`Song ${m.id} clicado!`)
    const handlePlaylistClick = pl => console.log(`Playlist ${pl.nome} clicada!`)
    const handleArtistClick   = ar => console.log(`Artist ${ar.username} clicado!`)

    // ─── Render Recommended Songs ────────────────────────────────────
    const renderRecommended = () =>
        recommended.map(m => (
            <div key={m.id} className="coverCard">
                {m.foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${m.foto}`}
                        alt={`Capa ${m.titulo}`}
                        onClick={() => handleSongClick(m)}
                    />
                    : <div className="coverPlaceholder" onClick={() => handleSongClick(m)} />
                }
                <span className="coverTitle" onClick={() => handleSongClick(m)}>
          {m.titulo}
        </span>
                <span className="coverArtist">
          por {m.username}
        </span>
            </div>
        ))

    // ─── Render Top Playlists ────────────────────────────────────────
    const renderTopPlaylists = () =>
        topPlaylists.map(pl => (
            <div key={`${pl.username}::${pl.nome}`} className="coverCard">
                {pl.foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${pl.foto}`}
                        alt={`Capa ${pl.nome}`}
                        onClick={() => handlePlaylistClick(pl)}
                    />
                    : <div className="coverPlaceholder" onClick={() => handlePlaylistClick(pl)} />
                }
                <span className="coverTitle" onClick={() => handlePlaylistClick(pl)}>
          {pl.nome}
        </span>
                <span className="coverArtist">por {pl.username}</span>
            </div>
        ))

    // ─── Render Top Artists ──────────────────────────────────────────
    const renderTopArtists = () =>
        topArtists.map(ar => (
            <div key={ar.username} className="coverCard">
                {ar.foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${ar.foto}`}
                        alt={`Foto de ${ar.username}`}
                        onClick={() => handleArtistClick(ar)}
                    />
                    : <div className="coverPlaceholder" onClick={() => handleArtistClick(ar)} />
                }
                <span className="coverTitle" onClick={() => handleArtistClick(ar)}>
          {ar.username}
        </span>
                <span className="coverInfo">
          {Number(ar.totalviews).toLocaleString('pt-PT')} views
        </span>
            </div>
        ))

    // ─── Render Favorite Artists (só se >= 3) ───────────────────────
    const renderFavArtists = () =>
        favArtists.map(ar => (
            <div key={ar.artist_username} className="coverCard">
                {ar.artist_foto
                    ? <img
                        className="coverPlaceholder"
                        src={`${baseUrl}/${ar.artist_foto}`}
                        alt={`Avatar de ${ar.artist_username}`}
                        onClick={() => handleArtistClick(ar)}
                    />
                    : <div className="coverPlaceholder" onClick={() => handleArtistClick(ar)} />
                }
                <span className="coverTitle" onClick={() => handleArtistClick(ar)}>
          {ar.artist_username}
        </span>
            </div>
        ))

    return (
        <>
            {/* === Recommended Songs === */}
            <div className="recommendSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Recommended songs</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {recommended.length > 0
                            ? renderRecommended()
                            : <p>Carregando recomendações…</p>}
                    </div>
                </div>
            </div>

            {/* === Charts: Top Playlists === */}
            <div className="chartsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Charts: Top Playlists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {topPlaylists.length > 0
                            ? renderTopPlaylists()
                            : <p>Carregando playlists…</p>}
                    </div>
                </div>
            </div>

            {/* === Top Artists === */}
            <div className="chartsSection artistsSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Top Artists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {topArtists.length > 0
                            ? renderTopArtists()
                            : <p>Carregando artistas…</p>}
                    </div>
                </div>
            </div>

            {/* === Favorite Artists (só visível se >= 3) === */}
            {favArtists.length >= 3 && (
                <div className="chartsSection favArtistsSection">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Favorite Artists</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderFavArtists()}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
