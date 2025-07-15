import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import '../../css/Pages/LiveStreams.css';
import { streams } from '../../data/liveStreams';
import api from "../services/api";

export default function LiveStreamsPage() {
    // Search bar state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]); // resultados da API

    // Carousel data states
    const [recommended, setRecommended] = useState([]);
    const [topLives, setTopLives] = useState([]);
    const [favourites, setFavourites] = useState([]);

    const [recAll, setRecAll] = useState(false);
    const [topAll, setTopAll] = useState(false);
    const [favAll, setFavAll] = useState(false);

    // Fetch initial data
    useEffect(() => {
        api.get('/lives/recommended')
            .then(({ data }) => setRecommended(data))
            .catch(err => console.error('Error loading recommended:', err));

        api.get('/lives/top')
            .then(({ data }) => setTopLives(data))
            .catch(err => console.error('Error loading top lives:', err));

        api.get('/lives/favourites')
            .then(({ data }) => setFavourites(data))
            .catch(err => console.error('Error loading favourites:', err));
    }, []);

    // Compute fallbackRecommended once when topLives loads; won't change on searchTerm
    const fallbackRecommended = useMemo(() => {
        if (recommended.length > 0 || topLives.length === 0) return [];
        // shuffle topLives array
        const arr = [...topLives];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [topLives, recommended]);

    // Decide which array to display: either real recommendations or fallback
    const displayedRecommended =
        recommended.length > 0 ? recommended : fallbackRecommended;

    // Handle search input changes: chamada ao endpoint /lives/search
    const handleSearchChange = async e => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim()) {
            try {
                const { data } = await api.get('/lives/search', { params: { q: term } });
                setSearchResults(data);
            } catch (err) {
                console.error('Error searching lives:', err);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    // Generic render for live items
    const renderStreams = (items, count) =>
        items.slice(0, count).map(live => (
            <NavLink
                key={`${live.url}::${live.criador_username}`}
                to={`/livestream/${encodeURIComponent(live.url)}`}
                className="liveCoverCard"
            >
                <div
                    className="liveCoverCircle"
                    style={{ backgroundImage: `url(${live.capa})` }}
                />
                <span className="liveCoverOwner">{live.criador_username}</span>
                <span className="liveCoverType">{live.tipo}</span>
            </NavLink>
        ));

    // Community Events (unchanged)
    const genresStatus = [
        { genre: 'Rock', status: 'Closed' },
        { genre: 'Pop', status: 'On Going' },
        { genre: 'Hip-Hop', status: 'Closed' },
        { genre: 'Jazz', status: 'On Going' },
        { genre: 'Indie', status: 'Closed' },
        { genre: 'Funk', status: 'On Going' }
    ];
    const renderEventCarousel = () =>
        genresStatus.map(({ genre, status }) => {
            const to = status === 'Closed'
                ? `/playlist/community-${encodeURIComponent(genre)}`
                : `/communityEvent/${encodeURIComponent(genre)}`;
            return (
                <NavLink key={genre} to={to} className="coverCard">
                    <div className="coverPlaceholder" />
                    <span className="coverTitle">{genre}</span>
                    <span className="coverArtist">{status}</span>
                </NavLink>
            );
        });

    return (
        <div className="liveSection">
            {/* Search Bar */}
            <div className="liveSearchBarContainer">
                <div className="liveSearchWrapper searchContainerLive">
                    <div className="liveSearchIcon">
                        <FiSearch className="searchIcon" />
                    </div>
                    <input
                        type="text"
                        className="liveSearchInput"
                        placeholder="Search live streams..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchResults.length > 0 && (
                        <ul className="suggestions">
                            {searchResults.map(live => (
                                <NavLink
                                    key={live.url}
                                    to={`/livestream/${encodeURIComponent(live.url)}`}
                                    className="suggestionItem"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <div
                                        className="suggestionThumb userThumb"
                                        style={{ backgroundImage: `url(${live.capa})` }}
                                    />
                                    <div className="suggestionText">
                                        <div className="suggestionTitle">{live.criador_username}</div>
                                        <div className="suggestionSubtitle">{live.tipo}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Recommended Live Streams */}
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
                        {renderStreams(displayedRecommended, recAll ? displayedRecommended.length : 8)}
                    </div>
                </div>
            </div>

            {/* Top Live Streams */}
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
                        {renderStreams(topLives, topAll ? topLives.length : 8)}
                    </div>
                </div>
            </div>

            {/* Your Favourite Artists (hide if none) */}
            {favourites.length > 0 && (
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
                            {renderStreams(favourites, favAll ? favourites.length : 6)}
                        </div>
                    </div>
                </div>
            )}

            {/* Community Events */}
            <div className="liveCarouselSection">
                <div className="liveCarouselHeader">
                    <span className="liveSectionTitle">Community Events</span>
                </div>
                <div className="liveCarouselWrapper">
                    <div className="carousel">{renderEventCarousel()}</div>
                </div>
            </div>
        </div>
    );
}