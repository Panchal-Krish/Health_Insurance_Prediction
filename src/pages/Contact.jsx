import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import "./../styles/Contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
        alert('Thank you for contacting us! We will get back to you soon.');
        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
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
                    Let’s plan your <br />
                    <span>health insurance costs</span>
                </h1>

                <p>
                    Have questions about AI-powered Insurance prediction? Our expert team is here to help.
                    Reach out and let's transform your health journey together.
                </p>
            </section>

            {/* Contact Form and Info Section */}
            <section className="contact-content">
                <div className="contact-container">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p className="contact-info-subtitle">
                            We're here to answer your questions and support your health journey.
                        </p>

                        <div className="contact-details">
                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <Mail className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Email Us</h3>
                                    <a href="mailto:g16ibmproject@gmail.com">dmnsir786@gmail.com</a>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <Phone className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Call Us</h3>
                                    <a href="tel:+919173387806">+91 9999000000</a>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <MapPin className="icon" />
                                </div>
                                <div className="contact-detail-text">
                                    <h3>Visit Us</h3>
                                    <p>Ahmedabad, Gujarat, India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-wrapper">
                        <h2>Send Us a Message</h2>
                        <p className="contact-form-subtitle">
                            Fill out the form below and we'll get back to you as soon as possible.
                        </p>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    placeholder="How can we help you?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us more about your inquiry..."
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                <Send className="btn-icon" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contact;