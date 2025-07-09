import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import '../../css/Pages/LiveStream.css';
import '../../css/Pages/CommunityEvent.css';
import { musics } from '../../data/musics';
import communityEventTest from '../../data/communityEventTest';

function formatTimeRemaining(endTs) {
    const diffMs = endTs - Date.now();
    if (diffMs <= 0) return 'Event Closed';
    const days = Math.floor(diffMs / 86400000);
    const hrs  = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${days}d ${hrs}h ${mins}m remaining`;
}

export default function CommunityEventPage() {
    const { category } = useParams();
    // Para testes, evento termina daqui a 5 dias
    const eventEndTs = Date.now() + 5 * 24 * 3600000;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    // só músicas da categoria do evento
    const eligibleSongs = useMemo(
        () => musics.filter(m => m.genres.includes(category)),
        [category]
    );
    // sugestões de pesquisa
    const suggestions = useMemo(
        () => searchTerm
            ? eligibleSongs.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
            : [],
        [searchTerm, eligibleSongs]
    );

    // lista de votos (teste)
    const [votes, setVotes] = useState(communityEventTest.votableSongs);

    const sortedVotes = useMemo(
        () => [...votes].sort((a, b) => b.votes - a.votes),
        [votes]
    );

    const handleSelectSong = song => {
        // visual: marca como selecionada
        setSelectedId(song.id);
    };

    return (
        <div className="liveStreamPageSection">
            <div className="liveTopRectangle" />

            {/* Header */}
            <div className="liveDetail">
                <h1 className="liveStreamTitle">
                    {category} <span className="liveStreamType">(Community Event)</span>
                </h1>
                <div className="liveInfo">
                    {formatTimeRemaining(eventEndTs)}
                </div>
            </div>

            {/* Search para escolher música */}
            <div className="searchBarContainerEvent">
                <div className="searchWrapper searchContainerExplore">
                    <div className="searchIconWrapper" onClick={() => {/* opcional */}}>
                        <FiSearch className="searchIcon" />
                    </div>
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Search songs to add..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions">
                            {suggestions.map(m => (
                                <li
                                    key={m.id}
                                    className="suggestionItem"
                                    onClick={() => handleSelectSong(m)}
                                >
                                    <div className="suggestionThumb songThumb"
                                         style={{ backgroundImage: `url('/placeholder-music.png')` }}
                                     />
                                     <div className="suggestionText">
                                         <div className="suggestionTitle">{m.title}</div>
                                         <div className="suggestionSubtitle">{m.artist}</div>
                                     </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Lista de músicas votáveis */}
            <div className="verticalSection">
                <div className="recommendHeader">
                    <span className="sectionTitle">Songs to Vote</span>
                </div>
                <div className="verticalWrapper">
                    {sortedVotes.map((s, idx) => (
                        <div
                            key={s.id}
                            className="trackRow communityTrackRow verticalRow"
                        >
                            <span className="trackNumber">{idx + 1}</span>
                            <div className="coverPlaceholderSmall" />
                            <div className="trackInfoSmall">
                                <span className="smallTitle">{s.title}</span>
                                <span className="smallArtist">{s.artist}</span>
                            </div>
                            <span className="voteCount">{s.votes} votes</span>
                            <button
                                className={`checkButton${selectedId===s.id?' checked':''}`}
                                onClick={() => handleSelectSong(s)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Seção de comentários */}
            <div className="commentsSection">
                <input
                    type="text"
                    className="commentInput"
                    placeholder="Write a comment"
                />
                <div className="commentsList">
                    {communityEventTest.comments.map((c,i) => (
                        <div key={i} className="commentItem">
                            <div
                                className="commentAvatar"
                                style={{ backgroundImage: `url(${c.avatarUrl})` }}
                            />
                            <div className="commentContent">
                                <span className="commentUser">{c.user}:&nbsp;</span>
                                <span className="commentText">{c.text}</span>
                            </div>
                            <div className="commentMeta">
                                <span className="commentTime">{c.timeAgo}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
