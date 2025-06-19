import React, {useLayoutEffect, useRef, useState} from 'react';
import { FiEdit2, FiShare2, FiBookmark } from 'react-icons/fi';
import '../../css/Pages/Achievements.css';

export default function AchievementsPage({
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

    const [activeTab, setActiveTab] = useState('Owned');

    const [badgeMap, setBadgeMap] = useState({});

    const toggleOwned = (ownedIdx) => {
        setBadgeMap(prev => {
            const next = { ...prev };
            if (ownedIdx in next) {
                // já mapeado: removemos
                delete next[ownedIdx];
            } else {
                // não mapeado: procura primeiro badgeIdx livre
                const used = new Set(Object.values(next));
                const freeIdx = [0,1,2].find(i => !used.has(i));
                if (freeIdx !== undefined) {
                    next[ownedIdx] = freeIdx;
                }
                // se não houver slot livre, não faz nada
            }
            return next;
        });
    };

    const isBadgeVisible = (badgeIdx) =>
        Object.values(badgeMap).includes(badgeIdx);
    const isOwnedSelected = (ownedIdx) =>
        ownedIdx in badgeMap;

    const owned_achievements = [
        { title: 'Achievement A', description: 'Achievement description A', date: '01/01', year: '2021', time: '20:53', tier: 'bronze', threshold: '50', currentState: '200'},
        { title: 'Achievement B', description: 'Achievement description A', date: '03/02', year: '2022', time: '01:44', tier: 'silver', threshold: '100', currentState: '200'},
        { title: 'Achievement C', description: 'Achievement description A', date: '06/03', year: '2020', time: '06:16', tier: 'gold', threshold: '200', currentState: '200'},
        { title: 'Achievement D', description: 'Achievement description D', date: '09/04', year: '2018', time: '07:12', tier: 'bronze', threshold: '50', currentState: '200'},
        { title: 'Achievement E', description: 'Achievement description D', date: '12/05', year: '2024', time: '09:09', tier: 'silver', threshold: '100', currentState: '200'},
        { title: 'Achievement F', description: 'Achievement description D', date: '15/06', year: '2025', time: '12:18', tier: 'gold', threshold: '200', currentState: '200'},
        { title: 'Achievement G', description: 'Achievement description G', date: '18/07', year: '2023', time: '13:19', tier: 'bronze', threshold: '50', currentState: '200'},
        { title: 'Achievement H', description: 'Achievement description G', date: '21/08', year: '2018', time: '13:25', tier: 'silver', threshold: '100', currentState: '200'},
        { title: 'Achievement I', description: 'Achievement description G', date: '24/09', year: '2015', time: '13:57', tier: 'gold', threshold: '200', currentState: '200'},
        { title: 'Achievement J', description: 'Achievement description J', date: '27/10', year: '2011', time: '17:19', tier: 'bronze', threshold: '50', currentState: '200'},
        { title: 'Achievement K', description: 'Achievement description J', date: '30/11', year: '2013', time: '20:52', tier: 'silver', threshold: '100', currentState: '200'},
        { title: 'Achievement L', description: 'Achievement description J', date: '02/12', year: '2016', time: '23:22', tier: 'gold', threshold: '200', currentState: '200'},

        // ... mais items
    ];

    const not_owned_achievements = [
        { title: 'Achievement M', description: 'Achievement description M', date: '02/01', year: '2022', time: '20:53', tier: 'bronze', threshold: '50', currentState: '23'},
        { title: 'Achievement N', description: 'Achievement description M', date: '04/02', year: '2023', time: '01:44', tier: 'silver', threshold: '100', currentState: '23'},
        { title: 'Achievement O', description: 'Achievement description M', date: '07/03', year: '2021', time: '06:16', tier: 'gold', threshold: '200', currentState: '23'},
        { title: 'Achievement P', description: 'Achievement description P', date: '10/04', year: '2019', time: '07:12', tier: 'bronze', threshold: '50', currentState: '33'},
        { title: 'Achievement Q', description: 'Achievement description P', date: '13/05', year: '2025', time: '09:09', tier: 'silver', threshold: '100', currentState: '33'},
        { title: 'Achievement R', description: 'Achievement description P', date: '16/06', year: '2024', time: '12:18', tier: 'gold', threshold: '200', currentState: '33'},
        { title: 'Achievement S', description: 'Achievement description S', date: '19/07', year: '2024', time: '13:19', tier: 'bronze', threshold: '50', currentState: '11'},
        { title: 'Achievement T', description: 'Achievement description S', date: '22/08', year: '2019', time: '13:25', tier: 'silver', threshold: '100', currentState: '11'},
        { title: 'Achievement U', description: 'Achievement description S', date: '25/09', year: '2016', time: '13:57', tier: 'gold', threshold: '200', currentState: '11'},
        { title: 'Achievement V', description: 'Achievement description V', date: '28/10', year: '2012', time: '17:19', tier: 'bronze', threshold: '50', currentState: '7'},
        { title: 'Achievement W', description: 'Achievement description V', date: '29/11', year: '2014', time: '20:52', tier: 'silver', threshold: '100', currentState: '7'},
        { title: 'Achievement X', description: 'Achievement description V', date: '03/12', year: '2017', time: '23:22', tier: 'gold', threshold: '200', currentState: '7'},

        // ... mais items
    ];

    return (
        <div className="achievementsSection">
            <div className="achievementsHeader">
                {/* wrapper principal com gap de 20px entre avatar e textos */}
                <div className="achievementsMain">
                    {/* 1) Avatar circular 160×160 */}
                    <div className="achievementsAvatar" />

                    {/* 2) Textos: “Profile” e “Username” */}
                    <div className="achievementsDetails">
                        <span className="achievementsLabel">Achievements</span>
                        <span className="achievementsUsername">{username}</span>
                    </div>
                </div>

                {/* 3) Ícones de ação */}
                <div className="achievementsActions">
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
            <div className="achievementsStats">
                <span className="statsPrimary">
                    {playlists} Playlists – {songs} Songs
                </span>
                <span className="statsSecondary">
                    &nbsp;– {followers} Followers – {following} Following
                </span>
            </div>

            {/* 5) Link para o perfil */}
            <div className="achievementsLink" onClick={copyLink}>
                link to profile ({profileUrl})
            </div>

            <div className="achievementsBadges"> {[0,1,2].map(badgeIdx => {
                const entry = Object.entries(badgeMap)
                    .find(([ownedIdx, bIdx]) => bIdx === badgeIdx);
                const ownedIdx = entry ? Number(entry[0]) : null;
                const visible = ownedIdx !== null;
                if (!visible) {
                    return (
                        <div key={badgeIdx}
                            className="achievementsBadge hidden"
                        />
                    );
                }

                const {title, tier} = owned_achievements[ownedIdx];
                return (
                    <div
                        key={badgeIdx}
                        className={`achievementsBadge ${tier}`}
                        ref={el => badgeRefs.current[badgeIdx] = el}
                    >
                        <span
                            className={`badgeText${overflowFlags[badgeIdx] ? " marquee-hover" : ""}`}
                        >
                        {title}
                        </span>
                    </div>
                );
            })}
            </div>

            {/* === PARTE INFERIOR === */}
            <div className="achievementsTabsContainer">
                <div className="achievementsTabs">
                    {['Owned','Not Owned'].map(t => (
                        <button
                            key={t}
                            className={`tab${activeTab===t?' active':''}`}
                            onClick={()=>setActiveTab(t)}
                        >{t}</button>
                    ))}
                </div>
                <hr className="achievementsTabDivider"/>
            </div>

            {activeTab === 'Owned' && (
                <div className="badgeList">
                    {owned_achievements.map((item, idx) => (
                        <div key={idx} className="badgeRow">
                            <span className="badgeNumber">{idx+1}</span>
                            <div
                                className="coverPlaceholderSmall"
                                 onClick={() => toggleOwned(idx)}
                            />
                            <div className="badgeInfoSmall">
                                <div
                                    className="badgeTitleContainer"
                                    onClick={() => toggleOwned(idx)}
                                    >
                                    <span className="smallTitle">{item.title}</span>
                                    {isOwnedSelected(idx) && (
                                        <FiBookmark className="bookmarkIcon" />
                                    )}
                                </div>

                                <span className="smallArtist"
                                      onClick={() => toggleOwned(idx)}>
                                    {item.description}
                                </span>
                            </div>
                            <span className="badgeDate">{item.date}</span>
                            <span className="badgeYear">{item.year}</span>
                            <span className="badgeTime">{item.time}</span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'Not Owned' && (
                <div className="badgeList">
                    {not_owned_achievements.map((item, idx) => (
                        <div key={idx} className="badgeRow">
                            <span className="badgeNumber">{idx+1}</span>
                            <div className="coverPlaceholderSmall" onClick={() => console.log(item.title)}/>
                            <div className="badgeInfoSmall">
                                <span className="smallTitle" onClick={() => console.log(item.title)}>{item.title}</span>
                                <span className="smallArtist" onClick={() => console.log(item.description)}>{item.description}</span>
                            </div>
                            <span className="badgeProgress">{item.currentState}/{item.threshold}</span>
                            <span className="badgeDate">{item.date}</span>
                            <span className="badgeYear">{item.year}</span>
                            <span className="badgeTime">{item.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}