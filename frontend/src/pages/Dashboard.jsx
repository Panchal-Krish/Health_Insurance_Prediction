import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle, Loader, Activity, User, HeartPulse,
    Flame, MapPin, Calculator, CalendarClock, DollarSign,
    ChevronRight, ChevronLeft, LogIn, Users
} from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import './../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Dashboard() {
    const navigate = useNavigate();
    const { isLoggedIn, fullName } = useAuth();

    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchPredictions();
    }, [isLoggedIn]);

    const fetchPredictions = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch the ENTIRE prediction history timeline
            const response = await fetchWithAuth(`${API_URL}/my-predictions`);
            if (!response) return; // intercepted by auth redirect

            if (!response.ok) {
                throw new Error('Failed to fetch prediction history');
            }

            const data = await response.json();
            setPredictions(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Unable to load your dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-container">
                    <Loader className="spinner-large" />
                    <h2>Analyzing your data</h2>
                    <p style={{ color: '#94a3b8' }}>Securely fetching your insurance history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="error-container">
                    <AlertCircle className="error-icon-large" />
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button className="new-predict-btn" onClick={fetchPredictions} style={{ marginTop: '20px' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // EMPTY STATE: User has 0 predictions
    if (!predictions || predictions.length === 0) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <div>
                            <h1>Welcome, {fullName ? fullName.split(' ')[0] : 'User'} 👋</h1>
                            <p>Ready to discover your health insurance profile?</p>
                        </div>
                    </div>

                    <div className="empty-state-glass">
                        <div className="empty-state-icon-wrapper">
                            <div className="glow-ring"></div>
                            <Calculator size={40} className="empty-state-icon" />
                        </div>
                        <h2 className="empty-state-title">Ready to calculate your first premium?</h2>
                        <p className="empty-state-desc">
                            Leverage our AI-powered model to get an accurate, personalized health insurance estimate in seconds.
                        </p>
                        
                        <div className="empty-state-steps">
                            <div className="step-item">
                                <div className="step-num">1</div>
                                <span>Enter details</span>
                            </div>
                            <div className="step-line" />
                            <div className="step-item">
                                <div className="step-num">2</div>
                                <span>AI assesses risk</span>
                            </div>
                            <div className="step-line" />
                            <div className="step-item">
                                <div className="step-num">3</div>
                                <span>Get premium</span>
                            </div>
                        </div>

                        <button className="predict-large-btn" onClick={() => navigate('/predict')}>
                            Calculate First Premium <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // DATA STATE: User has at least 1 prediction
    const latest = predictions[0]; // The backend sorted it descending by date

    // Pagination logic
    const totalPages = Math.ceil(predictions.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const currentPredictions = predictions.slice(startIndex, startIndex + recordsPerPage);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome back, {fullName || 'User'}. Here is your latest overview.</p>
                    </div>
                    <button className="new-predict-btn" onClick={() => navigate('/predict')}>
                        <Calculator size={18} />
                        New Prediction
                    </button>
                </div>

                {/* Hero Card (Latest Prediction) */}
                <div className="hero-glass-card">
                    <div className="hero-content">
                        <div className="hero-subtitle">
                            <Activity size={18} />
                            Latest Estimated Premium
                        </div>

                        <h2 className="hero-premium">
                            <span className="currency">$</span>
                            {latest.predicted_premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>

                        {/* Who is this prediction for? */}
                        <div className="predicted-for-badge">
                            {latest.prediction_for === 'other' ? <Users size={14} /> : <User size={14} />}
                            <span>
                                {latest.prediction_for === 'other' && latest.beneficiary_name
                                    ? `For ${latest.beneficiary_name}`
                                    : 'For Self'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Vitals Grid */}
                <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#fff' }}>Latest Prediction Summary</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper icon-age"><User size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-label">Age / Gender</span>
                            <span className="stat-value">{latest.age} yrs • {latest.gender === 'male' ? 'M' : 'F'}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper icon-bmi"><Activity size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-label">BMI Score</span>
                            <span className="stat-value">{latest.bmi}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper icon-smoker"><Flame size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-label">Smoker Status</span>
                            <span className="stat-value" style={{
                                color: latest.smoker ? '#ef4444' : '#10b981'
                            }}>
                                {latest.smoker ? 'Smoker' : 'Non-Smoker'}
                            </span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper icon-children"><HeartPulse size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-label">Dependents</span>
                            <span className="stat-value">{latest.children}</span>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                {predictions.length > 0 && (
                    <div className="history-section">
                        <div className="history-header">
                            <CalendarClock className="history-icon" size={24} />
                            <h2>Prediction Timeline</h2>
                        </div>

                        <div className="history-list">
                            {currentPredictions.map((item, index) => {
                                return (
                                    <div className="history-item" key={index}>
                                        
                                        {/* Group 1: Date & Time */}
                                        <div className="hi-section hi-date">
                                            <div className="hi-date-main">
                                                {new Date(item.last_checked_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="hi-time-sub">
                                                {new Date(item.last_checked_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* Group 2: Predicted For */}
                                        <div className="hi-section hi-for">
                                            <span className="hi-label">For</span>
                                            <div className="hi-for-value">
                                                {item.prediction_for === 'other' ? <Users size={14} /> : <User size={14} />}
                                                {item.prediction_for === 'other' && item.beneficiary_name ? item.beneficiary_name : 'Self'}
                                            </div>
                                        </div>

                                        {/* Group 3: Traits */}
                                        <div className="hi-section hi-traits">
                                            <span className="hi-label">Traits</span>
                                            <div className="trait-badges">
                                                <span className="trait-badge">BMI: {item.bmi}</span>
                                                {item.smoker && <span className="trait-badge trait-smoker">Smoker</span>}
                                                {item.children > 0 && <span className="trait-badge">{item.children} {item.children === 1 ? 'Child' : 'Children'}</span>}
                                                <span className="trait-badge trait-region">{item.region}</span>
                                            </div>
                                        </div>

                                        {/* Group 4: Premium Amount */}
                                        <div className="hi-section hi-premium">
                                            <span className="hi-label">Assessed Premium</span>
                                            <div className="hi-premium-value">
                                                <span className="hi-currency">$</span>
                                                {item.predicted_premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    className="page-btn" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={18} />
                                    Prev
                                </button>
                                <span className="page-info">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    className="page-btn" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Dashboard;
