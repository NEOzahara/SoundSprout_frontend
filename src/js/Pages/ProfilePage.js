import React, {useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo, useContext} from 'react';
import { useParams, useNavigate, NavLink  } from 'react-router-dom'
import { createPortal } from 'react-dom';
import { FiEdit2, FiShare2, FiHeart, FiMessageCircle, FiList, FiMoreHorizontal } from 'react-icons/fi';
import { PlayerContext } from '../../context/PlayerContext';
import '../../css/Pages/Profile.css';
import api from '../services/api';

export default function ProfilePage() {

    const { username: usernameParam } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [profileUser, setProfileUser] = useState(user);
    const [isFollowing, setIsFollowing] = useState(false);
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');

    const { setTrack } = useContext(PlayerContext);

    const profileUsername = usernameParam || user?.username;
    const isOwnProfile = profileUsername === user?.username;

    //const [showTestMode, setShowTestMode] = useState(false); //PARA TESTE

    useEffect(() => {
        if (!isOwnProfile) {
            api.get(`/utilizadores/${user.username}/following`)
               .then(({ data }) => {
                   const nomes = data.map(u => u.following_username);
                   setIsFollowing(nomes.includes(profileUsername));
               })
                .catch(console.error);
        }
    }, [profileUsername, user, isOwnProfile]);

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

    const TIER_COLORS = {
        bronze: '#AA6C39',
        silver: '#777777',
        gold: '#8B6914'
    };

    useEffect(() => {
        if (!showDropdown) return;
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown, handleClickOutside]);

    useEffect(() => {
        // busca dados do perfil (mesmo que seja o próprio)
        api.get(`/utilizadores/${profileUsername}`)
            .then(({ data }) => {
                setProfileUser(data);
                window.dispatchEvent(new Event('historyUpdated'));
            })
            .catch(err => {
                console.error('Erro a carregar perfil:', err);
                // fallback: se falhar, mantem o logged-in
                setProfileUser(user);
            });
    }, [profileUsername]);

    // Suporte futuro: podes ir buscar o utilizador autenticado da store/context aqui
    // const loggedUser = getUserFromContextOrStore() || { username: "LoggedInUser" }
    // const showUsername = username || loggedUser.username;

    const showUsername = profileUsername;
    const [stats, setStats] = useState({playlists: 0, songs: 0, followers: 0, following: 0 });

    const [topArtists, setTopArtists] = useState([]);
    const [showAllArtists, setShowAllArtists] = useState(false);

    const [topTracks, setTopTracks] = useState([]);
    const [showAllTracks, setShowAllTracks] = useState(false);

    const [likedPlaylists, setLikedPlaylists] = useState([]);
    const [showAllLikedPlaylists, setShowAllLikedPlaylists] = useState(false);

    const [recentLikedSongs, setRecentLikedSongs] = useState([]);
    const [showAllLikedSongs, setShowAllLikedSongs] = useState(false);

    const [followersList, setFollowersList] = useState([]);
    const [showAllFollowers, setShowAllFollowers] = useState(false);

    const [followingList, setFollowingList] = useState([]);
    const [showAllFollowing, setShowAllFollowing] = useState(false);

    const [achievements, setAchievements] = useState([]);
    const [showAllBadges, setShowAllBadges] = useState(false);

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

    const [publicPlaylists, setPublicPlaylists] = useState([]);
    useEffect(() => {
        let isMounted = true;
        api.get(`/playlists/utilizador/${profileUsername}`)
            .then(({ data }) => {
                if (!isMounted) return;
                let list = data;
                if (!isOwnProfile) {
                    list = list.filter(pl =>
                        pl.privacidade?.toLowerCase() === 'publico'
                    );
                }
                // filtrar só as públicas
                setPublicPlaylists(list);
            })
            .catch(err => console.error('Erro ao carregar playlists:', err));
        return () => { isMounted = false };
    }, [profileUsername, isOwnProfile]);

    // Carrega Top Artists
    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/top-artists-month`, {
            params: { limit: showAllArtists ? null : 6 }
        })
            .then(({ data }) => {
                if (!isMounted) return;
                setTopArtists(data);
            })
            .catch(err => console.error('Erro a carregar Top Artists:', err));
        return ()=>{ isMounted = false };
    }, [profileUsername, showAllArtists]);

    // ← NOVO useEffect para Top Tracks
    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/top-tracks-month`, {
            params: { limit: showAllTracks ? null : 6 }
        })
            .then(({ data }) => {
                if (!isMounted) return;
                setTopTracks(data);
            })
            .catch(err => console.error('Erro a carregar Top Tracks:', err));
        return () => { isMounted = false };
    }, [profileUsername, showAllTracks]);

    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/recent-playlists-month`, {
            params: { limit: showAllLikedPlaylists ? null : 6 }
        })
            .then(({ data }) => {
                if (!isMounted) return;
                setLikedPlaylists(data);
            })
            .catch(err => console.error('Erro a carregar Recently Liked Playlists:', err));
        return () => { isMounted = false };
    }, [profileUsername, showAllLikedPlaylists]);

    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/recent-songs-month`, {
            params: { limit: showAllLikedSongs ? null : 6 }
        })
            .then(({ data }) => { if (isMounted) setRecentLikedSongs(data); })
            .catch(err => console.error('Erro a carregar Recently Liked Songs:', err));
        return () => { isMounted = false; };
    }, [profileUsername, showAllLikedSongs]);

    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/followers`, {
            params: { limit: showAllFollowers ? null : 6 }
        }).then(({ data }) => {
            if (!isMounted) return;
            setFollowersList(data);
        }).catch(err => console.error('Erro a carregar Followers:', err));
        return () => { isMounted = false; };
    }, [profileUsername, showAllFollowers]);

    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/following`, {
            params: { limit: showAllFollowing ? null : 6 }
        })
            .then(({ data }) => { if (isMounted) setFollowingList(data); })
            .catch(err => console.error('Erro a carregar Following:', err));
        return () => { isMounted = false; };
    }, [profileUsername, showAllFollowing]);

    useEffect(() => {
        let isMounted = true;
        api.get(`/utilizadores/${profileUsername}/achievements`)
            .then(({ data }) => {
                console.log("achievements from API:", data);
                if (isMounted) setAchievements(data);
            })
            .catch(err => console.error('Erro a carregar achievements:', err));
        return () => { isMounted = false; };
    }, [profileUsername]);

    const handleClickTitle = track => e => {
        e.preventDefault();

        api.post('/musicas/visualizar', { musica_id: track.id })
            .catch(err => console.error('Erro ao registar visualização:', err));

        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
            setTrack({
                id: track.id,
                title: track.titulo,
                artist: track.username,
                coverUrl: track.foto ? `${baseUrl}/${track.foto}` : '',
                duration: audio.duration
            });
        });
        audio.src = `${process.env.REACT_APP_API_BASE_URL}/musicas/stream/${track.id}`;
        audio.load();
        };

    const [showAllPlaylists, setShowAllPlaylists] = useState(false);

    // ← ADDED: prepara apenas as 6 iniciais ou todas, conforme flag
    const displayedPlaylists = useMemo(() => {
        const slice = showAllPlaylists
            ? publicPlaylists
            : publicPlaylists.slice(0, 6);
        return slice.map(pl => (
            <div
                key={pl.nome}
                className="coverCard"
                onClick={() =>
                    navigate(
                        `/playlist/${encodeURIComponent(profileUsername)}/${encodeURIComponent(pl.nome)}`
                    )
                }
            >
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: pl.foto
                            ? `url(${baseUrl}${pl.foto.startsWith('/') ? '' : '/'}${pl.foto})`
                            : undefined
                    }}
                />
                <span className="coverTitle">{pl.nome}</span>
            </div>
        ));
    }, [publicPlaylists, showAllPlaylists, profileUsername, baseUrl, navigate]);

    const displayedArtists = useMemo(() => {
        return topArtists.map(art => (
            <NavLink
                key={art.username}
                to={`/profile/${encodeURIComponent(art.username)}`}
                className="coverCard artistCard"
            >
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: art.foto
                            ? `url(${baseUrl}${art.foto.startsWith('/')?'':'/'}${art.foto})`
                            : undefined
                    }}
                />
                <span className="coverTitle">{art.username}</span>
            </NavLink>
        ));
    }, [topArtists, baseUrl, navigate]);

    const displayedTopTracks = useMemo(() => {
        return topTracks.map((track, idx) => (
            <NavLink
                key={track.id}
                to={`/player/${encodeURIComponent(track.id)}`}
                className="trackRow verticalRow"
            >
                <span className="trackNumber">{idx + 1}</span>
                <div
                    className="coverPlaceholderSmall"
                    style={{
                        backgroundImage: track.foto
                            ? `url(${baseUrl}${track.foto.startsWith('/')?'':'/'}${track.foto})`
                            : undefined,
                        backgroundSize: 'cover',      // para ver a imagem toda
                        backgroundPosition: 'center'
                    }}
                />
                <div className="trackInfoSmall">
                    <a
                        href="#!"
                        className="smallTitle"
                        onClick={handleClickTitle(track)}
                    >
                        {track.titulo}
                    </a>
                    <span
                        className="smallArtist"
                        onClick={() => console.log(track.username)}
                    >
                        {track.username}
                    </span>
                </div>
                <span className="smallListensProfile">{track.plays}</span>
            </NavLink>
        ));
    }, [topTracks, baseUrl]);

    const displayedLikedPlaylists = useMemo(() => {
        return likedPlaylists.map(pl => (
            <div
                key={`${pl.creator_username}-${pl.playlist_name}`}
                className="coverCard"
                onClick={() => navigate(
                    `/playlist/${encodeURIComponent(pl.creator_username)}/${encodeURIComponent(pl.playlist_name)}`
                )}
            >
                <div
                    className="coverPlaceholder"
                    style={{
                        backgroundImage: pl.playlist_photo
                            ? `url(${baseUrl}${pl.playlist_photo.startsWith('/')?'':'/'}${pl.playlist_photo})`
                            : undefined
                    }}
                />
                <span className="coverTitle">{pl.playlist_name}</span>
            </div>
        ));
    }, [likedPlaylists, baseUrl, navigate]);

    const displayedRecentLikedSongs = useMemo(() => {
        return recentLikedSongs.map((track, idx) => (
            <NavLink
                key={track.id}
                to={`/player/${encodeURIComponent(track.id)}`}
                className="trackRow verticalRow"
            >
                <span className="trackNumber">{idx + 1}</span>
                <div
                    className="coverPlaceholderSmall"
                    style={{
                        backgroundImage: track.cover
                            ? `url(${baseUrl}${track.cover.startsWith('/')?'':'/'}${track.cover})`
                            : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="trackInfoSmall">
                    <a
                        href="#!"
                        className="smallTitle"
                        onClick={handleClickTitle(track)}
                    >
                        {track.titulo}
                    </a>
                    <span className="smallArtist">{track.artist_username}</span>
                </div>
            </NavLink>
        ));
    }, [recentLikedSongs, baseUrl]);

    const displayedFollowers = useMemo(() =>                     // ADDED
            followersList.map(f => (
                <NavLink
                    key={f.follower_username}
                    to={`/profile/${encodeURIComponent(f.follower_username)}`}
                    className="coverCard followerCard"
                >
                    <div
                        className="followerPlaceholder"
                        style={{
                            backgroundImage: f.follower_photo
                                ? `url(${baseUrl}${f.follower_photo.startsWith('/')?'':'/'}${f.follower_photo})`
                                : undefined
                        }}
                    />
                    <span className="coverTitle">{f.follower_username}</span>
                </NavLink>
            ))
        , [followersList, baseUrl]);

    const displayedFollowing = useMemo(() => {
        const slice = showAllFollowing ? followingList : followingList.slice(0,6);
        return slice.map(u => (
            <NavLink
                key={u.following_username}
                to={`/profile/${encodeURIComponent(u.following_username)}`}
                className="coverCard followerCard"
            >
                <div
                    className="followerPlaceholder"
                    style={{
                        backgroundImage: u.following_photo
                            ? `url(${baseUrl}${u.following_photo.startsWith('/')?'':'/'}${u.following_photo})`
                            : undefined
                    }}
                />
                <span className="coverTitle">{u.following_username}</span>
            </NavLink>
        ));
    }, [followingList, showAllFollowing, baseUrl, navigate]);

    const displayedAchievements = useMemo(() => {
        const slice = showAllBadges ? achievements : achievements.slice(0, 6);
        return slice.map(b => (
            <div
                key={`${b.badge_name}-${b.badge_tier}`}
                className="coverCard"
                onClick={() =>
                    navigate(`/achievements/${encodeURIComponent(profileUsername)}`)  // ← ALTERAÇÃO
                }
                style={{ cursor: 'pointer' }}  // opcional, dá feedback visual
                >
                <div className={`coverPlaceholder achievementBadge ${b.badge_tier}`} />
                <span className="coverTitle">{b.badge_name}</span>
            </div>
        ));
    }, [achievements, showAllBadges]);

    const { playlists, songs, followers, following } = stats;
    const profileUrl = window.location.href;
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

    const [selectedBadgesDisplay, setSelectedBadgesDisplay] = useState([]);
    useEffect(() => {
        api.get(`/utilizadores/${profileUsername}/selected-achievements`)
            .then(({ data }) => setSelectedBadgesDisplay(data))
            .catch(console.error);
    }, [profileUsername]);

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

    const handleConfirmDonate = async () => {
        try {
            const { data } = await api.post('/payments/checkout-session', {
                amount: parseFloat(donateValue),
                connectedAccountId: profileUser.stripe_account_id,
                destinatarioUsername: profileUsername
            });
            // redireciona para o Stripe Checkout
            window.location.href = data.url;
        } catch (err) {
            console.error('Erro ao iniciar Checkout:', err);
        }
    };

    const isConfirmEnabled = !!donateValue && parseInt(donateValue) >= 5;
    /*const isConfirmEnabled = !!donateValue &&
        (showTestMode
                ? parseFloat(donateValue) >= 1   // modo teste: mínimos 0.01€
                : parseInt(donateValue)   >= 5      // modo normal: mínimo 5€
        );*/

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
    const renderPlaylists = useMemo(() => publicPlaylists.map(pl => (
        <div
            key={pl.nome}
            className="coverCard"
            onClick={() => navigate(
                `/playlist/${encodeURIComponent(profileUsername)}/${encodeURIComponent(pl.nome)}`)}
        >
            <div
                className="coverPlaceholder"
                style={{
                    backgroundImage: pl.foto
                        ? `url(${baseUrl}${pl.foto.startsWith('/') ? '' : '/'}${pl.foto})`
                        : undefined
                }}
            />
            <span className="coverTitle">{pl.nome}</span>
        </div>
    )), [publicPlaylists, profileUsername, baseUrl, navigate]);


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

    //const followersList = Array.from({ length: 7 }, (_, i) => `Follower ${i+1}`);
    const renderFollowers = () => followersList.map((name, i) => (
        <div key={i} className="coverCard followerCard">
            <div className="followerPlaceholder" onClick={() => console.log(name)}/>
            <span className="coverTitle" onClick={() => console.log(name)}>{name}</span>
        </div>
    ));

    //const followingList = Array.from({ length: 7 }, (_, i) => `Following ${i+1}`);
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


                {/*<button
                        className="testModeBtn"
                        type="button"
                        onClick={() => {
                            setShowTestMode(true);
                            setDonateValue("1");   // pré-carrega o valor de 0.01€
                        }}
                    >
                        {showTestMode
                            ? "🧪 Test Mode Active"
                            : "🧪 Test Donation"
                        }
                    </button>*/}


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

    const EditModal = (
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

    const handleFollowToggle = async () => {
        setShowDropdown(false);
        const currentlyFollowing = isFollowing;
        try {
            if (currentlyFollowing) {
                // unfollow
                await api.delete(`/utilizadores/seguir/${encodeURIComponent(profileUsername)}`);
                setIsFollowing(false);
                setStats(s => ({ ...s, followers: s.followers - 1 }));
                setFollowersList(list =>
                    list.filter(f => f.follower_username !== user.username)
                );
            } else {
                // follow
                await api.post('/utilizadores/seguir', { seguido_username: profileUsername });
                setIsFollowing(true);
                setStats(s => ({ ...s, followers: s.followers + 1 }));
                setFollowersList(list => [
                    { follower_username: user.username, follower_photo: user.foto },
                    ...list
                ]);
            }
        } catch (err) {
            console.error('Erro ao (un)follow:', err.response?.data || err);
            // revert se falhar
            setIsFollowing(f => !f);
            setStats(s => ({
                ...s,
                followers: s.followers + (isFollowing ? +1 : -1)
            }));
        }
    };

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
                                backgroundImage: profileUser?.foto
                                    ? `url(${baseUrl}${profileUser.foto.startsWith('/') ? '' : '/'}${profileUser.foto})`
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
                                        <div
                                            className="dropdownItem"
                                            onClick={handleFollowToggle}
                                        >
                                            {isFollowing ? 'Unfollow' : 'Follow'}
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
                    {selectedBadgesDisplay.map((b, i) => (
                        <div
                            key={i}
                            className={`profileBadge ${b.badge_tier}`}
                            style={{ backgroundColor: TIER_COLORS[b.badge_tier] }}
                        >
                            <span
                                ref={el => badgeRefs.current[i] = el}
                                className={`badgeText${overflowFlags[i] ? " marquee-hover" : ""}`}
                            >
                            {b.badge_name}
                            </span>
                        </div>
                    ))}
                </div>

                <hr className="profileDivider" />

                {publicPlaylists.length > 0 && (
                    <div className="playlistsScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Public Playlists</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllPlaylists(x => !x)}
                            >
                                {showAllPlaylists ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedPlaylists}
                            </div>
                        </div>
                    </div>
                )}

                {topArtists.length > 0 && (
                    <div className="playlistsScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Top Artists this month</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllArtists(f => !f)}
                            >
                                {showAllArtists ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedArtists}
                            </div>
                        </div>
                    </div>
                )}

                {topTracks.length > 0 && (
                    <div className="verticalSection">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Top tracks this month</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllTracks(f => !f)}     // ← ALTERAÇÃO
                            >
                                {showAllTracks ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="verticalWrapper">
                            {displayedTopTracks}
                        </div>
                    </div>
                )}

                {likedPlaylists.length > 0 && (
                    <div className="playlistsScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Recently Liked Playlists</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllLikedPlaylists(x => !x)}
                            >
                                {showAllLikedPlaylists ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedLikedPlaylists}
                            </div>
                        </div>
                    </div>
                )}

                {recentLikedSongs.length > 0 && (
                    <div className="verticalSection">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Recently Liked Songs</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllLikedSongs(x => !x)}
                            >
                                {showAllLikedSongs ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="verticalWrapper">
                            {displayedRecentLikedSongs}
                        </div>
                    </div>
                )}

                {followersList.length > 0 && (
                    <div className="followersScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Followers</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllFollowers(x => !x)}
                            >
                                {showAllFollowers ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedFollowers}
                            </div>
                        </div>
                    </div>
                )}

                {followingList.length > 0 && (
                    <div className="followersScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Following</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllFollowing(f => !f)}
                            >
                                {showAllFollowing ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedFollowing}
                            </div>
                        </div>
                    </div>
                )}

                {achievements.length > 0 && (
                    <div className="playlistsScroll">
                        <div className="recommendHeader">
                            <span className="sectionTitle">Achievements</span>
                            <button
                                className="seeAll"
                                onClick={() => setShowAllBadges(f => !f)}
                            >
                                {showAllBadges ? 'show less' : 'see all'}
                            </button>
                        </div>
                        <div className="carouselWrapper">
                            <div className="carousel">
                                {displayedAchievements}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
