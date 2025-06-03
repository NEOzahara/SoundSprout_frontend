import React, {useEffect, useRef, useState} from 'react';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';
import '../../css/Pages/Settings.css';

export default function SettingsPage() {

    const languages = [
        'English',
        'Español',
        'Français',
        'Deutsch',
        '中文',
        '日本語',
        'Italiano',
        'Português',
        'Русский',
        'العربية',
        'हिन्दी'
    ];

    // Estado para controlar a linguagem selecionada e se o dropdown está aberto
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isOpenLang, setIsOpenLang] = useState(false);
    const dropdownRef = useRef(null);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpenLang(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpenLang(prev => !prev);
    const handleSelect = (lang) => {
        setSelectedLanguage(lang);
        setIsOpenLang(false);
    };

    /*Toogles*/
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAutoplayOn, setIsAutoplayOn] = useState(false);
    const [isPublishPlaylistProfileOn, setIsPublishPlaylistProfileOn] = useState(false);
    const [isShareListeningActivityOn, setIsShareListeningActivityOn] = useState(false);
    const [isShowRecentArtistsOn, setIsShowRecentArtistsOn] = useState(false);
    const [isFollowerAndFollowingOn, setIsFollowerAndFollowingOn] = useState(false);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const toggleAutoplay = () => setIsAutoplayOn(prev => !prev);
    const togglePublishPlaylistProfile = () => setIsPublishPlaylistProfileOn(prev => !prev);
    const toggleShareListeningActivity = () => setIsShareListeningActivityOn(prev => !prev);
    const toggleShowRecentArtists = () => setIsShowRecentArtistsOn(prev => !prev);
    const toggleFollowerAndFollowing = () => setIsFollowerAndFollowingOn(prev => !prev);

    return (
        <div className="settingsSection">
            {/* Caixa semelhante às do Home */}
            <div className="settingsBox">
                {/* 1) Título da caixa */}
                <div className="settingsHeader">
                    <span className="settingsTitle">Language</span>
                </div>

                {/* 2) Linha com texto à esquerda e botão dropdown à direita */}
                <div className="settingsRow" ref={dropdownRef}>
                    <span className="settingsText">
                        Choose language
                    </span>
                    <button
                        className={`dropdownButton${isOpenLang ? ' open' : ''}`}
                        onClick={toggleDropdown}
                    >
                        {selectedLanguage}
                        <FiChevronRight className="dropdownIcon" strokeWidth={3} />
                    </button>

                    {/* 3) Lista de opções, só aparece se isOpen for true */}
                    {isOpenLang && (
                        <div className="dropdownList">
                            {languages.map(lang => (
                                <div
                                    key={lang}
                                    className="dropdownItem"
                                    onClick={() => handleSelect(lang)}
                                >
                                    {lang}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ---------- Caixa de Day/Night Mode ---------- */}
            <div className="settingsBox">
                <div className="settingsHeader">
                    <span className="settingsTitle">Day/Night Mode</span>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Change background colors to night/day mode</span>
                    <div
                        className={`toggleSwitch${isDarkMode ? ' toggled' : ''}`}
                        onClick={toggleDarkMode}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>
            </div>

            <div className="settingsBox">
                <div className="settingsHeader">
                    <span className="settingsTitle">Autoplay</span>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Keep playing similar music after the song ends</span>
                    <div
                        className={`toggleSwitch${isAutoplayOn ? ' toggled' : ''}`}
                        onClick={toggleAutoplay}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>
            </div>

            <div className="settingsBox">
                <div className="settingsHeader">
                    <span className="settingsTitle">Social</span>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Publish my new playlists on my profile</span>
                    <div
                        className={`toggleSwitch${isPublishPlaylistProfileOn ? ' toggled' : ''}`}
                        onClick={togglePublishPlaylistProfile}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Share my listening activity on SoundSprout</span>
                    <div
                        className={`toggleSwitch${isShareListeningActivityOn ? ' toggled' : ''}`}
                        onClick={toggleShareListeningActivity}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Show my recently played artists on my public profile</span>
                    <div
                        className={`toggleSwitch${isShowRecentArtistsOn ? ' toggled' : ''}`}
                        onClick={toggleShowRecentArtists}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>

                <div className="settingsRow">
                    <span className="settingsText">Show my follower and following lists on my public profile</span>
                    <div
                        className={`toggleSwitch${isFollowerAndFollowingOn ? ' toggled' : ''}`}
                        onClick={toggleFollowerAndFollowing}
                    >
                        <div className="toggleThumb" />
                    </div>
                </div>
            </div>

            <div className="settingsBox">
                <div className="settingsHeader">
                        <span className="settingsTitle">
                            Security
                        </span>
                </div>

                <div className="settingsRow">
                        <span className="settingsText">
                            Change password
                        </span>
                    <FiChevronRight
                        className="arrowIcon"
                        strokeWidth={3}
                        onClick={() => console.log('Go to Store!')}
                    />
                </div>

                <div className="settingsRow">
                        <span className="settingsText">
                            Notifications settings
                        </span>
                    <FiChevronRight
                        className="arrowIcon"
                        strokeWidth={3}
                        onClick={() => console.log('Go to Store!')}
                    />
                </div>
            </div>
        </div>
    );
}
