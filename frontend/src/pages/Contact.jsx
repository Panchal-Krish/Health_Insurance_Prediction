import React, { useState, useEffect, useRef } from 'react';
import {
    Mail, MapPin, Send, CheckCircle, AlertCircle,
    Loader, MessageSquare, ArrowRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./../styles/Contact.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Contact() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const successTimerRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.name.trim().length < 3) {
            setError('Name must be at least 3 characters long');
            return;
        }
        if (formData.subject.trim().length < 5) {
            setError('Subject must be at least 5 characters long');
            return;
        }
        if (formData.message.trim().length < 20) {
            setError('Message must be at least 20 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send message');
            }

            const submittedEmail = formData.email.trim();
            setSuccess(submittedEmail);
            setFormData({ name: '', email: '', subject: '', message: '' });
            successTimerRef.current = setTimeout(() => setSuccess(false), 10000);

        } catch (err) {
            console.error('Contact form error:', err);
            setError(err.message || 'Unable to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-orb contact-orb-1" />
            <div className="contact-orb contact-orb-2" />

            {/* ── HERO ── */}
            <section className="contact-hero">
                <div className="contact-badge">
                    <MessageSquare size={14} />
                    <span>Contact Us</span>
                </div>
                <h1 className="contact-heading">
                    Have a Question?
                    <br />
                    <span className="contact-heading-accent">Let's Talk</span>
                </h1>
                <p className="contact-sub">
                    Not a registered user yet? Send us a message using the form below
                    and we'll get back to you within 24–48 hours.
                </p>
            </section>

            {/* ── MAIN CONTENT ── */}
            <section className="contact-body">
                <div className="contact-layout">

                    {/* Left — Form */}
                    <div className="contact-form-card">
                        <h2>Send a Message</h2>
                        <p className="contact-form-sub">All fields marked with * are required</p>

                        {success && (
                            <div className="contact-alert contact-alert-success">
                                <CheckCircle size={18} />
                                <div>
                                    <strong>Message Sent!</strong>
                                    <p>We'll respond to <strong>{success}</strong> within 24–48 hours.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="contact-alert contact-alert-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="contact-form-row">
                                <div className="contact-field">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </div>
                                <div className="contact-field">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="contact-field">
                                <label htmlFor="subject">Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    placeholder="What's this about?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    minLength={5}
                                    maxLength={100}
                                />
                            </div>

                            <div className="contact-field">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us more about your inquiry (min 20 characters)..."
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    minLength={20}
                                    maxLength={1000}
                                />
                                <span className="contact-char-count">
                                    {formData.message.length} / 1000
                                </span>
                            </div>

                            <button type="submit" className="contact-submit" disabled={loading}>
                                {loading ? (
                                    <><Loader size={18} className="contact-spinner" /> Sending...</>
                                ) : (
                                    <><Send size={18} /> Send Message</>
                                )}
                            </button>
                        </form>

                        <p className="contact-form-note">
                            Your information is kept confidential and used only to respond to your inquiry.
                        </p>
                    </div>

                    {/* Right — Info Sidebar */}
                    <div className="contact-sidebar">
                        <div className="contact-info-card">
                            <h3>Get In Touch</h3>
                            <div className="contact-info-items">
                                <div className="contact-info-item">
                                    <div className="contact-info-icon">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <span className="contact-info-label">Email</span>
                                        <a href="mailto:g16ibmproject@gmail.com">g16ibmproject@gmail.com</a>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-info-icon">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <span className="contact-info-label">Location</span>
                                        <span>Ganpat University ICT, Gujarat</span>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-info-icon">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <span className="contact-info-label">Response Time</span>
                                        <span>24 – 48 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logged-in prompt */}
                        <div className="contact-tip-card">
                            <h3>Already a user?</h3>
                            <p>
                                Logged-in users get faster support through our built-in Help Desk with ticket tracking.
                            </p>
                            <button className="contact-tip-btn" onClick={() => navigate(isLoggedIn ? '/helpdesk' : '/signin')}>
                                {isLoggedIn ? 'Go to Help Desk' : 'Sign In for Help Desk'}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Contact;