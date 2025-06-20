import React, { useState, useRef, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import '../../css/Pages/Subscription.css';

export default function SubscriptionPage() {

    const [planName, setPlanName] = useState('Premium');

    return (
        <div className="subscriptionSection">
            <div className="subscriptionBox">
                <span className="subscriptionText">Your Plan</span>
                <span className="planTitle">{planName}</span>
            </div>

            <div className="settingsBox">
                <div className="settingsHeader">
                        <span className="settingsTitle">
                            Subscription
                        </span>
                </div>

                <div className="settingsRow">
                        <span className="settingsText">
                            Manage your subscription
                        </span>
                    <FiChevronRight
                        className="arrowIcon"
                        strokeWidth={3}
                        onClick={() => console.log('Go to Store!')}
                    />
                </div>

                <div className="settingsRow">
                        <span className="settingsText">
                            Cancel your subscription
                        </span>
                    <FiChevronRight
                        className="arrowIcon"
                        strokeWidth={3}
                        onClick={() => console.log('Go to Store!')}
                    />
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
                        onClick={() => console.log('Go to Store!')}
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
    );
}