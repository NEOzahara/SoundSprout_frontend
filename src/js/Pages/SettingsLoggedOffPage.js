import React, {useEffect, useRef, useState} from 'react';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';
import '../../css/Pages/Settings.css';

export default function SettingsLoggedOffPage() {

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

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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
        </div>
    );
}
