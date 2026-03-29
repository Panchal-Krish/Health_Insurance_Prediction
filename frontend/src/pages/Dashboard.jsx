import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AlertCircle, Loader, Activity, User, HeartPulse, 
    Flame, MapPin, Calculator, CalendarClock, DollarSign,
    ChevronRight, LogIn
} from 'lucide-react';
import { fetchWithAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import './../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getPremiumRisk = (premium) => {
    if (premium < 10000) return { label: 'Low Risk', percent: 30, class: 'risk-low', color: '#10b981' };
    if (premium < 25000) return { label: 'Medium Risk', percent: 65, class: 'risk-medium', color: '#facc15' };
    return { label: 'High Risk', percent: 95, class: 'risk-high', color: '#ef4444' };
};

function Dashboard() {
    const navigate = useNavigate();
    const { isLoggedIn, fullName } = useAuth();

    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    <p style={{color: '#94a3b8'}}>Securely fetching your insurance history...</p>
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
                    <button className="new-predict-btn" onClick={fetchPredictions} style={{marginTop: '20px'}}>
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

                    <div className="empty-state">
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
                            <Calculator size={64} color="#38bdf8" />
                        </div>
                        <h2>No Predictions Yet</h2>
                        <p>You haven't calculated any premiums yet. Run our state-of-the-art machine learning model to get your personalized health insurance estimate instantly.</p>
                        <button className="predict-large-btn" onClick={() => navigate('/predict')}>
                            Calculate First Premium
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // DATA STATE: User has at least 1 prediction
    const latest = predictions[0]; // The backend sorted it descending by date
    const history = predictions.slice(1); // The rest of the history
    const risk = getPremiumRisk(latest.predicted_premium);

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
                        
                        <div className="risk-container">
                            <div className="risk-bar">
                                <div 
                                    className="risk-fill" 
                                    style={{ 
                                        width: `${risk.percent}%`,
                                        background: `linear-gradient(90deg, #10b981 0%, ${risk.color} 100%)` 
                                    }} 
                                />
                            </div>
                            <div className="risk-labels">
                                <span style={{ color: '#94a3b8' }}>Evaluated Risk Assessment</span>
                                <span style={{ color: risk.color, fontWeight: '700' }}>{risk.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vitals Grid */}
                <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#fff' }}>Your Profile Summary</h3>
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
                            <span className="stat-value" style={{ color: latest.smoker ? '#ef4444' : '#10b981' }}>
                                {latest.smoker ? 'Active' : 'Non-Smoker'}
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
                {history.length > 0 && (
                    <div className="history-section">
                        <div className="history-header">
                            <CalendarClock className="history-icon" size={24} />
                            <h2>Prediction Timeline</h2>
                        </div>
                        
                        <div className="table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date Checked</th>
                                        <th>Traits Profile</th>
                                        <th>Risk Status</th>
                                        <th>Assessed Premium</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, index) => {
                                        const r = getPremiumRisk(item.predicted_premium);
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {new Date(item.last_checked_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                                                        {new Date(item.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="trait-badges">
                                                        <span className="trait-badge">BMI: {item.bmi}</span>
                                                        {item.smoker && <span className="trait-badge" style={{color: '#fca5a5', background: 'rgba(239,68,68,0.1)'}}>Smoker</span>}
                                                        {item.children > 0 && <span className="trait-badge">{item.children} Child</span>}
                                                        <span className="trait-badge" style={{textTransform: 'capitalize'}}>{item.region}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`risk-badge ${r.class}`}>
                                                        {r.label}
                                                    </span>
                                                </td>
                                                <td className="premium-cell">
                                                    ${item.predicted_premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Dashboard;