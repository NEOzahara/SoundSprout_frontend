import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import '../../css/Pages/LiveStreams.css';
import { streams } from '../../data/liveStreams';

export default function LiveStreamsPage() {

    const [searchTerm, setSearchTerm] = useState('');
    const results = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return [];
        return streams
            .filter(s =>
                s.owner.toLowerCase().includes(q) ||
                s.type.toLowerCase().includes(q)
            )
            .map(s => ({
                id: s.id,
                owner: s.owner,
                type: s.type,
                imageUrl: s.imageUrl
            }));
    }, [searchTerm]);

    const [recAll, setRecAll] = useState(false);
    const [topAll, setTopAll] = useState(false);
    const [favAll, setFavAll] = useState(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        console.log('Buscando por:', e.target.value);
    };

    const handleStreamClick = (id) => {
        console.log(`Stream ${id} clicado!`);
        // ex.: navigate(`/livestream/${id}`)
    }

    const genresStatus = [
        { genre: 'Rock', status: 'Closed' },
        { genre: 'Pop', status: 'On Going' },
        { genre: 'Hip-Hop', status: 'Closed' },
        { genre: 'Jazz', status: 'On Going' },
        { genre: 'Indie', status: 'Closed' },
        { genre: 'Funk', status: 'On Going' }
    ];

    // agora renderStreams recebe um inteiro 'count'
    const renderStreams = (count) =>
        streams
            .slice(0, count)               // pega só os primeiros 'count'
            .map(({ id, owner, type, imageUrl }) => (
                <NavLink
                    key={id}
                    to={`/livestream/${id}`}
                    className="liveCoverCard"
                >
                    <div
                        className="liveCoverCircle"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <span className="liveCoverOwner">{owner}</span>
                    <span className="liveCoverType">{type}</span>
                </NavLink>
            ));

    const renderEventCarousel = () =>
        genresStatus.map(({ genre, status }) => {
            const isClosed = status === 'Closed';
            const isOngoing = status === 'On Going';
            const to = isClosed
                ? `/playlist/community-${encodeURIComponent(genre)}`
                : isOngoing
                    ? `/communityEvent/${encodeURIComponent(genre)}`
                    : undefined;
            return (
                <NavLink
                    key={genre}
                    to={to}
                    className="coverCard"
                >
                    <div className="coverPlaceholder" />
                    <span className="coverTitle">{genre}</span>
                    <span className="coverArtist">{status}</span>
                </NavLink>
            );
        });

    return (
        <div className="liveSection">
            <div className="liveSearchBarContainer">
                <div className="liveSearchWrapper searchContainerLive">
                    <div
                        className="liveSearchIcon"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIcon" />
                    </div>

                    <input
                        type="text"
                        className="liveSearchInput"
                        placeholder="Search live streams..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {results.length > 0 && (
                        <ul className="suggestions">
                            {results.map(r => (
                                <NavLink
                                    key={r.id}
                                    to={`/livestream/${r.id}`}
                                    className="suggestionItem"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <div
                                        className="suggestionThumb userThumb"
                                        style={{ backgroundImage: `url(${r.imageUrl})` }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{r.owner}</div>
                                        <div className="suggestionSubtitle">{r.type}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* primeira caixa de carrossel */}
            <div className="liveCarouselSection">
                <div className="liveCarouselHeader">
                    <span className="liveSectionTitle">Recommended Live Streams</span>
                    <button
                        className={`liveSeeAll${recAll ? ' expanded' : ''}`}
                        onClick={() => setRecAll(p => !p)}
                    >
                        see all
                    </button>
                </div>
                <div className="liveCarouselWrapper">
                    <div className="liveCarousel">
                        {renderStreams(recAll ? streams.length : 6)}
                    </div>
                </div>
            </div>

            {/* segunda caixa de carrossel */}
            <div className="liveCarouselSection">
                <div className="liveCarouselHeader">
                    <span className="liveSectionTitle">Top Live Streams</span>
                    <button
                        className={`liveSeeAll${topAll ? ' expanded' : ''}`}
                        onClick={() => setTopAll(p => !p)}
                    >
                        see all
                    </button>
                </div>
                <div className="liveCarouselWrapper">
                    <div className="liveCarousel">
                        {renderStreams(topAll ? streams.length : 6)}
                    </div>
                </div>
            </div>

            {/* terceira caixa de carrossel */}
            <div className="liveCarouselSection">
                <div className="liveCarouselHeader">
                    <span className="liveSectionTitle">Your Favourite Artists</span>
                    <button
                        className={`liveSeeAll${favAll ? ' expanded' : ''}`}
                        onClick={() => setFavAll(p => !p)}
                    >
                        see all
                    </button>
                </div>
                <div className="liveCarouselWrapper">
                    <div className="liveCarousel">
                        {renderStreams(favAll ? streams.length : 6)}
                    </div>
                </div>
            </div>

            {/* Carrossel de categorias/estados */}
            <div className="liveCarouselSection">
                <div className="liveCarouselHeader">
                    <span className="liveSectionTitle">Live Genres</span>
                    {/* Não precisas de botão "see all" mas podes adicionar se quiseres */}
                </div>
                <div className="liveCarouselWrapper">
                    <div className="carousel">{renderEventCarousel()}</div>
                </div>
            </div>

        </div>
    );
}
