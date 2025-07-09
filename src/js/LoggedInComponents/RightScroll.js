import React, {useState} from 'react'
import { NavLink } from 'react-router-dom';
import {FiMusic, FiFolder, FiHome, FiChevronDown} from 'react-icons/fi'
import { playlists } from '../../data/playlists';
import { musics } from '../../data/musics';

function CardIcon({ activeTab }) {
    if (activeTab === 'Playlist') return <FiFolder className="cardIcon" />;
    if (activeTab === 'Music') return <FiMusic className="cardIcon" />;
    if (activeTab === 'User') return <span className="cardIcon userCircle" />;
    // fallback
    return <FiHome className="cardIcon" />;
}

export default function RightScroll() {

    const [activeTab, setActiveTab] = useState('Playlist');

    const renderCards = () => {
        if (activeTab === 'Playlist') {
            return playlists.slice(0, 6).map(pl => (
                <NavLink key={pl.id} to={`/playlist/${pl.id}`} className="cardItem">
                    <CardIcon activeTab="Playlist" />
                    <div className="cardText">
                        <span className="cardTitle">{pl.title}</span>
                        <span className="cardSubtitle">{pl.owner}</span>
                    </div>
                    <FiChevronDown className="cardArrow" />
                </NavLink>
            ));
        }

        if (activeTab === 'Music') {
            return musics.slice(0, 6).map(m => (
                <NavLink key={m.id} to={`/player/${m.id}`} className="cardItem">
                    <CardIcon activeTab="Music" />
                    <div className="cardText">
                        <span className="cardTitle">{m.title}</span>
                        <span className="cardSubtitle">{m.artist}</span>
                    </div>
                    <FiChevronDown className="cardArrow" />
                </NavLink>
            ));
        }

        // User tab: pega nomes únicos dos donos das playlists
        const owners = Array.from(new Set(playlists.map(pl => pl.owner)));
        return owners.slice(0, 6).map(owner => (
            <NavLink
                key={owner}
                to={`/profile/${encodeURIComponent(owner)}`}
                className="cardItem"
            >
                <CardIcon activeTab="User" />
                <div className="cardText">
                    <span className="cardTitle">{owner}</span>
                </div>
                <FiChevronDown className="cardArrow" />
            </NavLink>
        ));
    };

    const renderOtherCards = () =>
        musics.slice(0, 6).map(m => (
            <NavLink key={m.id} to={`/player/${m.id}`} className="cardItem">
                <FiMusic className="cardIcon" />
                <div className="cardText">
                    <span className="cardTitle">{m.title}</span>
                    <span className="cardSubtitle">{m.artist}</span>
                </div>
                <FiChevronDown className="cardArrow" />
            </NavLink>
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
                <div className="cardList">{renderCards()}</div>
            </div>

            {/* Discography */}
            <div className="section">
                <div className="sectionHeader">
                    <h2>Discography</h2>
                    <button className="seeAll">
                        <span>see all</span>
                    </button>
                </div>
                <div className="cardList">{renderOtherCards()}</div>
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