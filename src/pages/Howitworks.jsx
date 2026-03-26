import React, { useEffect, useRef, useState } from "react";
import "../styles/HowItWorks.css";

function useInView(threshold = 0.2) {
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

const steps = [
    {
        number: "01",
        icon: "👤",
        title: "Create Your Account",
        subtitle: "Sign up in seconds",
        description: "Register with just your email and a password. Your data is encrypted end-to-end and never shared with third parties. A secure account means your insurance history is always safe and accessible.",
        tags: ["Secure Signup", "Email Verification", "Data Encrypted"],
        color: "#facc15",
    },
    {
        number: "02",
        icon: "📋",
        title: "Enter Your Details",
        subtitle: "Tell us about yourself",
        description: "Fill in key health and lifestyle factors — your age, BMI, whether you smoke, number of dependents, pre-existing conditions, and annual income. Our form is simple, quick, and takes under 2 minutes.",
        tags: ["Age & BMI", "Lifestyle Factors", "Income Range"],
        color: "#3b82f6",
    },
    {
        number: "03",
        icon: "🧠",
        title: "AI Analyses Your Profile",
        subtitle: "Our model gets to work",
        description: "Our machine learning model — trained on hundreds of thousands of real insurance cases — analyses your inputs against regional health trends, actuarial tables, and risk factors to compute your personalised premium.",
        tags: ["ML Model", "94% Accuracy", "Real-Time Processing"],
        color: "#a78bfa",
    },
    {
        number: "04",
        icon: "📊",
        title: "Get Your Prediction",
        subtitle: "Instant results, clear breakdown",
        description: "Within seconds, you receive your estimated annual insurance premium in INR. Your result is saved to your personal dashboard so you can track changes over time or compare different scenarios.",
        tags: ["Instant Result", "INR Premium", "Dashboard Saved"],
        color: "#22c55e",
    },
];

const faqs = [
    { q: "How accurate is the prediction?", a: "Our model achieves over 94% accuracy by training on hundreds of thousands of verified insurance records across India, factoring in regional health data and actuarial patterns." },
    { q: "Is my personal data safe?", a: "Absolutely. All data is encrypted in transit and at rest using AES-256. We never sell or share your personal information with insurers or advertisers." },
    { q: "Does the result change if my health changes?", a: "Yes! You can re-calculate your premium anytime. Log back in, update your details, and get a fresh prediction reflecting your current health status." },
    { q: "Can I use this to buy insurance?", a: "Our platform is a prediction and awareness tool. Once you know your estimated premium, we help you understand what to expect before approaching an insurer." },
    { q: "What factors affect my premium most?", a: "Smoking status and pre-existing diseases have the biggest impact, followed by age, BMI, and number of dependents. Annual income influences your tier as well." },
];

function StepCard({ step, index }) {
    const [ref, inView] = useInView(0.15);
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className={`step-row ${isEven ? "step-row-left" : "step-row-right"} ${inView ? "step-visible" : ""}`}
            style={{ "--step-color": step.color, "--delay": `${index * 0.1}s` }}
        >
            {/* Big number */}
            <div className="step-number-col">
                <span className="step-big-number">{step.number}</span>
            </div>

            {/* Connector */}
            <div className="step-connector">
                <div className={`step-node ${inView ? "node-active" : ""}`}>
                    <span className="step-icon">{step.icon}</span>
                    <div className="node-ring" />
                    <div className="node-ring node-ring-2" />
                </div>
                {index < steps.length - 1 && <div className={`step-line ${inView ? "line-active" : ""}`} />}
            </div>

            {/* Card */}
            <div className="step-card">
                <div className="step-card-header">
                    <span className="step-subtitle">{step.subtitle}</span>
                    <h3 className="step-title">{step.title}</h3>
                </div>
                <p className="step-description">{step.description}</p>
                <div className="step-tags">
                    {step.tags.map(tag => (
                        <span key={tag} className="step-tag">{tag}</span>
                    ))}
                </div>
                <div className="step-card-glow" />
            </div>
        </div>
    );
}

function FaqItem({ item, index }) {
    const [open, setOpen] = useState(false);
    const [ref, inView] = useInView(0.1);

    return (
        <div
            ref={ref}
            className={`faq-item ${open ? "faq-open" : ""} ${inView ? "faq-visible" : ""}`}
            style={{ "--delay": `${index * 0.08}s` }}
            onClick={() => setOpen(o => !o)}
        >
            <div className="faq-question">
                <span>{item.q}</span>
                <div className={`faq-icon ${open ? "faq-icon-open" : ""}`}>
                    <span />
                    <span />
                </div>
            </div>
            <div className="faq-answer">
                <p>{item.a}</p>
            </div>
        </div>
    );
}

function HowItWorks() {
    const [heroRef, heroInView] = useInView(0.1);
    const [statsRef, statsInView] = useInView(0.1);
    const [faqRef, faqInView] = useInView(0.1);

    return (
        <div className="hiw-page">
            <div className="hiw-bg-dots" />
            <div className="hiw-bg-beam hiw-bg-beam-1" />
            <div className="hiw-bg-beam hiw-bg-beam-2" />

            {/* ── HERO ── */}
            <section ref={heroRef} className={`hiw-hero ${heroInView ? "hiw-hero-visible" : ""}`}>
                <div className="hiw-hero-badge">
                    <span className="badge-dot" />
                    Simple · Fast · Accurate
                </div>
                <h1 className="hiw-hero-title">
                    How Does Our<br />
                    <span className="hiw-hero-highlight">AI Predict</span><br />
                    Your Premium?
                </h1>
                <p className="hiw-hero-sub">
                    Four simple steps stand between you and a precise, personalised health insurance
                    premium estimate — powered by machine learning and 26 years of actuarial data.
                </p>
                <div className="hiw-hero-actions">
                    <a href="/predict" className="hiw-btn-primary">Try It Now →</a>
                    <a href="/signup" className="hiw-btn-secondary">Create Account</a>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section ref={statsRef} className={`hiw-stats ${statsInView ? "stats-visible" : ""}`}>
                {[
                    { val: "2 min", label: "Average Time", icon: "⚡" },
                    { val: "98.5%", label: "Model Accuracy", icon: "🎯" },
                    { val: "500K+", label: "Predictions Made", icon: "📈" },
                    { val: "0₹", label: "Cost to Use", icon: "🆓" },
                ].map(({ val, label, icon }, i) => (
                    <div key={label} className="hiw-stat" style={{ "--delay": `${i * 0.1}s` }}>
                        <span className="hiw-stat-icon">{icon}</span>
                        <span className="hiw-stat-val">{val}</span>
                        <span className="hiw-stat-label">{label}</span>
                    </div>
                ))}
            </section>

            {/* ── STEPS ── */}
            <section className="hiw-steps-section">
                <div className="hiw-section-header">
                    <span className="hiw-section-label">The Process</span>
                    <h2 className="hiw-section-title">4 Steps to Your Premium</h2>
                </div>
                <div className="hiw-steps-wrapper">
                    {steps.map((step, index) => (
                        <StepCard key={step.number} step={step} index={index} />
                    ))}
                </div>
            </section>

            {/* ── FACTORS ── */}
            <section className="hiw-factors-section">
                <div className="hiw-section-header">
                    <span className="hiw-section-label">What We Analyse</span>
                    <h2 className="hiw-section-title">Factors That Shape Your Premium</h2>
                </div>
                <div className="hiw-factors-grid">
                    {[
                        { icon: "🚬", label: "Smoking Status", impact: "Very High", bar: 95, color: "#ef4444" },
                        { icon: "🏥", label: "Pre-existing Diseases", impact: "Very High", bar: 90, color: "#f97316" },
                        { icon: "🎂", label: "Age", impact: "High", bar: 75, color: "#facc15" },
                        { icon: "⚖️", label: "BMI", impact: "High", bar: 70, color: "#a78bfa" },
                        { icon: "👨‍👩‍👧", label: "Number of Dependents", impact: "Medium", bar: 55, color: "#3b82f6" },
                        { icon: "💰", label: "Annual Income", impact: "Medium", bar: 45, color: "#22c55e" },
                        { icon: "🗺️", label: "Region", impact: "Low", bar: 25, color: "#6b7280" },
                        { icon: "👤", label: "Gender", impact: "Low", bar: 20, color: "#6b7280" },
                    ].map((f, i) => (
                        <FactorCard key={f.label} factor={f} index={i} />
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="hiw-faq-section">
                <div ref={faqRef} className={`hiw-section-header ${faqInView ? "faq-header-visible" : ""}`}>
                    <span className="hiw-section-label">Got Questions?</span>
                    <h2 className="hiw-section-title">Frequently Asked</h2>
                </div>
                <div className="hiw-faq-list">
                    {faqs.map((item, i) => (
                        <FaqItem key={i} item={item} index={i} />
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="hiw-cta">
                <div className="hiw-cta-inner">
                    <div className="hiw-cta-glow" />
                    <h2 className="hiw-cta-title">Know Your Premium in 2 Minutes</h2>
                    <p className="hiw-cta-sub">No paperwork. No calls. Just your number — instantly.</p>
                    <a href="/predict" className="hiw-btn-primary hiw-cta-btn">Calculate My Premium →</a>
                </div>
            </section>
        </div>
    );
}

function FactorCard({ factor, index }) {
    const [ref, inView] = useInView(0.15);
    return (
        <div
            ref={ref}
            className={`factor-card ${inView ? "factor-visible" : ""}`}
            style={{ "--factor-color": factor.color, "--bar-width": `${factor.bar}%`, "--delay": `${index * 0.07}s` }}
        >
            <div className="factor-top">
                <span className="factor-icon">{factor.icon}</span>
                <span className="factor-impact" style={{ color: factor.color }}>{factor.impact}</span>
            </div>
            <p className="factor-label">{factor.label}</p>
            <div className="factor-bar-track">
                <div className={`factor-bar-fill ${inView ? "bar-animate" : ""}`} />
            </div>
        </div>
    );
}

export default HowItWorks;