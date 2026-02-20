import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [history, setHistory] = useState(null);
    const email = localStorage.getItem("userEmail");

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/signin");
            return;
        }

        fetch(`http://localhost:5000/premium-history/${email}`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(() => setHistory(null));
    }, [email, navigate]);

    // ---------- NORMALIZE SAFELY ----------
    const normalize = (type, value) => {
        if (type === "smoker") {
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
            default:
                return 0;
        }
    };

    const getColor = (percent) => {
        if (percent < 40) return "#22c55e";
        if (percent < 70) return "#facc15";
        return "#ef4444";
    };

    // ---------- GAUGE COMPONENT ----------
    const HalfGauge = ({ label, value, type }) => {
        const percent = normalize(type, value);
        const circumference = 440;
        const dashOffset = circumference - (percent / 100) * circumference;

        return (
            <div className="gauge-card">
                <div style={{ position: "relative" }}>
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                        <path
                            d="M20 100 A80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#1f2937"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />
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
                            ? `₹${value}`
                            : type === "smoker"
                                ? value ? "Yes" : "No"
                                : value}
                    </div>
                </div>

                <div className="gauge-label">{label}</div>
            </div>
        );
    };

    const getPremiumRisk = (premium) => {
        if (premium < 15000) return { label: "Low", percent: 30 };
        if (premium < 30000) return { label: "Medium", percent: 65 };
        return { label: "High", percent: 95 };
    };

    if (!history) {
        return (
            <section className="dashboard">
                <p style={{ color: "#9ca3af" }}>
                    No premium predictions yet.
                </p>
            </section>
        );
    }

    const premiumRisk = getPremiumRisk(history.predicted_premium);

return (
    <section className="dashboard">

        <div className="dashboard-grid">

            <div className="top-left">
                <HalfGauge label="Age" value={history.age} type="age" />
            </div>

            <div className="top-right">
                <HalfGauge label="BMI" value={history.bmi} type="bmi" />
            </div>

            <div className="bottom-left">
                <HalfGauge label="Smoker" value={history.smoker} type="smoker" />
            </div>

            <div className="bottom-right">
                <HalfGauge label="Income" value={history.annual_income} type="income" />
            </div>

            <div className="center-premium">
                <div className="premium-value">
                    ₹{history.predicted_premium}
                </div>

                <div className="premium-bar-container">
                    <div
                        className="premium-bar-fill"
                        style={{ width: `${premiumRisk.percent}%` }}
                    />
                </div>

                <div className="premium-label">
                    Premium: {premiumRisk.label}
                </div>
            </div>

        </div>

        <div className="timestamp">
            Last Checked: {new Date(history.last_checked_at).toLocaleString()}
        </div>

        {/* 👇 Button Now At Bottom */}
        <div className="bottom-action">
            <button
                className="predict-btn"
                onClick={() => navigate("/predict")}
            >
                Predict New Premium
            </button>
        </div>

    </section>
);


}

export default Dashboard;
