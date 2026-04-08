import React from 'react';
import { User, Mail, Shield, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './../styles/AuthPages.css';

function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">

                {/* Left Side: Profile Side Panel */}
                <div className="auth-branding profile-sidebar">
                    <div className="brand-content profile-sidebar-content">
                        <div className="profile-avatar-large">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2 className="auth-title profile-sidebar-name">{user.fullName || 'User'}</h2>
                        <p className="auth-subtitle profile-sidebar-email">{user.email}</p>
                        
                        <div className="profile-role-badge">
                            <Shield size={14} />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                    </div>
                </div>
                
                {/* Right Side: Account Settings */}
                <div className="auth-form-panel">
                    <h2 className="auth-title">Account Settings</h2>
                    <p className="auth-subtitle">View your details and manage security preferences.</p>
                    
                    <div className="profile-grid">
                        {/* Account Info Section */}
                        <div className="profile-section">
                            <h3 className="profile-section-title">Personal Details</h3>
                            <div className="profile-fields">
                                <div className="field">
                                    <label>Full Name</label>
                                    <div className="field-input field-input-disabled">
                                        <User size={16} className="field-icon" />
                                        <input type="text" value={user.fullName || 'User'} disabled />
                                    </div>
                                </div>

                                <div className="field">
                                    <label>Email Address</label>
                                    <div className="field-input field-input-disabled">
                                        <Mail size={16} className="field-icon" />
                                        <input type="text" value={user.email} disabled />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="profile-section">
                            <div className="profile-security-header">
                                <KeyRound size={20} className="profile-security-icon" />
                                <h3 className="profile-section-title">Security</h3>
                            </div>
                            <p className="profile-security-desc">
                                Need to update your password? We will send a secure reset link to your email.
                            </p>
                            <button 
                                className="auth-submit auth-btn-outline"
                                onClick={() => navigate('/forgot-password')}
                                style={{ marginTop: 'auto' }}
                            >
                                Change Password <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;
