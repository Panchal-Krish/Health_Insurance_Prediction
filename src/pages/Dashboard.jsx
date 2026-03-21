import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import './../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── Helpers & sub-components outside the main component ──────────────────────

const normalize = (type, value) => {
    const num = Number(value);
    if (isNaN(num)) return 0;
    switch (type) {
        case 'age': return Math.min((num / 80) * 100, 100);
        case 'bmi': return Math.min((num / 40) * 100, 100);
        case 'children': return Math.min((num / 5) * 100, 100);
        case 'smoker': return value ? 100 : 10;
        default: return 0;
    }
};

const getColor = (percent) => {
    if (percent < 40) return '#22c55e';
    if (percent < 70) return '#facc15';
    return '#ef4444';
};

const HalfGauge = ({ label, value, type }) => {
    const percent = normalize(type, value);
    const circumference = Math.PI * 80;
    const dashOffset = circumference - (percent / 100) * circumference;

    return (
        <div className="gauge-card">
            <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 200 120" className="gauge-svg">
                    <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
                    <path
                        d="M20 100 A80 80 0 0 1 180 100"
                        fill="none"
                        stroke={getColor(percent)}
                        strokeWidth="16"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="gauge-value">
                    {type === 'smoker' ? (value ? 'Yes' : 'No') : value}
                </div>
            </div>
            <div className="gauge-label">{label}</div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="info-card">
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
    </div>
);

const getPremiumRisk = (premium) => {
    if (premium < 10000) return { label: 'Low', percent: 30, color: '#22c55e' };
    if (premium < 30000) return { label: 'Medium', percent: 65, color: '#facc15' };
    return { label: 'High', percent: 95, color: '#ef4444' };
};

// ─────────────────────────────────────────────────────────────────────────────

function Dashboard() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchPremiumHistory();
    }, [isLoggedIn]);

    const fetchPremiumHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchWithAuth(`${API_URL}/premium-history`);

            if (!response) return; // ✅ handle redirect case

            if (!response.ok) {
                throw new Error('Failed to fetch premium history');
            }

            setHistory(await response.json());
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Unable to load your premium data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="dashboard">
                <div className="loading-container">
                    <Loader className="spinner-large" />
                    <p>Loading your dashboard...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="dashboard">
                <div className="error-container">
                    <AlertCircle className="error-icon-large" />
                    <p>{error}</p>
                    <button className="retry-btn" onClick={fetchPremiumHistory}>Retry</button>
                </div>
            </section>
        );
    }

    const premiumRisk = history?.predicted_premium
        ? getPremiumRisk(history.predicted_premium)
        : { percent: 0, color: '#ccc', label: 'N/A' };

    return (
        <section className="dashboard">
            <h1 className="dashboard-title">Your Insurance Dashboard</h1>

            {/* Empty State */}
            {!history && (
                <div className="empty-state">
                    <p>No premium predictions yet.</p>
                    <p className="empty-subtitle">Get started by predicting your insurance premium</p>
                    <button className="predict-btn" onClick={() => navigate('/predict')}>
                        Predict Your Premium
                    </button>
                </div>
            )}

            {/* Dashboard Content */}
            {history && (
                <>
                    <div className="dashboard-header">
                        <h2>Last Prediction</h2>
                        <p className="timestamp">
                            Checked on: {new Date(history.last_checked_at).toLocaleString()}
                        </p>
                    </div>

                    {/* 4 gauges — age, bmi, children, smoker */}
                    <div className="dashboard-grid">
                        <div className="top-left">
                            <HalfGauge label="Age" value={history.age} type="age" />
                        </div>
                        <div className="top-right">
                            <HalfGauge label="BMI" value={history.bmi} type="bmi" />
                        </div>
                        <div className="bottom-left">
                            <HalfGauge label="Children" value={history.children} type="children" />
                        </div>
                        <div className="bottom-right">
                            <HalfGauge label="Smoker" value={history.smoker} type="smoker" />
                        </div>

                        {/* Center — predicted premium */}
                        <div className="center-premium">
                            <div className="premium-label-top">Predicted Premium</div>
                            <div className="premium-value">
                                ${history.predicted_premium.toLocaleString()}
                            </div>
                            <div className="premium-bar-container">
                                <div
                                    className="premium-bar-fill"
                                    style={{
                                        width: `${premiumRisk.percent}%`,
                                        backgroundColor: premiumRisk.color
                                    }}
                                />
                            </div>
                            <div className="premium-label" style={{ color: premiumRisk.color }}>
                                Risk: {premiumRisk.label}
                            </div>
                        </div>
                    </div>

                    {/* Info cards — gender, region, children count */}
                    <div className="info-cards-grid">
                        <InfoCard
                            label="Gender"
                            value={history.gender.charAt(0).toUpperCase() + history.gender.slice(1)}
                        />
                        <InfoCard
                            label="Region"
                            value={history.region.charAt(0).toUpperCase() + history.region.slice(1)}
                        />
                        <InfoCard
                            label="Children"
                            value={history.children}
                        />
                        <InfoCard
                            label="Smoker"
                            value={history.smoker ? 'Yes' : 'No'}
                        />
                    </div>

                    <div className="bottom-action">
                        <button className="predict-btn" onClick={() => navigate('/predict')}>
                            Predict New Premium
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

export default Dashboard;