import React, { useEffect, useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import '../../css/Pages/Home.css';
import { PlayerContext } from '../../context/PlayerContext';
import api from "../services/api";

export default function HomePage() {
    const { setTrack } = useContext(PlayerContext);
    // ─── Base URL sem o /api para montar URLs de imagens ──────────────
    const baseUrl = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')
        : 'http://localhost:5000'

    // controla quantos itens buscar de cada secção
    const ITEMS_PER_SECTION = 20;

    // controla quantos itens mostrar antes e depois de "see all"
    const INITIAL_VISIBLE = 6;
    const MAX_VISIBLE     = 20;

    // ─── Estados das secções ─────────────────────────────────────────
    const [recommended,    setRecommended]    = useState([]);
    const [topPlaylists,   setTopPlaylists]   = useState([]);
    const [topArtists,     setTopArtists]     = useState([]);
    const [favArtists,     setFavArtists]     = useState([]);

    // ─── Flags de "ver tudo" ─────────────────────────────────────────
    const [showAllRec,   setShowAllRec]   = useState(false);
    const [showAllPL,    setShowAllPL]    = useState(false);
    const [showAllTA,    setShowAllTA]    = useState(false);
    const [showAllFA,    setShowAllFA]    = useState(false);

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

    // ─── Render Helpers ───────────────────────────────────────────────
    const visibleItems = (items, showAll) => {
        const count = showAll
            ? Math.min(items.length, MAX_VISIBLE)
            : INITIAL_VISIBLE;
        return items.slice(0, count);
    };

    // ─── Render Recommended Songs ────────────────────────────────────
    const renderRecommended = () =>
        visibleItems(recommended, showAllRec).map(m => {
            // ** ALTERAÇÃO: handler que carrega duração e atualiza o PlayerContext
            const handleClickTitle = e => {
                e.preventDefault();

                const audio = new Audio();  // carrega ficheiro para metadata

                audio.addEventListener('loadedmetadata', () => {
                    setTrack({
                        id:       m.id,
                        title:    m.titulo,
                        artist:   m.username,
                        coverUrl: m.foto ? `${baseUrl}/${m.foto}` : '',
                        duration: audio.duration
                    });
                });

                audio.src = `${baseUrl}/${m.pathficheiro}`;

                audio.load();
            };

            return (
                <div key={m.id} className="coverCard">
                    <NavLink to={`/player/${m.id}`}>
                        {m.foto
                            ? <img
                                className="coverPlaceholder"
                                src={`${baseUrl}/${m.foto}`}
                                alt={`Capa ${m.titulo}`}
                            />
                            : <div className="coverPlaceholder"/>
                        }
                    </NavLink>

                    {/* ** ALTERAÇÃO: usamos <a> com onClick para atualizar PlayerContext */}
                    <a
                        href="#!"
                        className="coverTitle"
                        onClick={handleClickTitle}
                    >
                        {m.titulo}
                    </a>

                    <NavLink to={`/profile/${m.username}`} className="coverArtist">
                        por {m.username}
                    </NavLink>
                </div>
            );
        });

    // ─── Render Top Playlists ────────────────────────────────────────
    const renderTopPlaylists = () =>
        visibleItems(topPlaylists, showAllPL).map(pl => (
            <div key={`${pl.username}::${pl.nome}`} className="coverCard">
                <NavLink to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}>
                    {pl.foto
                        ? <img
                            className="coverPlaceholder"
                            src={`${baseUrl}/${pl.foto}`}
                            alt={`Capa ${pl.nome}`}
                        />
                        : <div className="coverPlaceholder"/>
                    }
                </NavLink>
                <NavLink to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`} className="coverTitle">
                    {pl.nome}
                </NavLink>
                <NavLink to={`/profile/${pl.username}`} className="coverArtist">
                    por {pl.username}
                </NavLink>
            </div>
        ))

    // ─── Render Top Artists ──────────────────────────────────────────
    const renderTopArtists = () =>
        visibleItems(topArtists, showAllTA).map(ar => (
            <div key={ar.username} className="coverCard">
                <NavLink to={`/profile/${encodeURIComponent(ar.username)}`}>
                    {ar.foto
                        ? <img
                            className="coverPlaceholder"
                            src={`${baseUrl}/${ar.foto}`}
                            alt={`Foto de ${ar.username}`}
                        />
                        : <div className="coverPlaceholder"/>
                    }
                </NavLink>
                <NavLink to={`/profile/${encodeURIComponent(ar.username)}`} className="coverTitle">
                    {ar.username}
                </NavLink>
                <span className="coverArtist">
                    {Number(ar.totalviews).toLocaleString('pt-PT')} views
                </span>
            </div>
        ))

    // ─── Render Favorite Artists (só se >= 3) ───────────────────────
    const renderFavArtists = () =>
        visibleItems(favArtists, showAllFA).map(ar => (
            <div key={ar.artist_username} className="coverCard">
                <NavLink to={`/profile/${encodeURIComponent(ar.artist_username)}`}>
                    {ar.artist_foto
                        ? <img
                            className="coverPlaceholder"
                            src={`${baseUrl}/${ar.artist_foto}`}
                            alt={`Avatar de ${ar.artist_username}`}
                        />
                    : <div className="coverPlaceholder"/>
                    }
                </NavLink>
                <NavLink to={`/profile/${encodeURIComponent(ar.artist_username)}`} className="coverTitle">
                    {ar.artist_username}
                </NavLink>
            </div>
        ))

    return (
        <>
            {/* === Recommended Songs === */}
            <div className="recommendSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Recommended songs</span>
                    {recommended.length > INITIAL_VISIBLE && (
                        <button
                            className="seeAll"
                            onClick={() => setShowAllRec(r => !r)}
                        >
                            {showAllRec ? 'show less' : 'see all'}
                        </button>
                    )}
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
                    {topPlaylists.length > INITIAL_VISIBLE && (
                        <button
                            className="seeAll"
                            onClick={() => setShowAllPL(p => !p)}
                        >
                            {showAllPL ? 'show less' : 'see all'}
                        </button>
                    )}
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
                    {topArtists.length > INITIAL_VISIBLE && (
                        <button
                            className="seeAll"
                            onClick={() => setShowAllTA(a => !a)}
                        >
                            {showAllTA ? 'show less' : 'see all'}
                        </button>
                    )}
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
                        {favArtists.length > INITIAL_VISIBLE && (
                            <button
                                className="seeAll"
                                onClick={() => setShowAllFA(f => !f)}
                            >
                                {showAllFA ? 'show less' : 'see all'}
                            </button>
                        )}
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
