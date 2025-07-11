import React, {useEffect, useLayoutEffect, useRef, useState, useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom';
import { FiEdit2, FiShare2, FiHeart, FiMessageCircle, FiList, FiMoreHorizontal } from 'react-icons/fi';
import '../../css/Pages/Profile.css';
import api from '../services/api';

export default function ProfilePage() {

    const { username: usernameParam } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const profileUsername = usernameParam || user?.username;
    const isOwnProfile = profileUsername === user?.username;

    // Dropdown visibilidade (para FiMoreHorizontal)
    const [showDropdown, setShowDropdown] = useState(false);

    // Estado do popup de doação
    const [showDonatePopup, setShowDonatePopup] = useState(false);
    const [donateValue, setDonateValue] = useState("");

    // Fecha dropdown ao clicar fora
    const moreRef = useRef(null);
    const handleClickOutside = useCallback((event) => {
        if (moreRef.current && !moreRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }, []);

    useEffect(() => {
        if (!showDropdown) return;
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown, handleClickOutside]);


    // Suporte futuro: podes ir buscar o utilizador autenticado da store/context aqui
    // const loggedUser = getUserFromContextOrStore() || { username: "LoggedInUser" }
    // const showUsername = username || loggedUser.username;

    const showUsername = profileUsername;
    const [stats, setStats] = useState({
        playlists:  0,
        songs:      0,
        followers:  0,
        following:  0
    });

    useEffect(() => {
             api.get(`/utilizadores/${profileUsername}/stats`)
               .then(({ data }) => setStats({
                 playlists: data.playlists,
                 songs:     data.songs,
                 followers: data.followers,
                 following: data.following
               }))
               .catch(err => console.error('Error fetching stats:', err));
        }, [profileUsername]);


    const profileUrl = window.location.href
    const { playlists, songs, followers, following } = stats;

    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl)
            .then(() => console.log('Link copied!'))
            .catch(() => console.error('Failed to copy link'));
    };

    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState(showUsername);
    const [newPhoto, setNewPhoto] = useState(null);
    const [errorEdit, setErrorEdit] = useState('');
    const [successEdit, setSuccessEdit] = useState('');
    const photoInputRef = useRef(null);
    const [editDragOver, setEditDragOver] = useState(false);
    const canSave = (newUsername.trim() !== showUsername) || !!newPhoto;


    const [badges, setBadges] = useState([]);
    useEffect(() => {
        const stored = localStorage.getItem('profileBadges');
        if (stored) setBadges(JSON.parse(stored));
    }, []);

    const badgeRefs = useRef([]);
    const [overflowFlags, setOverflowFlags] = useState([false, false, false]);

    useLayoutEffect(() => {
        const newFlags = badgeRefs.current.map(el => {
            if (!el) return false;
            return el.scrollWidth > el.parentElement.clientWidth;
        });
        setOverflowFlags(newFlags);
    }, []);

    // Donate logic
    const handleQuickDonate = (value) => setDonateValue(value);
    const handleDonateInput = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        setDonateValue(val);
    };
    const handleCloseDonate = () => {
        setShowDonatePopup(false);
        setDonateValue("");
    };
    const isConfirmEnabled = !!donateValue && parseInt(donateValue) >= 5;

    const handleSubmitEdit = async e => {
        e.preventDefault();
        setErrorEdit('');
        try {
            const form = new FormData();
            if (newUsername !== showUsername) form.append('username', newUsername);
            if (newPhoto) form.append('foto', newPhoto);

            const { data: { user: updatedUser, accessToken } } = await api.patch(`/utilizadores/${profileUsername}`, form);

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('userUpdated'));
            setUser(updatedUser);
            setSuccessEdit('Perfil atualizado com sucesso!');
            setErrorEdit('');

            // se mudou de username, leva-te logo para a nova rota
            if (updatedUser.username !== profileUsername) { // ← CHANGED (antes: user)
                navigate(`/profile/${updatedUser.username}`, { replace: true }); // ← CHANGED
            }
        } catch (err) {
            console.error(err);
            setErrorEdit(err.response?.data?.error || 'Error updating');
            setSuccessEdit('');
        }
    };

    // Playlists (a substituir por dados da BD mais tarde)
    const playlistsList = Array.from({ length: 7 }, (_, i) => `Playlist ${i+1}`);
    const renderPlaylists = () => playlistsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    // Playlists (a substituir por dados da BD mais tarde)
    const artistsList = Array.from({ length: 7 }, (_, i) => `Artist ${i+1}`);
    const renderArtists = () => artistsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    // Playlists (a substituir por dados da BD mais tarde)
    const likedPlaylistsList = Array.from({ length: 7 }, (_, i) => `Playlist ${i+1}`);
    const renderLikedPlaylists = () => likedPlaylistsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    const followersList = Array.from({ length: 7 }, (_, i) => `Follower ${i+1}`);
    const renderFollowers = () => followersList.map((name, i) => (
            <div key={i} className="coverCard followerCard">
                <div className="followerPlaceholder" onClick={() => console.log(name)}/>
                <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
            </div>
        ));

    const followingList = Array.from({ length: 7 }, (_, i) => `Following ${i+1}`);
    const renderFollowing = () => followingList.map((name, i) => (
        <div key={i} className="coverCard followerCard">
            <div className="followerPlaceholder" onClick={() => console.log(name)}/>
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    const achievementsList = Array.from({ length: 7 }, (_, i) => `Achievement ${i+1}`);
    const renderAchievements = () => achievementsList.map((name, i) => (
        <div key={i} className="coverCard">
            <div className="coverPlaceholder" onClick={() => console.log(name)} />
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    const topTracks = [
        { title: 'Song A', artist: 'Artist A', duration: '03:45', listens: '1.2M' },
        { title: 'Song B', artist: 'Artist B', duration: '04:12', listens: '980K' },
        { title: 'Song C', artist: 'Artist C', duration: '03:31', listens: '292K' },
        { title: 'Song D', artist: 'Artist D', duration: '04:44', listens: '1.4K' },
        { title: 'Song E', artist: 'Artist E', duration: '05:11', listens: '431K' },
        // … etc …
    ];
    const renderTopTracks = () =>
        topTracks.map((item, idx) => (
            <div key={idx} className="trackRow verticalRow">
                <span className="trackNumber">{idx + 1}</span>
                <div className="coverPlaceholderSmall" onClick={() => console.log(item.title)} />
                <div className="trackInfoSmall">
                    <span className="smallTitle" onClick={() => console.log(item.title)}>{item.title}</span>
                    <span className="smallArtist" onClick={() => console.log(item.artist)}>{item.artist}</span>
                </div>
                <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />
                <span className="smallDuration" onClick={() => console.log(item.duration)}>{item.duration}</span>
                <span className="smallListens" onClick={() => console.log(item.listens)}>{item.listens}</span>
                <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
            </div>
        ));

    const recentTracks = [
        { title: 'Song A', artist: 'Artist A', duration: '03:45', listens: '1.2M' },
        { title: 'Song B', artist: 'Artist B', duration: '04:12', listens: '980K' },
        { title: 'Song C', artist: 'Artist C', duration: '03:31', listens: '292K' },
        { title: 'Song D', artist: 'Artist D', duration: '04:44', listens: '1.4K' },
        { title: 'Song E', artist: 'Artist E', duration: '05:11', listens: '431K' },
        // … etc …
    ];
    const renderRecentTracks = () =>
        recentTracks.map((item, idx) => (
            <div key={idx} className="trackRow verticalRow">
                <span className="trackNumber">{idx + 1}</span>
                <div className="coverPlaceholderSmall" onClick={() => console.log(item.title)} />
                <div className="trackInfoSmall">
                    <span className="smallTitle" onClick={() => console.log(item.title)}>{item.title}</span>
                    <span className="smallArtist" onClick={() => console.log(item.artist)}>{item.artist}</span>
                </div>
                <FiHeart className="actionIcon" onClick={() => console.log('Like')} />
                <FiMessageCircle className="actionIcon" onClick={() => console.log('Comment')} />
                <span className="smallDuration" onClick={() => console.log(item.duration)}>{item.duration}</span>
                <span className="smallListens" onClick={() => console.log(item.listens)}>{item.listens}</span>
                <FiMoreHorizontal className="actionIcon" onClick={() => console.log('Options')} />
            </div>
        ));

    // ---- Popup Donate (logo antes do return principal) ----
    // (Isto fica antes do return)
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
                    Donate to {showUsername}
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
                        onClick={() => {
                            if (isConfirmEnabled) {
                                alert(`Doou ${donateValue}€ para ${showUsername}`);
                                handleCloseDonate();
                            }
                        }}
                        disabled={!isConfirmEnabled}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const EditModal = (
        <div className="editOverlay">
            <form className="editForm" onSubmit={handleSubmitEdit}>
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
                        onChange={e => {
                            const f = e.target.files[0];
                            setNewPhoto(f || null);
                        }}
                    />
                </div>

                {errorEdit && <div className="error">{errorEdit}</div>}
                <div className="modalButtons"> {/* podes estilizar via Profile.css */}
                    <button
                        type="submit"
                        disabled={!canSave}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditMode(false)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <>
            {showDonatePopup && createPortal(DonatePopup, document.body)}
            {editMode && createPortal(EditModal, document.body)}

            <div className="profileSection">
                <div className="profileHeader">
                    {/* wrapper principal com gap de 20px entre avatar e textos */}
                    <div className="profileMain">
                        {/* 1) Avatar circular 160×160 */}
                        <div
                            className="profileAvatar"
                            style={{
                                backgroundImage: user?.foto
                                    ? `url(${baseUrl}${user.foto.startsWith('/') ? '' : '/'}${user.foto})`
                                    : undefined
                            }}
                        />

                        {/* 2) Textos: “Profile” e “Username” */}
                        <div className="profileDetails">
                            <span className="profileLabel">Profile</span>
                            <span className="profileUsername">{showUsername}</span>
                        </div>
                    </div>

                    {/* 3) Ícones de ação */}
                    <div className="profileActions">
                        {isOwnProfile && (
                            <FiEdit2
                                className="actionIcon editIcon"
                                onClick={() => {
                                    setNewUsername(showUsername);
                                    setEditMode(true);
                                }}
                            />
                        )}
                        <FiShare2
                            className="actionIcon shareIcon"
                            onClick={copyLink}
                            style={isOwnProfile ? {} : { order: 1 }} // só muda posição se não for o próprio perfil
                        />
                        {!isOwnProfile && (
                            <div className="moreDropdownWrapper" ref={moreRef}>
                                <FiMoreHorizontal
                                    className="actionIcon moreIcon"
                                    onClick={() => setShowDropdown(v => !v)}
                                />
                                {showDropdown && (
                                    <div className="dropdownMenu">
                                        <div className="dropdownItem"
                                             onClick={() => { setShowDropdown(false); alert("Follow!"); }}>
                                            Follow
                                        </div>
                                        <div
                                            className="dropdownItem"
                                            onClick={() => {
                                                setShowDropdown(false);
                                                setShowDonatePopup(true);
                                            }}
                                        >
                                            Donate
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4) Estatísticas */}
                <div className="profileStats">
                    <span className="statsPrimary">
                        {playlists} Playlists – {songs} Songs
                    </span>
                    <span className="statsSecondary">
                    &nbsp;– {followers} Followers – {following} Following
                </span>
                </div>

                {/* 5) Link para o perfil */}
                <div className="profileLink" onClick={copyLink}>
                    link to profile ({profileUrl})
                </div>

                <div className="profileBadges">
                    {badges.map((b, i) => (
                        <div key={i} className={`profileBadge ${b.tier}`}>
                            <span
                                ref={el => badgeRefs.current[i] = el}
                                className={`badgeText${overflowFlags[i] ? " marquee-hover" : ""}`}
                            >
                            {b.title}
                            </span>
                        </div>
                    ))}
                </div>

                <hr className="profileDivider" />

                <div className="playlistsScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Public Playlists</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderPlaylists()}
                        </div>
                    </div>
                </div>

                <div className="playlistsScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Top Artists this month</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderArtists()}
                        </div>
                    </div>
                </div>

                <div className="verticalSection">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Top tracks this month</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="verticalWrapper">
                        {renderTopTracks()}
                    </div>
                </div>

                <div className="playlistsScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Recently Liked Playlists</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderLikedPlaylists()}
                        </div>
                    </div>
                </div>

                <div className="verticalSection">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Recently Liked Songs</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="verticalWrapper">
                        {renderRecentTracks()}
                    </div>
                </div>

                <div className="followersScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Followers</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderFollowers()}
                        </div>
                    </div>
                </div>

                <div className="followersScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Following</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderFollowing()}
                        </div>
                    </div>
                </div>

                <div className="playlistsScroll">
                    <div className="recommendHeader">
                        <span className="sectionTitle">Achievements</span>
                        <button className="seeAll">see all</button>
                    </div>
                    <div className="carouselWrapper">
                        <div className="carousel">
                            {renderAchievements()}
                        </div>
                    </div>
                </div>
            </div>
            </>
    );
}
