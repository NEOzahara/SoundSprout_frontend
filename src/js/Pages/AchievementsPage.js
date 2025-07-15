import React, {useEffect, useLayoutEffect, useRef, useState, useCallback} from 'react';
import { useEffect as useEffectAlias } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiEdit2, FiShare2, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import '../../css/Pages/Achievements.css';
import api from '../services/api';

export default function AchievementsPage() {

    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        const handleUserUpdated = () => {
            const stored = localStorage.getItem('user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
        };
        window.addEventListener('userUpdated', handleUserUpdated);
        return () => {
            window.removeEventListener('userUpdated', handleUserUpdated);
        };
    }, []);

    const [isFollowing, setIsFollowing]           = useState(false);
    const [showDropdown, setShowDropdown]         = useState(false);
    const [showDonatePopup, setShowDonatePopup]   = useState(false);
    const [donateValue, setDonateValue]           = useState("");
    const moreRef = useRef(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');
    const [profileUser, setProfileUser] = useState({});
    const [stats, setStats] = useState({ playlists:0, songs:0, followers:0, following:0 });
    const [earnedBadges, setEarnedBadges] = useState([]);       // todos os badges do user
    const [notOwnedBadges, setNotOwnedBadges] = useState([]);
    const [selectedBadges, setSelectedBadges] = useState([]);   // top 3 selecionados
    const [activeTab, setActiveTab] = useState('Owned');
    const badgeRefs = useRef([]);
    const [overflowFlags, setOverflowFlags] = useState([false, false, false]);

    //const [showTestMode, setShowTestMode] = useState(false); //PARA TESTE

    const TIER_COLORS = {
        bronze: '#AA6C39',
        silver: '#777777',
        gold: '#8B6914'
    };

    const handleClickOutside = useCallback((e) => {
        if (moreRef.current && !moreRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    }, []);

    useEffect(() => {
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown, handleClickOutside]);

    const isOwn = (() => {
        return user?.username === username;
    })();

    useEffect(() => {
        if (!isOwn) {
            api.get(`/utilizadores/${user.username}/following`)
                .then(({ data }) => {
                    const nomes = data.map(u => u.following_username);
                    setIsFollowing(nomes.includes(username));
                })
                .catch(console.error);
        }
    }, [username, user, isOwn]);

    // --- estados para edição de perfil ---
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState(username);
    const [newPhoto, setNewPhoto] = useState(null);
    const [errorEdit, setErrorEdit] = useState('');
    const [successEdit, setSuccessEdit] = useState('');
    const photoInputRef = useRef(null);
    const [editDragOver, setEditDragOver] = useState(false);
    const canSave = (newUsername.trim() !== username) || !!newPhoto;

    const handleSubmitEdit = async e => {
        e.preventDefault();
        setErrorEdit('');
        try {
            const form = new FormData();
            if (newUsername !== username) form.append('username', newUsername);
            if (newPhoto) form.append('foto', newPhoto);
            const { data: { user: updatedUser, accessToken } } =
                await api.patch(`/utilizadores/${username}`, form);

            // atualiza local
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('userUpdated'));
            setUser(updatedUser);
            setProfileUser(updatedUser);
            setSuccessEdit('Perfil atualizado com sucesso!');

            // se mudámos de username, redirecionamos
            if (updatedUser.username !== username) {
                navigate(`/achievements/${updatedUser.username}`, { replace: true });
            }
        } catch (err) {
            setErrorEdit(err.response?.data?.error || 'Erro ao atualizar');
            setSuccessEdit('');
        }
    };

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

    // 3) carrega todos os badges não ganhos
    useEffect(() => {
        api.get(`/utilizadores/${username}/not-owned-achievements`)
            .then(({ data }) => setNotOwnedBadges(data))
            .catch(console.error);
        }, [username]);

    // 4) carrega os 3 seleccionados
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

    const handleFollowToggle = async () => {
        setShowDropdown(false);
        try {
            if (isFollowing) {
                await api.delete(`/utilizadores/seguir/${encodeURIComponent(username)}`);
                setIsFollowing(false);
                setStats(s => ({ ...s, followers: s.followers - 1 }));
            } else {
                await api.post('/utilizadores/seguir', { seguido_username: username });
                setIsFollowing(true);
                setStats(s => ({ ...s, followers: s.followers + 1 }));
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleQuickDonate = v => setDonateValue(v.toString());
    const handleDonateInput = e => setDonateValue(e.target.value.replace(/[^0-9]/g, ''));
    const handleCloseDonate = () => { setShowDonatePopup(false); setDonateValue(''); };

    const handleConfirmDonate = async () => {
        try {
            const { data } = await api.post('/payments/checkout-session', {
                amount: parseFloat(donateValue),
                connectedAccountId: profileUser.stripe_account_id,
                destinatarioUsername: username
            });
            window.location.href = data.url;
        } catch (err) {
            console.error('Erro ao iniciar Checkout:', err);
        }
    };

    const isConfirmEnabled = !!donateValue && parseInt(donateValue) >= 5;
    /*const isConfirmEnabled = !!donateValue &&
        (showTestMode
                ? parseFloat(donateValue) >= 0.01   // modo teste: mínimos 0.01€
                : parseInt(donateValue)   >= 5      // modo normal: mínimo 5€
        );*/

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

    const DonatePopup = (
        <div
            className="donatePopupOverlay"
            onClick={handleCloseDonate} // Fecha ao clicar no fundo escurecido
            tabIndex={-1}
            role="dialog"
        >
            <div
                className="donatePopup"
                onClick={e => e.stopPropagation()} // Não fecha ao clicar dentro do popup
            >
                <div className="donateTitle">
                    Donate to {username}
                </div>
                <div className="quickDonateButtons">
                    {[5, 10, 15, 20].map((val) => (
                        <button
                            key={val}
                            className="quickDonateBtn"
                            type="button"
                            onClick={() => handleQuickDonate(val.toString())}
                        >
                            {val}€
                        </button>
                    ))}
                </div>

                {/* --- botão discreto para modo teste (0.01€) --- */}

                {/*
                    <button
                        className="testModeBtn"
                        type="button"
                        onClick={() => {
                            setShowTestMode(true);
                            setDonateValue("0.01");   // pré-carrega o valor de 0.01€
                        }}
                    >
                        {showTestMode
                            ? "🧪 Test Mode Active"
                            : "🧪 Test Donation"
                        }
                    </button> */}


                <div className="donateInputSection">
                    <label className="donateInputLabel">
                        Specific ammount (min. 5€)
                    </label>
                    <input
                        className="donateInput"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        value={donateValue}
                        onChange={handleDonateInput}
                        placeholder="e.g. 10"
                    />
                </div>
                <div className="donateActions">
                    <button
                        className="donateCancelBtn"
                        type="button"
                        onClick={handleCloseDonate}
                    >
                        Cancel
                    </button>
                    <button
                        className="donateConfirmBtn"
                        type="button"
                        onClick={handleConfirmDonate}
                        disabled={!isConfirmEnabled}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {editMode && createPortal(
                <div
                    className="editOverlay"
                    onClick={() => setEditMode(false)}
                >
                    <form
                        className="editForm"
                        onClick={e => e.stopPropagation()}
                        onSubmit={handleSubmitEdit}
                    >
                        <h2>Edit Profile</h2>
                        {successEdit && <div className="success">{successEdit}</div>}
                        <label>
                            New Username:
                            <input
                                type="text"
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                required
                            />
                        </label>
                        <div
                            className={`fileDropArea${editDragOver ? ' drag-over' : ''}`}
                            onDragOver={e => { e.preventDefault(); setEditDragOver(true); }}
                            onDragLeave={e => { e.preventDefault(); setEditDragOver(false); }}
                            onDrop={e => {
                                e.preventDefault();
                                setEditDragOver(false);
                                const f = e.dataTransfer.files[0];
                                if (f) setNewPhoto(f);
                            }}
                            onClick={() => photoInputRef.current.click()}
                        >
                            <span className="fileName">
                                {newPhoto ? newPhoto.name : 'No file chosen'}
                            </span>
                            <button
                                type="button"
                                className="chooseFileButton"
                                onClick={() => photoInputRef.current.click()}
                            >
                                Choose File
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={photoInputRef}
                                style={{ display: 'none' }}
                                onChange={e => setNewPhoto(e.target.files[0] || null)}
                            />
                        </div>
                        {errorEdit && <div className="error">{errorEdit}</div>}
                        <div className="modalButtons">
                            <button type="submit" disabled={!canSave}>Save</button>
                            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {showDonatePopup && createPortal(DonatePopup, document.body)}
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
                        {isOwn
                            ? <FiEdit2 className="actionIcon editIcon" onClick={() => {/* teu edit */}} />
                            : (
                                <div className="moreDropdownWrapper" ref={moreRef}>
                                    <FiMoreHorizontal
                                        className="actionIcon moreIcon"
                                        onClick={() => setShowDropdown(d => !d)}
                                    />
                                    {showDropdown && (
                                        <div className="dropdownMenu">
                                            <div className="dropdownItem" onClick={handleFollowToggle}>
                                                {isFollowing ? 'Unfollow' : 'Follow'}
                                            </div>
                                            <div className="dropdownItem"
                                                 onClick={() => { setShowDropdown(false); setShowDonatePopup(true); }}>
                                                Donate
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }
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
                                onClick={() => toggleBadge(entry)}
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
                                        <span className="smallArtist">{badge.descricao}</span>
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
                            {notOwnedBadges.map((badge, idx) => (
                                <div key={idx} className="badgeRow">
                                    <span className="badgeNumber">{idx+1}</span>
                                    <div
                                        className="coverPlaceholderSmall"
                                        style={{ backgroundColor: TIER_COLORS[badge.badge_tier] }}
                                        onClick={() => console.log(badge.badge_name)}
                                    />
                                    <div className="badgeInfoSmall">
                                        <span className="smallTitle" onClick={() => console.log(badge.badge_name)}>{badge.badge_name}</span>
                                        <span className="smallArtist" onClick={() => console.log(badge.descricao)}>{badge.descricao}</span>
                                    </div>
                                    <span className="badgeProgress">{badge.current_state}/{badge.threshold}</span>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </>
    );
}