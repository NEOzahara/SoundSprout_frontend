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

            {followingBoxes.map((box, index) => (
                <div key={index} className="chartsSection">
                    <div className="recommendHeader">
                        <div className="followedHeader">
                            <FiUser className="followedIcon" />
                            <div className="followedText">
                                <NavLink
                                    className="followedName"
                                    to={`/profile/${encodeURIComponent(box.followedUser.username)}`}
                                >
                                    {box.followedUser.name}
                                </NavLink>
                                {box.isListening && box.song ? (
                                    <span className="followedSong">
                            <FiBarChart className="audioIcon" />
                            <NavLink
                                className="songName"
                                to={`/player/${box.song.id}`}
                            >
                                {box.song.title}
                            </NavLink>
                            <NavLink
                                className="dashArtist"
                                to={`/profile/${encodeURIComponent(box.song.artist.username)}`}
                            >
                                &nbsp;– {box.song.artist.name}
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
                            onClick={() => console.log(`See all for ${box.followedUser.name}`)}
                        >
                            see all
                        </button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderFollowedPlaylists(box.playlists)}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}