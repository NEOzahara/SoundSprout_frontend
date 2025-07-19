import React, {useState, useRef, useEffect} from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom';
import {FiHome, FiGlobe, FiUsers, FiRss, FiFolder, FiPlus, FiMusic, FiHeart, FiSettings, FiCheckSquare, FiLogOut
} from 'react-icons/fi'
import api from "../services/api";
export default function Menu() {

    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [userMusics, setUserMusics] = useState([]);
    const [userLiked, setUserLiked] = useState([]);

    const [playlistsOpen, setPlaylistsOpen] = useState(false);
    const [musicOpen, setMusicOpen] = useState(false);
    const [likesOpen, setLikesOpen] = useState(false);

    // estado do modal de criar playlist
    // === criar playlist ===
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
    const [newPlName, setNewPlName] = useState('');
    const [newPlCover, setNewPlCover] = useState(null);
    const [newPlVisibility, setNewPlVisibility] = useState(null);
    const plCoverRef = useRef(null);
    const [plDragOver, setPlDragOver] = useState(false);

    // === criar música ===
    const [createSongOpen, setCreateSongOpen] = useState(false);
    const [newSongName, setNewSongName] = useState('');
    const [newAudioFile, setNewAudioFile] = useState(null);
    const [audioDragOver, setAudioDragOver] = useState(false);
    const audioRef = useRef(null);
    const [newSongCover, setNewSongCover] = useState(null);
    const [newLyricFile, setNewLyricFile] = useState(null);
    const [lyricDragOver, setLyricDragOver] = useState(false);
    const lyricRef = useRef(null);
    const songCoverRef = useRef(null);
    const [songCoverDrag, setSongCoverDrag] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const closeAll = () => {
        // fecha ambos modais e repõe estados
        setCreatePlaylistOpen(false);
        setNewPlName(''); setNewPlCover(null); setNewPlVisibility(null);
        setCreateSongOpen(false);
        setNewSongName(''); setNewAudioFile(null);
        setNewSongCover(null); setNewLyricFile(null);
        setError(null); setSuccess(false);
        setAudioDragOver(false); setSongCoverDrag(false); setLyricDragOver(false);
    };

    // simula criação (substituir pela API real)
    const handleConfirmPlaylist = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nome', newPlName);
        formData.append('privacidade', newPlVisibility);
        formData.append('dataCriacao', new Date().toISOString());
        formData.append('onlyPremium', false);
        if (newPlCover) {
            formData.append('foto', newPlCover);
        }
        try {
            // Cria a playlist (com ou sem capa)
            await api.post(
                '/playlists/with-cover',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            // Recarrega as playlists do submenu
            const { data: pls } = await api.get(
                `/playlists/utilizador/${encodeURIComponent(user.username)}`
            );
            setUserPlaylists(pls);
            closeAll();
        } catch (err) {
            console.error('Erro ao criar playlist:', err.response?.data || err);
        }
    };

    const handleConfirmSong = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(false);
        if (!newSongName || !newAudioFile) {
            setError('Título e ficheiro de áudio são obrigatórios.');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('audio', newAudioFile);
            formData.append('titulo', newSongName);
            if (newSongCover) formData.append('foto', newSongCover);
            if (newLyricFile) formData.append('lyric', newLyricFile);

            const { data } = await api.post('/musicas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Música publicada:', data);
            setSuccess(true);
            closeAll();
            // avisa LibraryMusicsPage e refaz submenu
            window.dispatchEvent(new Event('musicsUpdated'));
        } catch (err) {
            console.error('Erro ao publicar música:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Erro ao publicar música');
        }
    };

    const togglePlaylists = () => {
        setPlaylistsOpen(open => !open);
    };

    useEffect(() => {
        if (!user?.username) return;
        api.get(`/playlists/utilizador/${encodeURIComponent(user.username)}`)
            .then(({ data }) => setUserPlaylists(data))
            .catch(err => console.error('Erro a carregar playlists:', err));
        }, [user]);

    const toggleMusic = () => {
        setMusicOpen(open => !open);
    };

    useEffect(() => {
        if (!user?.username) return;
        api.get(`/musicas/utilizador/${encodeURIComponent(user.username)}`)
            .then(({ data }) => setUserMusics(data))
            .catch(err => console.error('Erro a carregar músicas:', err));
    }, [user]);

    const toggleLikes = () => {
        setLikesOpen(open => !open);
    };

    useEffect(() => {
        if (!user?.username) return;
        const fetchLikes = () => {
            api.get(`/musicas/utilizador/${encodeURIComponent(user.username)}/liked`)
                .then(({ data }) => setUserLiked(data))
                .catch(err => console.error('Erro a carregar likes:', err));
        };

        fetchLikes();
        window.addEventListener('likeChanged', fetchLikes);
        return () => {
            window.removeEventListener('likeChanged', fetchLikes);
        };
    }, [user]);

    return (
        <>
            <div className="scrollFrame">
                <p className="menuLine titleLine">
                    <span className="houseMinimal"></span>
                    <span className="lineText">Menu</span>
                </p>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/"
                        end
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiHome className="Icon" /></span>
                        <span className="lineText">Home</span>
                    </NavLink>
                </div>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/explore"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiGlobe className="Icon" /></span>
                        <span className="lineText">Explore</span>
                    </NavLink>
                </div>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/following"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiUsers className="Icon" /></span>
                        <span className="lineText">Following</span>
                    </NavLink>
                </div>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/liveStreams"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiRss className="Icon" /></span>
                        <span className="lineText">Live Stream</span>
                    </NavLink>
                </div>

                <p className="menuLine titleLine">
                    <span className="houseMinimal"></span>
                    <span className="lineText">Library</span>
                </p>

                <div className="menuLine contentLine hasSubmenu">
                    <NavLink
                        to="/playlists"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                    }
                        onClick={e => {
                            const el = e.target
                            /* não queremos navegar ao clicar na seta, só no resto */
                            if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                                e.preventDefault()
                                togglePlaylists()
                            }
                        }}
                        >
                        <span className="houseMinimal"><FiFolder className="Icon" /></span>
                        <span className="lineText">Playlists</span>
                    </NavLink>

                    <button
                        className={`arrowMinimal ${playlistsOpen ? 'rotated' : ''}`}
                        onClick={e => {
                            e.preventDefault()      // impede qualquer salto de rota
                            e.stopPropagation();   // impede o click de subir ao <p>
                            setPlaylistsOpen(o => !o)
                        }}
                    />
                </div>

                {/* Submenu de Playlists */}
                <div className={`subMenu ${playlistsOpen ? 'open' : ''}`}>
                    <div className="subItem" onClick={() => setCreatePlaylistOpen(true)}>
                        <span className="subIcon"><FiPlus className="Icon"/></span>
                        <span className="subText">New Playlist</span>
                    </div>

                    {userPlaylists.map(pl => (
                        <NavLink
                            key={pl.nome}
                            to={`/playlist/${encodeURIComponent(pl.username)}/${encodeURIComponent(pl.nome)}`}
                            className="subItem"
                        >
                            <span className="subIcon"><FiFolder className="Icon" /></span>
                            <span className="subText">{pl.nome}</span>
                    </NavLink>
                    ))}
                </div>

                <div className="menuLine contentLine hasSubmenu">
                    <NavLink
                        to="/musics"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                        onClick={e => {
                            const el = e.target
                            /* não queremos navegar ao clicar na seta, só no resto */
                            if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                                e.preventDefault()
                                toggleMusic()
                            }
                        }}
                    >
                        <span className="houseMinimal"><FiMusic className="Icon" /></span>
                        <span className="lineText">Music</span>
                    </NavLink>
                        <button
                            className={`arrowMinimal ${musicOpen ? 'rotated' : ''}`}
                            onClick={e => {
                                e.preventDefault()      // impede qualquer salto de rota
                                e.stopPropagation();   // impede o click de subir ao <p>
                                setMusicOpen(o => !o)
                            }}
                        />
                </div>

                {/* Submenu de Music */}
                <div className={`subMenu ${musicOpen ? 'open' : ''}`}>
                    <div className="subItem" onClick={() => setCreateSongOpen(true)}>
                        <span className="subIcon"><FiPlus className="Icon"/></span>
                        <span className="subText">New Song</span>
                    </div>

                    {userMusics.map(m => (
                        <NavLink
                            key={m.id}
                            to={`/player/${m.id}`}
                            className="subItem"
                        >
                            <span className="subIcon"><FiMusic className="Icon" /></span>
                            <span className="subText">{m.titulo}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="menuLine contentLine hasSubmenu">
                    <NavLink
                        to="/likes"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                    }
                        onClick={e => {
                            const el = e.target
                            /* não queremos navegar ao clicar na seta, só no resto */
                            if (el instanceof HTMLElement && el.classList.contains('arrowMinimal')) {
                                e.preventDefault()
                                toggleLikes()
                            }
                        }}
                    >
                        <span className="houseMinimal"><FiHeart className="Icon" /></span>
                        <span className="lineText">Likes</span>
                    </NavLink>

                        <button
                            className={`arrowMinimal ${likesOpen ? 'rotated' : ''}`}
                            onClick={e => {
                                e.preventDefault()      // impede qualquer salto de rota
                                e.stopPropagation();   // impede o click de subir ao <p>
                                setLikesOpen(o => !o)
                            }}
                        />
                </div>

                {/* Submenu de Likes */}
                <div className={`subMenu ${likesOpen ? 'open' : ''}`}>
                    {userLiked.map(m => (
                        <NavLink
                            key={m.id}
                            to={`/player/${m.id}`}
                            className="subItem"
                        >
                            <span className="subIcon"><FiHeart className="Icon" /></span>
                            <span className="subText">{m.titulo}</span>
                        </NavLink>
                    ))}
                    {/* ... mais itens ... */}
                </div>

                <p className="menuLine titleLine">
                    <span className="houseMinimal"></span>
                    <span className="lineText">General</span>
                </p>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/settings"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiSettings className="Icon" /></span>
                        <span className="lineText">Settings</span>
                    </NavLink>
                </div>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/subscription"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiCheckSquare className="Icon" /></span>
                        <span className="lineText">Subscription</span>
                    </NavLink>
                </div>

                <div className="menuLine contentLine">
                    <NavLink
                        to="/homeLoggedOff"
                        className={({isActive}) =>
                            `menuLineLink${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="houseMinimal"><FiLogOut className="Icon" /></span>
                        <span className="lineText">Logout</span>
                    </NavLink>
                </div>
            </div>
            {/* === Modal “New Playlist” === */}
            {createPlaylistOpen && (
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Playlist</h2>
                        <form onSubmit={handleConfirmPlaylist}>
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={newPlName}
                                    onChange={e => setNewPlName(e.target.value)}
                                    required
                                />
                            </label>

                            <label>Cover Image (opcional)</label>
                            <div
                                className={`fileDropArea${plDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setPlDragOver(true); }}
                                onDragLeave={() => setPlDragOver(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setPlDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewPlCover(f);
                                }}
                                onClick={() => plCoverRef.current.click()}
                            >
                                <span className="fileName">
                                  {newPlCover ? newPlCover.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => plCoverRef.current.click()}
                                >Choose File</button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={plCoverRef}
                                    style={{display:'none'}}
                                    onChange={e => setNewPlCover(e.target.files[0] || null)}
                                />
                            </div>

                            <label>
                                Visibility
                                <select
                                    value={newPlVisibility||''}
                                    onChange={e => setNewPlVisibility(e.target.value||null)}
                                    required
                                >
                                    <option value="" disabled>Choose…</option>
                                    <option value="public">Pública</option>
                                    <option value="private">Privada</option>
                                </select>
                            </label>

                            <div className="modalButtons">
                                <button type="button" onClick={closeAll}>Cancelar</button>
                                <button type="submit" disabled={!newPlName||!newPlVisibility}>
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === Modal “New Song” === */}
            {createSongOpen && createPortal(
                <div className="modalOverlay" onClick={closeAll}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>
                        <h2>Create New Song</h2>
                        <form onSubmit={handleConfirmSong} noValidate>
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={newSongName}
                                    onChange={e => setNewSongName(e.target.value)}
                                    required
                                />
                            </label>

                            <label>Audio File</label>
                            <div
                                className={`fileDropArea${audioDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setAudioDragOver(true); }}
                                onDragLeave={e => { e.preventDefault(); setAudioDragOver(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setAudioDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewAudioFile(f);
                                }}
                                onClick={() => audioRef.current.click()}
                            >
                                <span className="fileName">
                                    {newAudioFile ? newAudioFile.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => audioRef.current.click()}
                                >Choose File</button>
                                <input
                                    type="file"
                                    name="audio"
                                    accept="audio/*"
                                    ref={audioRef}
                                    style={{display:'none'}}
                                    onChange={e => setNewAudioFile(e.target.files[0]||null)}
                                    required
                                />
                            </div>

                            <label>Cover Image (opcional)</label>
                            <div
                                className={`fileDropArea${songCoverDrag ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setSongCoverDrag(true); }}
                                onDragLeave={e => { e.preventDefault(); setSongCoverDrag(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setSongCoverDrag(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewSongCover(f);
                                }}
                                onClick={() => songCoverRef.current.click()}
                            >
                                <span className="fileName">
                                  {newSongCover ? newSongCover.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => songCoverRef.current.click()}
                                >Choose File</button>
                                <input
                                    type="file"
                                    name="foto"
                                    accept="image/*"
                                    ref={songCoverRef}
                                    style={{display:'none'}}
                                    onChange={e => setNewSongCover(e.target.files[0]||null)}
                                />
                            </div>

                            <label>Lyric File (opcional)</label>
                            <div
                                className={`fileDropArea${lyricDragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setLyricDragOver(true); }}
                                onDragLeave={e => { e.preventDefault(); setLyricDragOver(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setLyricDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) setNewLyricFile(f);
                                }}
                                onClick={() => lyricRef.current.click()}
                            >
                                <span className="fileName">
                                    {newLyricFile ? newLyricFile.name : 'No file chosen'}
                                </span>
                                <button
                                    type="button"
                                    className="chooseFileButton"
                                    onClick={() => lyricRef.current.click()}
                                >Choose File</button>
                                <input
                                    type="file"
                                    name="lyric"
                                    accept=".txt"
                                    ref={lyricRef}
                                    style={{display:'none'}}
                                    onChange={e => setNewLyricFile(e.target.files[0]||null)}
                                />
                            </div>

                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">Música publicada com sucesso!</p>}

                            <div className="modalButtons">
                                <button type="button" onClick={closeAll}>Cancelar</button>
                                <button type="submit" disabled={!newSongName||!newAudioFile}>
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}