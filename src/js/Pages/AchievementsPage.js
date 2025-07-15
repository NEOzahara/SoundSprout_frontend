import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import { FiEdit2, FiShare2, FiBookmark } from 'react-icons/fi';
import '../../css/Pages/Achievements.css';
import api from '../services/api';

export default function AchievementsPage() {

    const { username } = useParams();
    const [profileUser, setProfileUser] = useState({});
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');
    const [stats, setStats] = useState({ playlists:0, songs:0, followers:0, following:0 });
    const [earnedBadges, setEarnedBadges] = useState([]);       // todos os badges do user
    const [selectedBadges, setSelectedBadges] = useState([]);   // top 3 selecionados
    const [activeTab, setActiveTab] = useState('Owned');
    const badgeRefs = useRef([]);
    const [overflowFlags, setOverflowFlags] = useState([false, false, false]);

    const TIER_COLORS = {
        bronze: '#AA6C39',
        silver: '#777777',
        gold: '#8B6914'
    };

    const isOwn = (() => {
        const me = JSON.parse(localStorage.getItem('user')||'{}');
        return me.username === username;
    })();

    // 1) carrega dados de perfil + stats
    useEffect(() => {
        api.get(`/utilizadores/${username}`)
            .then(({ data }) => setProfileUser(data))
            .catch(console.error);
        api.get(`/utilizadores/${username}/stats`)
            .then(({ data }) => setStats(data))
            .catch(console.error);
    }, [username]);

    // 2) carrega todos os badges ganhos
    useEffect(() => {
        api.get(`/utilizadores/${username}/achievements`)
            .then(({ data }) => {
                const sorted = data.sort((a, b) =>
                    new Date(b.data_atribuicao) - new Date(a.data_atribuicao)
                );
                setEarnedBadges(sorted);
            })
            .catch(console.error);
    }, [username]);

    // 3) carrega os 3 seleccionados
    useEffect(() => {
        api.get(`/utilizadores/${username}/selected-achievements`)
            .then(({ data }) => setSelectedBadges(data))
            .catch(console.error);
    }, [username]);

    // recalcula flags de overflow nos badges visíveis
    useLayoutEffect(() => {
        const flags = badgeRefs.current.map(el => {
            if (!el) return false;
            return el.scrollWidth > el.parentElement.clientWidth;
        });
        setOverflowFlags(flags);
    }, [selectedBadges]);

    // toggles: adiciona/remove e envia PUT
    const toggleBadge = (badge) => {
        if (!isOwn) return;
        const exists = selectedBadges.find(b =>
            b.badge_name === badge.badge_name && b.badge_tier === badge.badge_tier
        );
        let next;
        if (exists) {
            next = selectedBadges
                .filter(b => !(b.badge_name === badge.badge_name && b.badge_tier === badge.badge_tier))
                .map((b,i) => ({ ...b, position: i }));
        } else {
            if (selectedBadges.length >= 3) return;
            next = [...selectedBadges,
                {
                    badge_name: badge.badge_name,
                    badge_tier: badge.badge_tier,
                    position: selectedBadges.length
                }
            ];
        }
        setSelectedBadges(next);
        api.put(`/utilizadores/${username}/selected-achievements`, { selected: next })
            .catch(console.error);
    };

    const isSelected = (idx) =>
        selectedBadges.some(b => b.position === idx);

    const profileUrl = window.location.href;
    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl)
            .then(() => console.log('Link copiado!'))
            .catch(() => console.error('Falha ao copiar link'));
    };

    const { playlists, songs, followers, following } = stats;

    useLayoutEffect(() => {
        const newFlags = badgeRefs.current.map(el => {
            if (!el) return false;
            return el.scrollWidth > el.parentElement.clientWidth;
        });
        setOverflowFlags(newFlags);
    }, []);


    const [badgeMap, setBadgeMap] = useState({});

    // carrega do localStorage no mount
    useEffect(() => {
        const stored = localStorage.getItem('profileBadges');
        if (!stored) return;
        try {
            const savedArr = JSON.parse(stored);
            // savedArr é algo como [{ title, tier, … }, …] na ordem dos slots 0,1,2
            const newMap = {};
            savedArr.forEach((item, badgeIdx) => {
                // encontra o ownedIdx cujo title bate
                const ownedIdx = owned_achievements.findIndex(a => a.title === item.title);
                if (ownedIdx >= 0) {
                    newMap[ownedIdx] = badgeIdx;
                }
            });
            setBadgeMap(newMap);
        } catch (e) {
            console.error('Não consegui parsear profileBadges:', e);
        }
    }, []);

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
            const selected = Object.entries(next)
                .sort((a,b) => a[1] - b[1]) // ordena pelo slot (0,1,2)
                .map(([ownedIdx]) => owned_achievements[ownedIdx]);
            localStorage.setItem('profileBadges',
                JSON.stringify(selected)
            );
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
                    <div
                        className="achievementsAvatar"
                        style={{
                            backgroundImage: profileUser.foto
                                ? `url(${baseUrl}${profileUser.foto.startsWith('/') ? '' : '/'}${profileUser.foto})`
                                : undefined
                        }}
                    />

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
                    {stats.playlists} Playlists – {stats.songs} Songs
                </span>
                <span className="statsSecondary">
                    &nbsp;– {stats.followers} Followers – {stats.following} Following
                </span>
            </div>

            {/* 5) Link para o perfil */}
            <div className="achievementsLink" onClick={copyLink}>
                link to profile ({profileUrl})
            </div>

            <div className="achievementsBadges">
                {[0,1,2].map(pos  => {
                const entry = selectedBadges.find(b => b.position === pos);
                if (!entry) {
                    return <div key={pos} className="achievementsBadge hidden"/>;
                }
                return (
                    <div
                        key={pos}
                        className="achievementsBadge"
                        style={{ backgroundColor: TIER_COLORS[entry.badge_tier] }}
                        ref={el => badgeRefs.current[pos] = el}
                    >
                        <span
                            className={`badgeText${overflowFlags[pos] ? " marquee-hover" : ""}`}>
                            {entry.badge_name}</span>
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
                    {earnedBadges.map((badge, idx) => {
                        const selected = selectedBadges.some(b =>
                            b.badge_name===badge.badge_name && b.badge_tier===badge.badge_tier
                        );
                        return (
                            <div key={idx} className="badgeRow">
                                <span className="badgeNumber">{idx+1}</span>
                                <div
                                    className="coverPlaceholderSmall"
                                    style={{
                                        backgroundColor: TIER_COLORS[badge.badge_tier]
                                    }}
                                    onClick={()=>toggleBadge(badge)}
                                />
                                <div className="badgeInfoSmall">
                                    <div
                                        className="badgeTitleContainer"
                                        onClick={()=>toggleBadge(badge)}
                                    >
                                        <span className="smallTitle">{badge.badge_name}</span>
                                        {selected && <FiBookmark className="bookmarkIcon"/>}
                                    </div>
                                    <span
                                        className="smallArtist"
                                        onClick={() => toggleOwned(idx)}
                                    >{badge.descricao}</span>
                                </div>
                                <span className="badgeDate">
                                    {new Date(badge.data_atribuicao)
                                        .toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </span>
                            </div>
                            );
                        })}
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