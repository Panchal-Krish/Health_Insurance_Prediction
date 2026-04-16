import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import './../styles/AuthPages.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return; // Prevent React Strict Mode double-call
        hasCalled.current = true;

        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`${API_URL}/verify-email/${token}`);
                const data = await response.json();
                
                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Your email has been verified successfully.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Invalid or expired verification link.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Unable to connect to the server. Please try again later.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-compact">
                <div className="auth-form-panel auth-centered-panel">
                    
                    {status === 'verifying' && (
                        <div className="auth-status-block">
                            <div className="auth-status-icon auth-status-loading">
                                <Loader size={48} className="auth-spin-icon" />
                            </div>
                            <h1 className="auth-title">Verifying Email</h1>
                            <p className="auth-subtitle">Please wait while we verify your account...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="auth-status-block">
                            <div className="auth-status-icon auth-status-success">
                                <CheckCircle size={56} />
                            </div>
                            <h1 className="auth-title">Email Verified!</h1>
                            <p className="auth-subtitle">{message}</p>
                            <button 
                                className="auth-submit auth-status-btn" 
                                onClick={() => navigate('/signin')}
                            >
                                Continue to Sign In <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="auth-status-block">
                            <div className="auth-status-icon auth-status-error">
                                <XCircle size={56} />
                            </div>
                            <h1 className="auth-title">Verification Failed</h1>
                            <p className="auth-subtitle auth-text-error">{message}</p>
                            <button 
                                className="auth-submit auth-btn-outline auth-status-btn" 
                                onClick={() => navigate('/signup')}
                            >
                                Back to Sign Up
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
