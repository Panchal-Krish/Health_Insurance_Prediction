import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    ArrowRight, Cloud, Code, Shield, Brain,
    GraduationCap, Users, Lightbulb, Rocket
} from "lucide-react";
import "../styles/About.css";

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, inView];
}

const team = [
    {
        name: "Dhananjay Navani",
        role: "Project Lead · ML & Cloud",
        branch: "Cloud Based Applications",
        color: "#facc15",
        icon: Cloud,
        contributions: [
            "Collected and preprocessed the insurance dataset",
            "Trained the ExtraTreesRegressor ML model (800 estimators, 14 features)",
            "Integrated the trained model into the Flask backend",
            "Led overall project architecture and coordination"
        ]
    },
    {
        name: "Shreyas Trivedi",
        role: "Frontend Developer",
        branch: "Computer Science & Engineering",
        color: "#3b82f6",
        icon: Code,
        contributions: [
            "Built the React frontend with responsive UI components",
            "Implemented user authentication flows (Sign In / Sign Up)",
            "Developed the Dashboard, Predict, and Help Desk pages",
            "Collaborated on API integration and testing"
        ]
    },
    {
        name: "Krish Panchal",
        role: "Backend & Security",
        branch: "Cyber Security",
        color: "#10b981",
        icon: Shield,
        contributions: [
            "Designed the Flask REST API with Blueprint architecture",
            "Set up MongoDB database schema and indexing",
            "Implemented JWT authentication and route protection",
            "Built the admin panel and manager dashboard"
        ]
    }
];

const techStack = [
    { name: "React", category: "Frontend" },
    { name: "Flask", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "scikit-learn", category: "ML" },
    { name: "JWT", category: "Auth" },
    { name: "ExtraTrees", category: "Model" },
];

function TeamCard({ member, index }) {
    const [ref, inView] = useInView(0.1);
    const IconComp = member.icon;

    return (
        <div
            ref={ref}
            className={`about-team-card ${inView ? "card-visible" : ""}`}
            style={{ "--card-color": member.color, "--delay": `${index * 0.15}s` }}
        >
            <div className="team-card-header">
                <div className="team-icon-wrap" style={{ background: `${member.color}15`, color: member.color }}>
                    <IconComp size={24} />
                </div>
                <div className="team-card-meta">
                    <h3 className="team-card-name">{member.name}</h3>
                    <span className="team-card-role">{member.role}</span>
                </div>
            </div>

            <div className="team-card-branch">
                <GraduationCap size={14} />
                <span>{member.branch}</span>
            </div>

            <ul className="team-card-contributions">
                {member.contributions.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function About() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    return (
        <div className="about-page">
            <div className="about-orb about-orb-1" />
            <div className="about-orb about-orb-2" />

            {/* ── HERO ── */}
            <section className="about-hero">
                <div className="about-badge">
                    <GraduationCap size={14} />
                    <span>Semester 8 · IBM Industry Project</span>
                </div>

                <h1 className="about-heading">
                    Built by Students,
                    <br />
                    <span className="about-heading-accent">Powered by ML</span>
                </h1>

                <p className="about-sub">
                    This Health Insurance Premium Predictor is a Semester 8 industry project
                    developed at <strong>Ganpat University — Institute of Computer Technology (ICT)</strong>,
                    under the guidance of IBM and our college mentors.
                </p>

                <div className="about-hero-stats">
                    <div className="about-stat">
                        <span className="about-stat-num">3</span>
                        <span className="about-stat-label">Team Members</span>
                    </div>
                    <div className="about-stat-divider" />
                    <div className="about-stat">
                        <span className="about-stat-num">Sem 8</span>
                        <span className="about-stat-label">Final Year Project</span>
                    </div>
                    <div className="about-stat-divider" />
                    <div className="about-stat">
                        <span className="about-stat-num">89.71%</span>
                        <span className="about-stat-label">Model R² Score</span>
                    </div>
                </div>
            </section>

            {/* ── PROJECT STORY ── */}
            <section className="about-story-section">
                <div className="about-section-head">
                    <span className="about-label">The Project</span>
                    <h2 className="about-section-title">What We Built & Why</h2>
                </div>

                <div className="about-story-grid">
                    <div className="story-card">
                        <div className="story-icon" style={{ background: "rgba(250, 204, 21, 0.1)", color: "#facc15" }}>
                            <Lightbulb size={22} />
                        </div>
                        <h3>The Problem</h3>
                        <p>
                            Millions of people have no easy way to estimate their health insurance
                            premiums before approaching insurers. The process is opaque and time-consuming.
                        </p>
                    </div>
                    <div className="story-card">
                        <div className="story-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                            <Brain size={22} />
                        </div>
                        <h3>Our Solution</h3>
                        <p>
                            We trained an ExtraTreesRegressor model on real insurance data, built a
                            full-stack web app around it, and made premium prediction instant, free, and accessible to anyone.
                        </p>
                    </div>
                    <div className="story-card">
                        <div className="story-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                            <Rocket size={22} />
                        </div>
                        <h3>The Result</h3>
                        <p>
                            A production-ready application with user authentication, a personal dashboard
                            with prediction history, an admin panel, help desk ticketing, and real-time ML inference.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── MENTORS ── */}
            <section className="about-mentors-section">
                <div className="about-section-head">
                    <span className="about-label">Guidance</span>
                    <h2 className="about-section-title">Our Mentors</h2>
                </div>
                <div className="about-mentors-grid">
                    <div className="mentor-card">
                        <div className="mentor-badge external">IBM</div>
                        <h3>Nirav Sir</h3>
                        <p className="mentor-role">Industry Guide — IBM</p>
                        <p className="mentor-desc">
                            External industry mentor from IBM who guided us on real-world
                            software engineering practices, ML deployment, and project standards.
                        </p>
                    </div>
                    <div className="mentor-card">
                        <div className="mentor-badge internal">ICT</div>
                        <h3>Umang Sir</h3>
                        <p className="mentor-role">Internal Guide — Ganpat University ICT</p>
                        <p className="mentor-desc">
                            Our internal college guide who oversaw progress, provided academic direction,
                            and ensured the project met university requirements.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── TEAM ── */}
            <section className="about-team-section">
                <div className="about-section-head">
                    <span className="about-label">The Team</span>
                    <h2 className="about-section-title">Meet the Developers</h2>
                    <p className="about-section-desc">
                        Three final-year students from different specializations, one shared project.
                    </p>
                </div>
                <div className="about-team-grid">
                    {team.map((member, i) => (
                        <TeamCard key={member.name} member={member} index={i} />
                    ))}
                </div>
            </section>

            {/* ── TECH STACK ── */}
            <section className="about-tech-section">
                <div className="about-section-head">
                    <span className="about-label">Built With</span>
                    <h2 className="about-section-title">Technology Stack</h2>
                </div>
                <div className="about-tech-grid">
                    {techStack.map(t => (
                        <div className="tech-pill" key={t.name}>
                            <span className="tech-cat">{t.category}</span>
                            <span className="tech-name">{t.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="about-cta-section">
                <div className="about-cta-card">
                    <div className="about-cta-glow" />
                    <Users size={32} className="about-cta-icon" />
                    <h2>Try What We Built</h2>
                    <p>See our ML model in action — get your personalized premium estimate.</p>
                    <button className="about-cta-btn" onClick={() => navigate(isLoggedIn ? '/predict' : '/signup')}>
                        {isLoggedIn ? 'Calculate Premium' : 'Get Started Free'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>
        </div>
    );
}

export default About;