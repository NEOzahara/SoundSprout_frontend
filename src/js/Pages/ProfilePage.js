import React, {useLayoutEffect, useRef, useState} from 'react';
import { FiEdit2, FiShare2, FiHeart, FiMessageCircle, FiList, FiMoreHorizontal } from 'react-icons/fi';
import '../../css/Pages/Profile.css';

export default function ProfilePage({
                                        username = 'Username',
                                        stats = { playlists: 0, songs: 0, followers: 0, following: 0 },
                                        profileUrl = window.location.href
                                    }) {
    const { playlists, songs, followers, following } = stats;

    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl)
            .then(() => console.log('Link copiado!'))
            .catch(() => console.error('Falha ao copiar link'));
    };

    const badges = [
        { text: 'Achievement 1', tier: 'bronze' },
        { text: 'Achievement 2', tier: 'silver' },
        { text: 'Achievement 3', tier: 'gold' }
    ];
    const badgeRefs = useRef([]);
    const [overflowFlags, setOverflowFlags] = useState([false, false, false]);

    useLayoutEffect(() => {
        const newFlags = badgeRefs.current.map(el => {
            if (!el) return false;
            return el.scrollWidth > el.parentElement.clientWidth;
        });
        setOverflowFlags(newFlags);
    }, []);

    // Playlists (a substituir por dados da BD mais tarde)
    const playlistsList = Array.from({ length: 7 }, (_, i) => `Playlist ${i+1}`);
    const renderPlaylists = () => playlistsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    // Playlists (a substituir por dados da BD mais tarde)
    const artistsList = Array.from({ length: 7 }, (_, i) => `Artist ${i+1}`);
    const renderArtists = () => artistsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    const recentTracks = [
        { title: 'Song A', artist: 'Artist A', duration: '03:45', listens: '1.2M' },
        { title: 'Song B', artist: 'Artist B', duration: '04:12', listens: '980K' },
        { title: 'Song C', artist: 'Artist C', duration: '03:31', listens: '292K' },
        { title: 'Song D', artist: 'Artist D', duration: '04:44', listens: '1.4K' },
        { title: 'Song E', artist: 'Artist E', duration: '05:11', listens: '431K' },
        // … etc …
    ];
    const renderRecentTracks = () =>
        recentTracks.map((item, idx) => (
            <div key={idx} className="trackRow verticalRow">
                <span className="trackNumber">{idx + 1}</span>
                <div className="coverPlaceholderSmall" onClick={() => console.log(item.title)} />
                <div className="trackInfoSmall">
                    <span className="smallTitle" onClick={() => console.log(item.title)}>{item.title}</span>
                    <span className="smallArtist" onClick={() => console.log(item.artist)}>{item.artist}</span>
                </div>
                <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />
                <span className="smallDuration" onClick={() => console.log(item.duration)}>{item.duration}</span>
                <span className="smallListens" onClick={() => console.log(item.listens)}>{item.listens}</span>
                <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
            </div>
        ));

    return (
        <div className="profileSection">
            <div className="profileHeader">
                {/* wrapper principal com gap de 20px entre avatar e textos */}
                <div className="profileMain">
                    {/* 1) Avatar circular 160×160 */}
                    <div className="profileAvatar" />

                    {/* 2) Textos: “Profile” e “Username” */}
                    <div className="profileDetails">
                        <span className="profileLabel">Profile</span>
                        <span className="profileUsername">{username}</span>
                    </div>
                </div>

                {/* 3) Ícones de ação */}
                <div className="profileActions">
                    <FiEdit2
                        className="actionIcon editIcon"
                        onClick={() => console.log('Editar perfil')}
                    />
                    <FiShare2
                        className="actionIcon shareIcon"
                        onClick={copyLink}
                    />
                </div>
            </div>

            {/* 4) Estatísticas */}
            <div className="profileStats">
                <span className="statsPrimary">
                    {playlists} Playlists – {songs} Songs
                </span>
                <span className="statsSecondary">
                    &nbsp;– {followers} Followers – {following} Following
                </span>
            </div>

            {/* 5) Link para o perfil */}
            <div className="profileLink" onClick={copyLink}>
                link to profile ({profileUrl})
            </div>

            <div className="profileBadges">
                {badges.map((badge, i) => (
                    <div
                        key={i}
                        className={`profileBadge ${badge.tier}`}
                    >
                        <span
                            ref={el => badgeRefs.current[i] = el}
                            className={`badgeText${overflowFlags[i] ? " marquee-hover" : ""}`}
                        >
                        {badge.text}
                        </span>
                    </div>
                ))}
            </div>

            <hr className="profileDivider" />

            <div className="playlistsScroll">
                <div className="recommendHeader">
                    <span className="sectionTitle">Public Playlists</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderPlaylists()}
                    </div>
                </div>
            </div>

            <div className="playlistsScroll">
                <div className="recommendHeader">
                    <span className="sectionTitle">Top Artists this month</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="carouselWrapper">
                    <div className="carousel">
                        {renderArtists()}
                    </div>
                </div>
            </div>

            <div className="verticalSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Recent tracks</span>
                    <button className="seeAll">see all</button>
                </div>
                <div className="verticalWrapper">
                    {renderRecentTracks()}
                </div>
            </div>
        </div>
    );
}
