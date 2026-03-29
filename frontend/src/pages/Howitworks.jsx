import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    ArrowRight, UserPlus, ClipboardList, Brain, LayoutDashboard,
    Cigarette, Calendar, Activity, Baby, MapPin, User, ChevronDown
} from "lucide-react";
import "../styles/HowItWorks.css";

/* Simple scroll-reveal hook */
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

/* ===== DATA ===== */
const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Create Your Account",
        description: "Sign up with your email and password in under 30 seconds. Your data is encrypted and never shared with anyone.",
        tags: ["Quick Signup", "Secure", "Free"],
        color: "#facc15",
    },
    {
        number: "02",
        icon: ClipboardList,
        title: "Enter Your Health Profile",
        description: "Fill in 6 simple fields — age, gender, BMI, number of dependents, smoking status, and your region. That's it.",
        tags: ["6 Fields", "No Paperwork", "Under 1 Min"],
        color: "#3b82f6",
    },
    {
        number: "03",
        icon: Brain,
        title: "ML Model Predicts Your Premium",
        description: "Our ExtraTreesRegressor model with 800 estimators and 14 engineered features analyzes your profile against real insurance data to calculate your premium.",
        tags: ["ExtraTrees", "800 Estimators", "14 Features"],
        color: "#a78bfa",
    },
    {
        number: "04",
        icon: LayoutDashboard,
        title: "View Results on Your Dashboard",
        description: "Your predicted premium is instantly displayed on your personal dashboard with a risk assessment. Every prediction is saved so you can track how your premium changes over time.",
        tags: ["Instant Result", "Risk Score", "Full History"],
        color: "#10b981",
    },
];

const factors = [
    { icon: Cigarette, label: "Smoking Status", impact: "Very High", bar: 95, color: "#ef4444", importance: "32.3%" },
    { icon: Calendar, label: "Age", impact: "High", bar: 78, color: "#facc15", importance: "19.5%" },
    { icon: Activity, label: "BMI", impact: "High", bar: 65, color: "#a78bfa", importance: "8.7%" },
    { icon: Baby, label: "Dependents", impact: "Medium", bar: 45, color: "#3b82f6", importance: "4.6%" },
    { icon: MapPin, label: "Region", impact: "Low", bar: 22, color: "#6b7280", importance: "2.7%" },
    { icon: User, label: "Gender", impact: "Low", bar: 15, color: "#6b7280", importance: "1.1%" },
];

const faqs = [
    {
        q: "How accurate is the prediction?",
        a: "Our ExtraTreesRegressor model achieves an R² score of 81.2% on 5-fold cross-validation using the standard insurance dataset. The Mean Absolute Error is approximately $1,811."
    },
    {
        q: "Is my personal data safe?",
        a: "Yes. All passwords are hashed with bcrypt. Your health data is stored securely in MongoDB and is only accessible through your authenticated account. We never sell or share data."
    },
    {
        q: "What ML model do you use?",
        a: "We use an ExtraTreesRegressor with 800 estimators. The model uses 14 engineered features including interaction terms (age×BMI, BMI×smoker) and polynomial features (age², BMI²) for more accurate predictions."
    },
    {
        q: "Can I run multiple predictions?",
        a: "Absolutely. Every prediction you make is logged to your dashboard with a timestamp. You can change your inputs and compare how different scenarios affect your estimated premium."
    },
    {
        q: "What factors affect my premium the most?",
        a: "Smoking status is by far the biggest factor (32.3% importance), followed by age (19.5%) and BMI (8.7%). Region and gender have relatively small effects on the prediction."
    },
];

/* ===== COMPONENTS ===== */
function StepCard({ step, index }) {
    const [ref, inView] = useInView(0.15);
    const IconComp = step.icon;

    return (
        <div
            ref={ref}
            className={`hiw-step ${inView ? "hiw-step-visible" : ""}`}
            style={{ "--step-color": step.color, "--delay": `${index * 0.12}s` }}
        >
            <div className="hiw-step-number">{step.number}</div>
            <div className="hiw-step-icon-wrap" style={{ background: `${step.color}15`, color: step.color }}>
                <IconComp size={24} />
            </div>
            <h3 className="hiw-step-title">{step.title}</h3>
            <p className="hiw-step-desc">{step.description}</p>
            <div className="hiw-step-tags">
                {step.tags.map(tag => (
                    <span key={tag} className="hiw-step-tag" style={{ color: step.color, borderColor: `${step.color}40`, background: `${step.color}0a` }}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

function FactorCard({ factor, index }) {
    const [ref, inView] = useInView(0.15);
    const IconComp = factor.icon;

    return (
        <div
            ref={ref}
            className={`hiw-factor ${inView ? "hiw-factor-visible" : ""}`}
            style={{ "--factor-color": factor.color, "--bar-w": `${factor.bar}%`, "--delay": `${index * 0.08}s` }}
        >
            <div className="hiw-factor-head">
                <div className="hiw-factor-icon" style={{ background: `${factor.color}15`, color: factor.color }}>
                    <IconComp size={18} />
                </div>
                <span className="hiw-factor-impact" style={{ color: factor.color }}>{factor.impact}</span>
            </div>
            <p className="hiw-factor-label">{factor.label}</p>
            <div className="hiw-factor-bar-track">
                <div className={`hiw-factor-bar-fill ${inView ? "bar-go" : ""}`} />
            </div>
            <span className="hiw-factor-importance">Feature Importance: {factor.importance}</span>
        </div>
    );
}

function FaqItem({ item, index }) {
    const [open, setOpen] = useState(false);
    const [ref, inView] = useInView(0.1);

    return (
        <div
            ref={ref}
            className={`hiw-faq ${open ? "hiw-faq-open" : ""} ${inView ? "hiw-faq-visible" : ""}`}
            style={{ "--delay": `${index * 0.08}s` }}
        >
            <button className="hiw-faq-q" onClick={() => setOpen(o => !o)}>
                <span>{item.q}</span>
                <ChevronDown size={18} className={`hiw-faq-chevron ${open ? "chevron-open" : ""}`} />
            </button>
            <div className="hiw-faq-a">
                <p>{item.a}</p>
            </div>
        </div>
    );
}

/* ===== PAGE ===== */
function HowItWorks() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    return (
        <div className="hiw-page">
            {/* Background */}
            <div className="hiw-orb hiw-orb-1" />
            <div className="hiw-orb hiw-orb-2" />

            {/* ── HERO ── */}
            <section className="hiw-hero">
                <div className="hiw-badge">
                    <span className="hiw-badge-dot" />
                    How It Works
                </div>
                <h1 className="hiw-heading">
                    From Sign Up to
                    <br />
                    <span className="hiw-heading-accent">Premium Prediction</span>
                </h1>
                <p className="hiw-sub">
                    Four simple steps between you and a personalized health insurance
                    premium estimate — powered by an ExtraTrees ML model trained on real insurance data.
                </p>
                <div className="hiw-hero-btns">
                    <button className="hiw-btn-primary" onClick={() => navigate(isLoggedIn ? '/predict' : '/signup')}>
                        {isLoggedIn ? 'Try It Now' : 'Get Started'}
                        <ArrowRight size={18} />
                    </button>
                    <button className="hiw-btn-outline" onClick={() => navigate('/about')}>
                        Learn About Us
                    </button>
                </div>
            </section>

            {/* ── STEPS ── */}
            <section className="hiw-steps-section">
                <div className="hiw-section-head">
                    <span className="hiw-label">The Process</span>
                    <h2 className="hiw-section-title">4 Steps to Your Estimate</h2>
                </div>
                <div className="hiw-steps-grid">
                    {steps.map((step, i) => (
                        <StepCard key={step.number} step={step} index={i} />
                    ))}
                </div>
            </section>

            {/* ── FACTORS ── */}
            <section className="hiw-factors-section">
                <div className="hiw-section-head">
                    <span className="hiw-label">What The Model Analyzes</span>
                    <h2 className="hiw-section-title">Factors That Shape Your Premium</h2>
                    <p className="hiw-section-desc">
                        Feature importances extracted directly from our trained ExtraTreesRegressor model.
                    </p>
                </div>
                <div className="hiw-factors-grid">
                    {factors.map((f, i) => (
                        <FactorCard key={f.label} factor={f} index={i} />
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="hiw-faq-section">
                <div className="hiw-section-head">
                    <span className="hiw-label">Questions?</span>
                    <h2 className="hiw-section-title">Frequently Asked</h2>
                </div>
                <div className="hiw-faq-list">
                    {faqs.map((item, i) => (
                        <FaqItem key={i} item={item} index={i} />
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="hiw-cta-section">
                <div className="hiw-cta-card">
                    <div className="hiw-cta-glow" />
                    <h2>Ready to Know Your Premium?</h2>
                    <p>No paperwork. No phone calls. Just accurate results — instantly.</p>
                    <button className="hiw-btn-primary hiw-btn-lg" onClick={() => navigate(isLoggedIn ? '/predict' : '/signup')}>
                        {isLoggedIn ? 'Calculate My Premium' : 'Create Free Account'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </div>
    );
}

export default HowItWorks;