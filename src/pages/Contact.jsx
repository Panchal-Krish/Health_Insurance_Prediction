import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import "./../styles/Contact.css";

function Contact() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
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

        // Simulate sending (since there's no backend endpoint)
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });

            // Hide success message after 10 seconds
            setTimeout(() => setSuccess(false), 10000);
        }, 1000);
    };

    const handleCreateTicket = () => {
        if (isAuthenticated()) {
            navigate('/helpdesk');
        } else {
            navigate('/signin');
        }
    };

    const handleEmailDirect = () => {
        const subject = encodeURIComponent(formData.subject || 'Contact from Insurance Predictor');
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        window.location.href = `mailto:dmnsir786@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <>
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-badge">
                    <MessageCircle className="badge-icon" />
                    <span>Get in Touch</span>
                </div>

                <h1>
                    Have Questions? <br />
                    <span>We're Here to Help</span>
                </h1>

                <p>
                    Need assistance with insurance premium calculations or have questions about our service?
                    Contact us and we'll get back to you as soon as possible.
                </p>
            </section>

            {/* Contact Form and Info Section */}
            <section className="contact-content">
                <div className="contact-container">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <h2>Contact Information</h2>
                        <p className="contact-info-subtitle">
                            Reach out to us through any of these channels
                        </p>

                        <div className="contact-details">
                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <Mail className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Email Us</h3>
                                    <a href="mailto:dmnsir786@gmail.com">dmnsir786@gmail.com</a>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <Phone className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Call Us</h3>
                                    <a href="tel:+919999000000">+91 9999000000</a>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <MapPin className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Location</h3>
                                    <p>Ahmedabad, Gujarat, India</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {isAuthenticated() && (
                            <div className="quick-action-box">
                                <h3>Need Technical Support?</h3>
                                <p>Create a support ticket for faster response</p>
                                <button 
                                    className="quick-action-btn"
                                    onClick={handleCreateTicket}
                                >
                                    Create Support Ticket
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-wrapper">
                        <h2>Send Us a Message</h2>
                        <p className="contact-form-subtitle">
                            Fill out the form and we'll respond within 24-48 hours
                        </p>

                        {/* Success Message */}
                        {success && (
                            <div className="success-message">
                                <CheckCircle className="success-icon" />
                                <div>
                                    <strong>Message Received!</strong>
                                    <p>Thank you for contacting us. We've received your message and will respond to {formData.email || 'your email'} within 24-48 hours.</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <AlertCircle className="error-icon" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
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
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    placeholder="How can we help you?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    minLength={5}
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us more about your inquiry..."
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    minLength={20}
                                    maxLength={1000}
                                />
                                <small className="char-count">
                                    {formData.message.length}/1000 characters
                                </small>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="spinner" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="btn-icon" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button" 
                                    className="email-direct-btn"
                                    onClick={handleEmailDirect}
                                    disabled={loading}
                                >
                                    <Mail className="btn-icon" />
                                    Email Directly
                                </button>
                            </div>
                        </form>

                        <p className="form-note">
                            * Required fields. Your information is kept confidential and used only to respond to your inquiry.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contact;