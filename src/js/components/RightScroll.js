import React, {useState} from 'react'
import {FiSearch, FiBell, FiAward, FiUser, FiHome, FiChevronDown} from 'react-icons/fi'

export default function TopIcons() {

    const [activeTab, setActiveTab] = useState('Playlist');

    const renderCards = (start) =>
        Array.from({ length: 6 }, (_, i) => i + start).map((n) => (
            <div
                key={n}
                className="cardItem"
                onClick={() => console.log('clicou em Music', n)}
            >
                <FiHome className="cardIcon" />
                <div className="cardText">
                    <span className="cardTitle">Music {n}</span>
                    <span className="cardSubtitle">Artist {n}</span>
                </div>
                <FiChevronDown className="cardArrow" />
            </div>
        ));

    return (
        <div className="rightScroll">
            {/* Recently Played */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Recently Played</h2>
                    <button className="seeAll">
                        <span>see all</span>
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
                <div className="cardList">{renderCards(1)}</div>
            </div>

            {/* Discography */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Discography</h2>
                    <button className="seeAll">
                        <span>see all</span>
                    </button>
                </div>
                <div className="cardList">{renderCards(1)}</div>
            </div>

            {/* Queue */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Queue</h2>
                    <button className="seeAll">
                        <span>see all</span>
                    </button>
                </div>
                <div className="cardList">{renderCards(1)}</div>
            </div>
        </div>
    )
}