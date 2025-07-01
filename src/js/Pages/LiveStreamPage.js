// src/pages/LiveStreamPage.js
import React, {useState} from 'react';
import { useParams } from 'react-router-dom';
import { streams } from '../../data/liveStreams';
import '../../css/Pages/LiveStream.css';
import {FiHeart, FiMessageCircle, FiMoreHorizontal, FiPlay, FiPause, FiUser, FiVolume2} from "react-icons/fi";

// Função utilitária para formatar “há quanto tempo”
function formatTimeAgo(ts) {
    const diffMs = Date.now() - ts;
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s atrás`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m atrás`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h atrás`;
    const day = Math.floor(hr / 24);
    return `${day}d atrás`;
}

function CommentItem({ avatarUrl, user, text, timestamp }) {
    return (
        <div className="commentItem">
            <div
                className="commentAvatar"
                style={{ backgroundImage: `url(${avatarUrl})` }}
            />
            <div className="commentContent">
                <span className="commentUser">{user}:&nbsp;</span>
                <span className="commentText">{text}</span>
            </div>
            <div className="commentMeta">
                <FiHeart className="commentHeart" />
                <span className="commentTime">{formatTimeAgo(timestamp)}</span>
            </div>
        </div>
    );
}

export default function LiveStreamPage() {

    const { id } = useParams();
    const stream = streams.find(s => String(s.id) === id) || {};
    const [isPlaying, setIsPlaying] = useState(false);

    // só para demo de 5 géneros fixos
    const demoGenres = ['Genre','Genre','Genre','Genre','Genre'];

    // exemplo de comentários; no futuro virão do servidor
    const demoComments = [
        {
            avatarUrl: '/avatars/alice.jpg',
            user: 'Alice',
            text: 'Que ótimo concerto!',
            timestamp: Date.now() - 1000 * 60 * 5 // 5 minutos atrás
        },
        {
            avatarUrl: '/avatars/bob.jpg',
            user: 'Bob',
            text: 'Estou adorando a vibe.',
            timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 horas atrás
        },
        // … mais items …
    ];

    return (
        <div className="liveStreamPageSection">
            <div className="liveTopRectangle" />

            {stream ? (
                <>
                <div className="liveDetail">
                    <h1 className="liveStreamTitle">
                        {stream.owner}’s Live <span className="liveStreamType">({stream.type})</span>
                    </h1>
                    {/* 2) Meta: avatar + nome + seguidores + botão Follow */}
                    <div className="liveDetailMeta">
                        <div className="liveUserInfo">
                            <FiUser className="liveUserIcon" />
                            <div className="liveUserText">
                                <span className="liveUserName">{stream.owner}</span>
                                <span className="liveFollowers">{stream.followers} followers</span>
                            </div>
                        </div>
                        <button className="liveFollowButton">Follow</button>
                    </div>

                    {/* 4) Barra de ações */}
                    <div className="liveActions">
                        {/* wrapper do play com glow */}
                        <div className="livePlayWrapper">
                            <div className="livePlayGlow" />
                            <button
                                className="livePlayButton"
                                onClick={() => setIsPlaying(p => !p)}
                            >
                                {isPlaying
                                    ? <FiPause className="livePlayIcon pauseIcon" />
                                    : <FiPlay  className="livePlayIcon playIcon" />
                                }
                            </button>
                        </div>
                        <button className="liveActionButton"><FiHeart /></button>
                        <button className="liveActionButton"><FiMessageCircle /></button>
                        <button className="liveActionButton"><FiVolume2 /></button>
                        <button className="liveActionButton"><FiMoreHorizontal /></button>

                        <div className="liveTags">
                            {demoGenres.map((g, i) => (
                                <span key={i} className="liveTag">{g}</span>
                            ))}
                        </div>
                    </div>

                    {/* 5) Tags de género */}
                    <div className="liveTags">
                        {(stream.genres || []).map(genre => (
                            <span key={genre} className="liveTag">{genre}</span>
                        ))}
                    </div>

                    {/* 6) Footer com duração e nº de participantes */}
                    <div className="liveInfo">
                        {stream.currentDuration || '0:00'} – {stream.participants || 0} participants
                    </div>
                </div>

                    {/* === Seção de Comentários === */}
                    <div className="commentsSection">
                        <input
                            type="text"
                            className="commentInput"
                            placeholder="Escreva um comentário"
                        />
                        <div className="commentsList">
                            {demoComments.map((c, i) => (
                                <CommentItem
                                    key={i}
                                    avatarUrl={c.avatarUrl}
                                    user={c.user}
                                    text={c.text}
                                    timestamp={c.timestamp}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <p className="liveNotFound">Live stream não encontrada.</p>
            )}
        </div>
    );
}