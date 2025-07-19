import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../../css/Pages/Following.css';
import {FiBarChart, FiSearch, FiUser, FiUserPlus, FiX} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { testUsers } from '../../data/test';
import { followingBoxes } from '../../data/followingTests';

export default function FollowingPage() {

    // estados para o autocomplete
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return testUsers
            .filter(u => u.name.toLowerCase().includes(q))
            .map(u => ({
                id: u.id,
                name: u.name,
                username: u.username,
                avatarUrl: u.avatarUrl
            }));
    }, [query]);

    const [following, setFollowing] = useState([]);
    // obtém o user logado do localStorage (guardado no login)
    const stored = localStorage.getItem('user');
    const me = stored ? JSON.parse(stored) : null;
    // baseUrl para fotos e capas
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    // ao montar, busca o following com status e playlists públicas
    useEffect(() => {
        if (!me) return;
        api.get(`/utilizadores/${me.username}/following-with-status`)
            .then(({ data }) => setFollowing(data))
            .catch(console.error);
    }, [me]);

    // Para simular playlist carousel:
    function renderFollowedPlaylists(playlists) {
        return playlists.map((playlist) => (
            <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="coverCard"
            >
                <div className="coverPlaceholder" />
                <span className="coverTitle">{playlist.title}</span>
            </NavLink>
        ));
    }

    return (
        <>
            <div className="searchBarContainerFollowing">
                {/*  Ícone de lupa à esquerda, colado na borda interna */}
                <div className="searchWrapperFollowing searchContainerFollowing">
                    <div
                        className="searchIconWrapperFollowing"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIconFollowing" />
                    </div>
                    <input
                        type="text"
                        className="searchInputFollowing"
                        placeholder="Search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />

                    {results.length > 0 && (
                        <ul className="suggestions">
                            {results.map(u => (
                                <NavLink
                                    key={u.id}
                                    to={`/profile/${encodeURIComponent(u.username)}`}
                                    className="suggestionItem"
                                    onClick={() => setQuery('')}
                                >
                                    <div
                                        className="suggestionThumb userThumb"
                                        style={{
                                            backgroundImage: `url(${u.avatarUrl||'/placeholder.png'})`
                                        }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{u.name}</div>
                                        <div className="suggestionSubtitle">{u.username}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>

                {/*  Ícone de “adicionar pessoa” à direita da barra */}
                <button
                    className="addPersonButton"
                    onClick={() => console.log('Adicionar pessoa')}
                >
                    <FiUserPlus className="addPersonIcon" />
                </button>
            </div>

            {following.map(u => (
                <div key={u.username} className="chartsSection">
                    <div className="recommendHeader">
                        <div className="followedHeader">
                            <FiUser className="followedIcon" />
                            <div
                                className="followerPlaceholder userThumb"
                                style={{
                                    backgroundImage: u.foto
                                        ? `url(${baseUrl}${u.foto.startsWith('/')?'':'/'}${u.foto})`
                                        : undefined
                                }}
                            />
                            <div className="followedText">
                                <NavLink
                                    className="followedName"
                                    to={`/profile/${encodeURIComponent(u.username)}`}
                                >
                                    {u.username}
                                </NavLink>
                                {u.is_listening && u.current_song ? (
                                    <span className="followedSong">
                                        <FiBarChart className="audioIcon" />
                                        <NavLink
                                            className="songName"
                                            to={`/player/${u.current_song.id}`}
                                        >
                                            {u.current_song.title}
                                        </NavLink>
                                        <NavLink
                                            className="dashArtist"
                                            to={`/profile/${encodeURIComponent(u.current_song.artist)}`}
                                        >
                                            &nbsp;– {u.current_song.artist}
                                        </NavLink>
                                    </span>
                                ) : (
                                    <span className="followedSong">
                                        <FiX className="audioIcon" />
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            className="seeAll"
                            onClick={() => console.log(`See all for ${u.username}`)}
                        >
                            see all
                        </button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {u.playlists.map(pl => (
                                <NavLink
                                    key={`${pl.username}-${pl.nome}`}
                                    to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                                    className="coverCard"
                                >
                                    <div
                                        className="coverPlaceholder"
                                        style={{
                                            backgroundImage: pl.foto
                                                ? `url(${baseUrl}${pl.foto.startsWith('/')?'':'/'}${pl.foto})`
                                                : undefined
                                    }}
                                    />
                                    <span className="coverTitle">{pl.nome}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}