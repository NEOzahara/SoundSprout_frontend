import React, {useState, useEffect, useContext} from 'react'
import { PlayerContext } from '../../context/PlayerContext';
import { NavLink, useLocation } from 'react-router-dom';
import {FiMusic, FiFolder, FiHome, FiChevronDown} from 'react-icons/fi'
import api from '../services/api';

function CardIcon({ activeTab, foto }) {
    if (activeTab === 'Playlist') return <FiFolder className="cardIcon" />;
    if (activeTab === 'Music') return <FiMusic className="cardIcon" />;
    if (activeTab === 'User'){
        return (
            <span
                className="cardIcon userCircle"
                style={ foto
                    ? { backgroundImage: `url(${foto})` }
                    : {} }
            />
        );
    }
    // fallback
    return <FiHome className="cardIcon" />;
}

export default function RightScroll() {

    const location = useLocation();
    const { track } = useContext(PlayerContext)
    const [activeTab, setActiveTab] = useState('Playlist');
    const [recentPlaylists, setRecentPlaylists] = useState([]);
    const [recentMusics, setRecentMusics] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [discShowAll, setDiscShowAll] = useState(false);
    const [discography, setDiscography] = useState([]);

    const loggedUser = JSON.parse(localStorage.getItem('user'));
    const username = loggedUser.username;

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const fetchHistory = () => {
        const limit = 20;
        const mapTipo = {
            'Playlist': 'playlist',
            'Music':    'musica',
            'User':     'usuario'
        };
        const apiTipo = mapTipo[activeTab];

        api.get(`/historico/${username}/${apiTipo}?limit=${limit}`)
            .then(({ data }) => {
                if (activeTab === 'Playlist') {
                    setRecentPlaylists(data);
                }
                if (activeTab === 'Music') {
                    setRecentMusics(data);
                }
                if (activeTab === 'User') {
                    const usersWithFullFoto = data.map(u => ({
                        ...u,
                        foto: u.foto
                            ? `${baseUrl}${u.foto.startsWith('/') ? '' : '/'}${u.foto}`
                            : null
                    }));
                    setRecentUsers(usersWithFullFoto);
                }
            })
            .catch(err => console.error('Erro fetch histórico:', err));
    };

    const fetchRecentMusics = () => {
        const limit = 20;
        api.get(`/historico/${username}/musica?limit=${limit}`)
            .then(({ data }) => {
                setRecentMusics(data);
            })
            .catch(err => console.error('Erro fetch histórico (Music):', err));
    };

    // dispara ao mudar de tab ou rota
    useEffect(() => {
        fetchHistory();
        setShowAll(false);
        }, [activeTab, username, location.pathname]);

    useEffect(() => {
        if (location.pathname.startsWith('/player/')) {
            fetchRecentMusics();
        }
    }, [location.pathname, username]);

    useEffect(() => {
        const onHistoryUpdate = () => {
            if (activeTab === 'User' || activeTab === 'Music') {
                fetchHistory();
            }
        };
        window.addEventListener('historyUpdated', onHistoryUpdate);
        return () => {
            window.removeEventListener('historyUpdated', onHistoryUpdate);
        };
    }, [activeTab, username]);

    useEffect(() => {
        if (!track.id) return
        // 1) buscamos detalhes da música para obter o uploader (username)
        api.get(`/musicas/${track.id}`)
            .then(({ data: musica }) => {
                const uploader = musica.username
                // 2) buscamos todas as músicas desse uploader
                return api.get(`/musicas/utilizador/${encodeURIComponent(uploader)}`)
            })
            .then(({ data }) => {
                setDiscography(data)
            })
            .catch(err => console.error('Erro ao carregar discografia:', err))
    }, [track.id])

    const renderCards = () => {
        const count = showAll ? 20 : 6;
        if (activeTab === 'Playlist') {
            return recentPlaylists
                .slice(0, count)
                .map(pl => (
                    <NavLink
                        key={`${pl.owner}-${pl.nome}`}
                        to={`/playlist/${encodeURIComponent(pl.owner)}/${encodeURIComponent(pl.nome)}`}
                        className="cardItem"
                    >
                        <CardIcon activeTab="Playlist" />
                        <div className="cardText">
                            <span className="cardTitle">{pl.nome}</span>
                            <span className="cardSubtitle">{pl.owner}</span>
                        </div>
                        <FiChevronDown className="cardArrow" />
                    </NavLink>
                ));
        }

        if (activeTab === 'Music') {
            return recentMusics
                .slice(0, count)
                .map(m => (
                    <NavLink
                        key={m.id}
                        to={`/player/${m.id}`}
                        className="cardItem"
                    >
                        <CardIcon activeTab="Music" />
                        <div className="cardText">
                            <span className="cardTitle">{m.titulo}</span>
                            <span className="cardSubtitle">{m.username}</span>
                        </div>
                        <FiChevronDown className="cardArrow" />
                    </NavLink>
                ));
        }

        return recentUsers
            .slice(0, count)
            .map(u => (
                <NavLink
                    key={u.username}
                    to={`/profile/${encodeURIComponent(u.username)}`}
                    className="cardItem"
                >
                    <CardIcon activeTab="User" foto={u.foto}/>
                    <div className="cardText">
                        <span className="cardTitle">{u.username}</span>
                    </div>
                    <FiChevronDown className="cardArrow" />
                </NavLink>
            ));
    };

    const renderDiscography = () => {
        const count = discShowAll ? 20 : 6;
        return discography
            .slice(0, count)
            .map(m => (
                <NavLink key={m.id} to={`/player/${m.id}`} className="cardItem">
                    <FiMusic className="cardIcon"/>
                    <div className="cardText">
                        <span className="cardTitle">{m.titulo}</span>
                        <span className="cardSubtitle">{m.username}</span>
                    </div>
                    <FiChevronDown className="cardArrow"/>
                </NavLink>
            ));
    };

    return (
        <div className="rightScroll">
            {/* Recently Played */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Recently Played</h2>
                    <button
                        className="seeAll"
                        onClick={() => setShowAll(prev => !prev)}
                    >
                        <span>{showAll ? 'show less' : 'see all'}</span>
                    </button>
                </div>
                <div className="tabs">
                    {['Playlist','Music','User'].map(t => (
                        <button
                            key={t}
                            className={`tab${activeTab===t?' active':''}`}
                            onClick={()=>setActiveTab(t)}
                        >{t}</button>
                    ))}
                </div>
                <div className="cardList">{renderCards()}</div>
            </div>

            {/* Discography */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Discography</h2>
                    <button
                        className="seeAll"
                        onClick={() => setDiscShowAll(prev => !prev)} // SUGGESTION
                    >
                        <span>{discShowAll ? 'show less' : 'see all'}</span> {/* SUGGESTION */}
                    </button>
                </div>
                <div className="cardList">{renderDiscography()}</div>
            </div>

            {/* Queue */}
            {/*<div className="section">
                <div className="sectionHeader">
                    <h2>Queue</h2>
                    <button className="seeAll">
                        <span>see all</span>
                    </button>
                </div>
                <div className="cardList">{renderOtherCards()}</div>
            </div>*/}
        </div>
    )
}