import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import '../../css/Pages/LiveStreams.css';
import { streams } from '../../data/liveStreams';

export default function LiveStreamsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [recAll, setRecAll]   = useState(false);
    const [topAll, setTopAll]   = useState(false);
    const [favAll, setFavAll]   = useState(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        console.log('Buscando por:', e.target.value);
    };

    const handleStreamClick = (id) => {
        console.log(`Stream ${id} clicado!`);
        // ex.: navigate(`/livestream/${id}`)
    }

    // agora renderStreams recebe um inteiro 'count'
    const renderStreams = (count) =>
        streams
            .slice(0, count)               // pega só os primeiros 'count'
            .map(({ id, owner, type, imageUrl }) => (
                <div
                    key={id}
                    className="liveCoverCard"
                    onClick={() => handleStreamClick(id)}
                >
                    <div
                        className="liveCoverCircle"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <span className="liveCoverOwner">{owner}</span>
                    <span className="liveCoverType">{type}</span>
                </div>
            ));

    return (
        <div className="liveSection">
            <div className="liveSearchBarContainer">
                <div className="liveSearchWrapper">
                    <div
                        className="liveSearchIcon"
                        onClick={() => console.log('Clique na lupa de busca!')}
                    >
                        <FiSearch className="searchIcon" />
                    </div>

                    <input
                        type="text"
                        className="liveSearchInput"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
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
        </div>
    );
}
