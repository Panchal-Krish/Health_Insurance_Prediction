import React, { useEffect } from 'react';
import { Mail, MapPin, Github } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import "./../styles/Footer.css";

function Footer() {
    const { isLoggedIn, role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminOrManager = role === 'admin' || role === 'manager';

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    return (
        <footer className="ft">
            <div className="ft-inner">

                {/* Top Row */}
                <div className="ft-top">
                    {/* Brand */}
                    <div className="ft-brand">
                        <div className="ft-logo" onClick={() => navigate('/')}>
                            <img src={logo} alt="Logo" />
                            <div>
                                <span className="ft-logo-name">Insurance Predictor</span>
                                <span className="ft-logo-tag">Predict your insurance today</span>
                            </div>
                        </div>
                        <p className="ft-desc">
                            A Semester 8 IBM Industry Project built at Ganpat University ICT.
                            Powered by an ExtraTrees ML model trained on real insurance data.
                        </p>
                    </div>

                    {/* Quick Links */}
                    {!isAdminOrManager && (
                        <div className="ft-col">
                            <h4>Navigate</h4>
                            <Link to="/">Home</Link>
                            <Link to="/howitworks">How it Works</Link>
                            <Link to="/about">About Us</Link>
                            <Link to={isLoggedIn ? '/helpdesk' : '/contact'}>
                                {isLoggedIn ? 'Help Desk' : 'Contact'}
                            </Link>
                        </div>
                    )}

                    {/* Account */}
                    <div className="ft-col">
                        <h4>Account</h4>
                        {isLoggedIn ? (
                            <>
                                <Link to="/dashboard">Dashboard</Link>
                                <Link to="/predict">Predict Premium</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/signin">Sign In</Link>
                                <Link to="/signup">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="ft-col">
                        <h4>Contact</h4>
                        <a href="mailto:g16ibmproject@gmail.com" className="ft-contact-item">
                            <Mail size={14} />
                            g16ibmproject@gmail.com
                        </a>
                        <span className="ft-contact-item">
                            <MapPin size={14} />
                            Ganpat University ICT, Gujarat
                        </span>
                        <a
                            href="https://github.com/Panchal-Krish/Health_Insurance_Prediction"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ft-contact-item"
                        >
                            <Github size={14} />
                            GitHub Repository
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="ft-bottom">
                    <span>© {new Date().getFullYear()} Insurance Predictor — Ganpat University ICT</span>
                    <span className="ft-credits">
                        Built by Dhananjay, Shreyas &amp; Krish
                    </span>
                </div>

            </div>
        </footer>
    );
}

export default Footer;