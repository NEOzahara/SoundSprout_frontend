import React, { useState } from 'react';
import Layout from '../components/Layout';
import '../../css/Home.css';

export default function HomePage () {

    const handleCoverClick  = n => console.log(`Music ${n} clicado!`);
    const handleArtistClick = n => console.log(`Artist ${n} clicado!`);

    const renderCovers = (count) =>
        Array.from({ length: count }, (_, i) => i + 1).map((n) => (
            <div key={n} className="coverCard">
                <div
                    className="coverPlaceholder"
                    onClick={() => handleCoverClick(n)}
                />
                <span
                    className="coverTitle"
                    onClick={() => handleCoverClick(n)}
                >
                    Song {n}
                </span>
                <span
                    className="coverArtist"
                    onClick={() => handleArtistClick(n)}
                >
                    Artist {n}
                </span>
            </div>
        ));

    return (
        <div className="recommendSection">
            <div className="recommendHeader">
                <span className="sectionTitle">Recommended songs</span>
                    <button className="seeAll">see all</button>
            </div>
            <div className="carouselWrapper">
                <div className="carousel">
                    {renderCovers(7)}
                </div>
            </div>
        </div>
    );
};
