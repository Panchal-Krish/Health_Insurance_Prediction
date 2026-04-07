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
        <div className="auth-page auth-page-top">
            <div className="auth-card auth-card-profile">

                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-header-info">
                        <h1 className="auth-title">{user.fullName || 'User'}</h1>
                        <p className="auth-subtitle">{user.email}</p>
                    </div>
                </div>
                
                <div className="auth-form-panel auth-full-panel">
                    
                    {/* Account Info Section */}
                    <div className="profile-section">
                        <h3 className="profile-section-title">Account Information</h3>
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

                            <div className="field">
                                <label>Account Role</label>
                                <div className="field-input field-input-disabled">
                                    <Shield size={16} className="field-icon" />
                                    <input type="text" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="profile-section profile-section-bordered">
                        <div className="profile-security-header">
                            <KeyRound size={20} className="profile-security-icon" />
                            <h3 className="profile-section-title">Security</h3>
                        </div>
                        <p className="profile-security-desc">
                            Need to update your password? We'll send a password reset link to your email address.
                        </p>
                        <button 
                            className="auth-submit auth-btn-outline auth-btn-auto"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Change Password <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;
