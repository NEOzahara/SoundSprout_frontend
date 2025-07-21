
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import '../../css/Pages/Settings.css';
import api from '../services/api';

export default function SettingsPage() {
    // ─── Linguagens disponíveis ─────────────────────────────────────
    const languages = [
        'English',
        'Español',
        'Français',
        'Deutsch',
        'Italiano',
        'Português',
    ]

    // ─── Estados de UI ──────────────────────────────────────────────
    const [selectedLanguage, setSelectedLanguage] = useState('English')
    const [isOpenLang, setIsOpenLang]         = useState(false)
    const dropdownRef = useRef(null)

    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isAutoplayOn, setIsAutoplayOn] = useState(false)
    const [isPublishPlaylistProfileOn, setIsPublishPlaylistProfileOn] = useState(false)
    const [isShareListeningActivityOn, setIsShareListeningActivityOn] = useState(false)
    const [isShowRecentArtistsOn, setIsShowRecentArtistsOn] = useState(false)
    const [isFollowerAndFollowingOn, setIsFollowerAndFollowingOn] = useState(false)

    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const popupTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            // limpa timeout ao desmontar
            clearTimeout(popupTimeoutRef.current);
        };
    }, []);

    // ─── Carregar settings do backend ──────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/utilizadores/settings')
                // inverter o map de linguagem
                const revLang = {
                    en: 'English',
                    es: 'Español',
                    fr: 'Français',
                    de: 'Deutsch',
                    it: 'Italiano',
                    pt: 'Português'
                }
                setSelectedLanguage(revLang[data.linguagem] || 'English')
                setIsDarkMode(data.tema === 'night')
                setIsAutoplayOn(data.autoplay)
                setIsPublishPlaylistProfileOn(data.playlists_ativas)
                setIsShareListeningActivityOn(data.compartilhar_atividade)
                setIsShowRecentArtistsOn(data.mostrar_artistas_recentemente)
                setIsFollowerAndFollowingOn(data.mostrar_listas_publicas)
            } catch (err) {
                console.error('Erro ao carregar settings:', err)
            }
        }
        load()
    }, [])

    // ─── Função para enviar updates ao backend ─────────────────────
    const update = async (fields) => {
        try {
            await api.put('/utilizadores/settings', fields)
        } catch (err) {
            console.error('Erro ao atualizar settings:', err)
        }
    }

    // ─── Handlers de toggles e dropdown ────────────────────────────
    const handleSelectLanguage = (lang) => {
        setSelectedLanguage(lang)
        setIsOpenLang(false)
        update({ selectedLanguage: lang })
    }

    const toggleDarkMode = () => {
        setIsDarkMode(d => {
            const next = !d
            update({ isDarkMode: next })
            return next
        })
    }

    const toggleAutoplay = () => {
        setIsAutoplayOn(d => {
            const next = !d
            update({ isAutoplayOn: next })
            return next
        })
    }

    const togglePublish = () => {
        setIsPublishPlaylistProfileOn(d => {
            const next = !d
            update({ isPublishPlaylistsProfileOn: next })
            return next
        })
    }

    const toggleShareActivity = () => {
        setIsShareListeningActivityOn(d => {
            const next = !d
            update({ isShareListeningActivityOn: next })
            return next
        })
    }

    const toggleShowArtists = () => {
        setIsShowRecentArtistsOn(d => {
            const next = !d
            update({ isShowRecentArtistsOn: next })
            return next
        })
    }

    const toggleFollower = () => {
        setIsFollowerAndFollowingOn(d => {
            const next = !d
            update({ isFollowerAndFollowingOn: next })
            return next
        })
    }

    const hasNumber = /\d/.test(newPassword);
    const handleConfirmPassword = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await api.put('/utilizadores/password', {
                newPassword
            });
            setSuccessMsg('Password alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
            popupTimeoutRef.current = setTimeout(() => {
                setShowPasswordPopup(false);
                setSuccessMsg('');
                setErrorMsg('');
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao alterar password';
            setErrorMsg(msg);
        }
    };

    // ─── Fecha dropdown ao clicar fora ──────────────────────────────
    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpenLang(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    const PasswordChangePopup = (
        <div
            className="donatePopupOverlay"
            onClick={() => {
                clearTimeout(popupTimeoutRef.current);
                setShowPasswordPopup(false);
                setErrorMsg('');
                setSuccessMsg('');
        }}
            tabIndex={-1}
            role="dialog"
        >
            <div
                className="donatePopup"
                onClick={e => e.stopPropagation()}
            >
                <div className="donateTitle">Password Change</div>

                {errorMsg && <div className="errorMessage">{errorMsg}</div>}
                {successMsg && <div className="successMessage">{successMsg}</div>}

                <div className="donateInputSection">
                    <label className="donateInputLabel">Insert new password</label>
                    <input
                        type="password"
                        className="donateInput"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!!successMsg}
                    />

                    {newPassword && !hasNumber && (
                        <div className="errorMessage">
                            A password tem de conter pelo menos um número.
                        </div>
                    )}
                </div>

                <div className="donateInputSection">
                    <label className="donateInputLabel">Confirm new password</label>
                    <input
                        type="password"
                        className="donateInput"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!!successMsg}
                    />
                </div>

                <div className="donateActions">
                    <button
                        className="donateCancelBtn"
                        type="button"
                        onClick={() => {
                            clearTimeout(popupTimeoutRef.current);
                            setShowPasswordPopup(false);
                            setNewPassword('');
                            setConfirmPassword('');
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        disabled={!!successMsg}
                    >
                        Cancel
                    </button>
                    <button
                        className="donateConfirmBtn"
                        type="button"
                        onClick={handleConfirmPassword}
                        disabled={
                            !!successMsg ||
                            !newPassword ||
                            newPassword !== confirmPassword ||
                            !hasNumber
                        }
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showPasswordPopup && createPortal(PasswordChangePopup, document.body)}
            <div className="settingsSection">
                {/* Language */}
                <div className="settingsBox" ref={dropdownRef}>
                    <div className="settingsHeader">
                        <span className="settingsTitle">Language</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">Choose language</span>
                        <button
                            className={`dropdownButton${isOpenLang ? ' open' : ''}`}
                            onClick={() => setIsOpenLang(o => !o)}
                        >
                            {selectedLanguage}
                            <FiChevronRight className="dropdownIcon" strokeWidth={3} />
                        </button>
                    </div>
                    {isOpenLang && (
                        <div className="dropdownList">
                            {languages.map(lang => (
                                <div
                                    key={lang}
                                    className="dropdownItem"
                                    onClick={() => handleSelectLanguage(lang)}
                                >
                                    {lang}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Day/Night Mode */}
                <div className="settingsBox">
                    <div className="settingsHeader">
                        <span className="settingsTitle">Day/Night Mode</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">Change background colors</span>
                        <div
                            className={`toggleSwitch${isDarkMode ? ' toggled' : ''}`}
                            onClick={toggleDarkMode}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                </div>

                {/* Autoplay */}
                <div className="settingsBox">
                    <div className="settingsHeader">
                        <span className="settingsTitle">Autoplay</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">
                            Keep playing similar music after the song ends
                        </span>
                        <div
                            className={`toggleSwitch${isAutoplayOn ? ' toggled' : ''}`}
                            onClick={toggleAutoplay}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div className="settingsBox">
                    <div className="settingsHeader">
                        <span className="settingsTitle">Social</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">
                            Publish my playlists on my profile
                        </span>
                        <div
                            className={`toggleSwitch${isPublishPlaylistProfileOn ? ' toggled' : ''}`}
                            onClick={togglePublish}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">
                            Share my listening activity on SoundSprout
                        </span>
                        <div
                            className={`toggleSwitch${isShareListeningActivityOn ? ' toggled' : ''}`}
                            onClick={toggleShareActivity}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">
                            Show my recently played artists on my public profile
                        </span>
                        <div
                            className={`toggleSwitch${isShowRecentArtistsOn ? ' toggled' : ''}`}
                            onClick={toggleShowArtists}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">
                            Show my follower and following lists on my public profile
                        </span>
                        <div
                            className={`toggleSwitch${isFollowerAndFollowingOn ? ' toggled' : ''}`}
                            onClick={toggleFollower}
                        >
                            <div className="toggleThumb" />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="settingsBox">
                    <div className="settingsHeader">
                        <span className="settingsTitle">Security</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">Change password</span>
                        <FiChevronRight
                            className="arrowIcon"
                            strokeWidth={3}
                            onClick={() => setShowPasswordPopup(true)}
                        />
                    </div>
                    <div className="settingsRow">
                        <span className="settingsText">Notifications settings</span>
                        <FiChevronRight
                            className="arrowIcon"
                            strokeWidth={3}
                            onClick={() => console.log('Go to Notifications Settings')}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}


