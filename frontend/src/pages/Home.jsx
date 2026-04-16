import React, { useState, useEffect } from 'react';
import {
    Sparkles, ArrowRight, Shield, TrendingUp, Zap,
    BarChart3, Clock, ChevronRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const handleGetPrediction = () => {
        navigate(isLoggedIn ? '/predict' : '/signup');
    };

    const API_URL = process.env.REACT_APP_API_URL || '';
    const [stats, setStats] = useState({
        prediction_count_display: '0',
        model_accuracy: 0
    });

    useEffect(() => {
        fetch(`${API_URL}/public-stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => {});
    }, [API_URL]);

    return (
        <div className="home-page">

            {/* ===== HERO ===== */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>AI-Powered Insurance Predictions</span>
                    </div>

                    <h1 className="hero-heading">
                        Know Your Premium
                        <br />
                        <span className="hero-highlight">Before You Commit</span>
                    </h1>

                    <p className="hero-desc">
                        Get instant, ML-driven health insurance premium estimates tailored to
                        your profile. No guesswork, no waiting — just results.
                    </p>

                    <div className="hero-actions">
                        <button className="btn-primary" onClick={handleGetPrediction}>
                            <Sparkles size={18} />
                            {isLoggedIn ? 'Calculate Premium' : 'Get Started Free'}
                            <ArrowRight size={18} />
                        </button>
                        <button className="btn-outline" onClick={() => navigate(isLoggedIn ? '/helpdesk' : '/contact')}>
                            {isLoggedIn ? 'Help Desk' : 'Contact Us'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Floating ambient orbs */}
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
            </section>

            {/* ===== STATS BAR ===== */}
            <section className="stats-bar">
                <div className="stats-bar-inner">
                    <div className="stat-item">
                        <BarChart3 size={20} className="stat-icon" />
                        <div>
                            <span className="stat-number">{stats.prediction_count_display}</span>
                            <span className="stat-text">Predictions Made</span>
                        </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <TrendingUp size={20} className="stat-icon" />
                        <div>
                            <span className="stat-number">{stats.model_accuracy}%</span>
                            <span className="stat-text">Model Accuracy (R²)</span>
                        </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <Clock size={20} className="stat-icon" />
                        <div>
                            <span className="stat-number">&lt; 2s</span>
                            <span className="stat-text">Average Response</span>
                        </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <Shield size={20} className="stat-icon" />
                        <div>
                            <span className="stat-number">100%</span>
                            <span className="stat-text">Data Privacy</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="features-section">
                <div className="features-inner">
                    <span className="section-tag">Why Choose Us</span>
                    <h2 className="section-title">Built for Smarter Decisions</h2>
                    <p className="section-desc">
                        Our ML model analyzes real insurance data to give you the most accurate
                        premium estimates in seconds.
                    </p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrap icon-yellow">
                                <TrendingUp size={24} />
                            </div>
                            <h3>Data-Driven Predictions</h3>
                            <p>
                                Trained on comprehensive insurance datasets covering age, BMI,
                                smoking status, region, and family size.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrap icon-green">
                                <Zap size={24} />
                            </div>
                            <h3>Instant Results</h3>
                            <p>
                                Get your premium estimate in under 2 seconds. No paperwork,
                                no callbacks — just real-time predictions.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrap icon-blue">
                                <Shield size={24} />
                            </div>
                            <h3>Secure & Private</h3>
                            <p>
                                Your health data is encrypted end-to-end and never shared.
                                We take your privacy seriously.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrap icon-purple">
                                <Activity size={24} />
                            </div>
                            <h3>Track Your History</h3>
                            <p>
                                Every prediction is saved to your dashboard so you can
                                monitor changes and trends over time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="cta-section">
                <div className="cta-card">
                    <div className="cta-glow" />
                    <h2>Ready to Know Your Premium?</h2>
                    <p>
                        {isLoggedIn
                            ? 'Head to the calculator and get your personalized estimate now.'
                            : 'Join thousands of users making smarter insurance decisions today.'}
                    </p>
                    <button className="btn-primary btn-lg" onClick={handleGetPrediction}>
                        {isLoggedIn ? 'Go to Calculator' : 'Create Free Account'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>

        </div>
    );
}

export default Home;
