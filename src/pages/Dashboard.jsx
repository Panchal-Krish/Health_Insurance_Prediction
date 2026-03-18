import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader } from "lucide-react";
import { getToken, fetchWithAuth } from "../utils/auth";
import "./../styles/Dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Dashboard() {
    const navigate = useNavigate();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get auth values directly from storage (not from getCurrentUser)
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        const email = storage.getItem('userEmail');
        const role = storage.getItem('role');
        const token = getToken();

        // Check if logged in
        if (!token || !email) {
            navigate("/signin");
            return;
        }

        // Redirect admin/manager to their panels
        if (role === 'admin') {
            navigate("/admin");
            return;
        }
        if (role === 'manager') {
            navigate("/manager");
            return;
        }

        // Fetch premium history for regular users
        fetchPremiumHistory(email);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ FIX: Empty array - only run once on mount

    const fetchPremiumHistory = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchWithAuth(
                `${API_URL}/premium-history/${email}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch premium history');
            }

            const data = await response.json();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Unable to load your premium data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        const email = storage.getItem('userEmail');
        if (email) {
            fetchPremiumHistory(email);
        }
    };

    // ---------------- NORMALIZE ----------------
    const normalize = (type, value) => {
        if (type === "smoker" || type === "pre_existing") {
            return value ? 100 : 10;
        }

        const num = Number(value);
        if (isNaN(num)) return 0;

        switch (type) {
            case "age":
                return Math.min((num / 80) * 100, 100);
            case "bmi":
                return Math.min((num / 40) * 100, 100);
            case "income":
                return Math.min((num / 1500000) * 100, 100);
            case "children":
                return Math.min((num / 5) * 100, 100);
            default:
                return 0;
        }
    };

    const getColor = (percent) => {
        if (percent < 40) return "#22c55e";
        if (percent < 70) return "#facc15";
        return "#ef4444";
    };

    // ---------------- GAUGE COMPONENT ----------------
    const HalfGauge = ({ label, value, type }) => {
        const percent = normalize(type, value);
        // Fixed: Correct circumference for semicircle with radius 80
        const radius = 80;
        const circumference = Math.PI * radius; // π * r for semicircle
        const dashOffset = circumference - (percent / 100) * circumference;

        return (
            <div className="gauge-card">
                <div style={{ position: "relative" }}>
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                        {/* Background arc */}
                        <path
                            d="M20 100 A80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#1f2937"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />
                        {/* Foreground arc */}
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
                        {type === "income"
                            ? `₹${value.toLocaleString()}`
                            : type === "smoker" || type === "pre_existing"
                                ? value ? "Yes" : "No"
                                : value}
                    </div>
                </div>

                <div className="gauge-label">{label}</div>
            </div>
        );
    };

    // ---------------- INFO CARD COMPONENT ----------------
    const InfoCard = ({ label, value }) => {
        return (
            <div className="info-card">
                <div className="info-label">{label}</div>
                <div className="info-value">{value}</div>
            </div>
        );
    };

    const getPremiumRisk = (premium) => {
        if (premium < 15000) return { label: "Low", percent: 30, color: "#22c55e" };
        if (premium < 30000) return { label: "Medium", percent: 65, color: "#facc15" };
        return { label: "High", percent: 95, color: "#ef4444" };
    };

    const premiumRisk = history && getPremiumRisk(history.predicted_premium);

    // ---------------- LOADING STATE ----------------
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

    // ---------------- ERROR STATE ----------------
    if (error) {
        return (
            <section className="dashboard">
                <div className="error-container">
                    <AlertCircle className="error-icon-large" />
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={handleRetry}
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard">
            <h1 className="dashboard-title">Your Insurance Dashboard</h1>

            {/* -------- EMPTY STATE -------- */}
            {!history && (
                <div className="empty-state">
                    <p>No premium predictions yet.</p>
                    <p className="empty-subtitle">
                        Get started by predicting your insurance premium
                    </p>
                    <button
                        className="predict-btn"
                        onClick={() => navigate("/predict")}
                    >
                        Predict Your Premium
                    </button>
                </div>
            )}

            {/* -------- DASHBOARD CONTENT -------- */}
            {history && (
                <>
                    <div className="dashboard-header">
                        <h2>Last Prediction</h2>
                        <p className="timestamp">
                            Checked on: {new Date(history.last_checked_at).toLocaleString()}
                        </p>
                    </div>

                    {/* Main Gauges Grid */}
                    <div className="dashboard-grid">
                        <div className="top-left">
                            <HalfGauge
                                label="Age"
                                value={history.age}
                                type="age"
                            />
                        </div>

                        <div className="top-right">
                            <HalfGauge
                                label="BMI"
                                value={history.bmi}
                                type="bmi"
                            />
                        </div>

                        <div className="bottom-left">
                            <HalfGauge
                                label="Smoker"
                                value={history.smoker}
                                type="smoker"
                            />
                        </div>

                        <div className="bottom-right">
                            <HalfGauge
                                label="Annual Income"
                                value={history.annual_income}
                                type="income"
                            />
                        </div>

                        {/* Center Premium Display */}
                        <div className="center-premium">
                            <div className="premium-label-top">Predicted Premium</div>
                            <div className="premium-value">
                                ₹{history.predicted_premium.toLocaleString()}
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

                            <div
                                className="premium-label"
                                style={{ color: premiumRisk.color }}
                            >
                                Risk: {premiumRisk.label}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Cards */}
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
                            label="Pre-existing Diseases"
                            value={history.pre_existing_diseases ? "Yes" : "No"}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="bottom-action">
                        <button
                            className="predict-btn"
                            onClick={() => navigate("/predict")}
                        >
                            Predict New Premium
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

export default Dashboard;