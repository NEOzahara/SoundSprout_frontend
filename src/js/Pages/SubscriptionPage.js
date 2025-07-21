import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import '../../css/Pages/Subscription.css';
import api from '../services/api';

export default function SubscriptionPage() {

    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const [isPremium, setIsPremium] = useState(!!stored?.premium);
    const [planName, setPlanName] = useState(isPremium ? 'Premium' : 'Free');

    const [showHistory, setShowHistory] = useState(false);
    const [donationsGiven, setDonationsGiven] = useState([]);
    const [donationsReceived, setDonationsReceived] = useState([]);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const { data: givenData } = await api.get(`/doacoes/given`);
                const { data: receivedData } = await api.get(`/doacoes/received`);
                setDonationsGiven(givenData);
                setDonationsReceived(receivedData);
            } catch (err) {
                console.error("Erro ao carregar doações:", err);
            }
        };
        fetchDonations();
    }, []);

    const togglePlan = async newPremium => {
        try {
            const { data } = await api.put('/utilizadores/premium', { premium: newPremium });
            // atualiza estado e localStorage
            setIsPremium(data.user.premium);
            setPlanName(data.user.premium ? 'Premium' : 'Free');
            localStorage.setItem('user', JSON.stringify({
                ...stored,
                premium: data.user.premium
            }));
        } catch (err) {
            console.error('Falha a atualizar plano:', err);
        }
    };

    // 1) monta o popup como constante
    const HistoryPopup = (
        <div
            className="subscriptionPopupOverlay"
            onClick={() => setShowHistory(false)}
            tabIndex={-1}
            role="dialog"
        >
            <div
                className="subscriptionPopup"
                onClick={e => e.stopPropagation()}
            >
                <div className="subscriptionPopupSection">
                    <h3>Donations Given</h3>
                    <ul>
                        {donationsGiven.map((d, i) => (
                            <li key={i}>
                                <div className="donationDate">{d.data.split('T')[0]}</div>
                                <div className="donationContent">
                                    <span className="donationText">Sent </span>
                                    <span className="donationHighlight">{d.valor}€</span>
                                    <span className="donationText"> to </span>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(d.destinatario_username)}`}
                                        className="donationUserLink"
                                    >
                                        {d.destinatario_username}
                                    </NavLink>
                                    <span className="donationText">.</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="subscriptionPopupSection">
                    <h3>Donations Received</h3>
                    <ul>
                        {donationsReceived.map((d, i) => (
                            <li key={i}>
                                <div className="donationDate">{d.data.split('T')[0]}</div>
                                <div className="donationContent">
                                    <span className="donationText">Received </span>
                                    <span className="donationHighlight">{d.valor}€</span>
                                    <span className="donationText"> from </span>
                                    <NavLink
                                        to={`/profile/${encodeURIComponent(d.doador_username)}`}
                                        className="donationUserLink"
                                    >
                                        {d.doador_username}
                                    </NavLink>
                                    <span className="donationText">.</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showHistory && createPortal(HistoryPopup, document.body)}
            <div className="subscriptionSection">
                <div className="subscriptionBox">
                    <span className="subscriptionText">Your Plan</span>
                    <span className="planTitle">{planName}</span>
                </div>

                <div className="settingsBox">
                    <div className="settingsHeader">
                        <span className="settingsTitle">Subscription</span>
                    </div>

                    <div
                        className="settingsRow"
                        onClick={() => !isPremium && togglePlan(true)}
                    >
                        <span className="settingsText">Manage your subscription</span>
                        {!isPremium && (
                            <FiChevronRight className="arrowIcon" strokeWidth={3}/>
                        )}
                    </div>

                    <div className="settingsRow"
                         onClick={() => isPremium && togglePlan(false)}
                    >
                        <span className="settingsText">Cancel your subscription</span>
                        {isPremium && (
                            <FiChevronRight className="arrowIcon" strokeWidth={3}/>
                        )}
                    </div>
                </div>

                <div className="settingsBox">
                    <div className="settingsHeader">
                            <span className="settingsTitle">
                                Payment
                            </span>
                    </div>

                    <div className="settingsRow">
                            <span className="settingsText">
                                Payment history
                            </span>
                        <FiChevronRight
                            className="arrowIcon"
                            strokeWidth={3}
                            onClick={() => setShowHistory(true)}
                        />
                    </div>

                    <div className="settingsRow">
                            <span className="settingsText">
                                Payment methods
                            </span>
                        <FiChevronRight
                            className="arrowIcon"
                            strokeWidth={3}
                            onClick={() => console.log('Go to Store!')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}