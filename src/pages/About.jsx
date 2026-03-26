import React, { useEffect, useRef, useState } from "react";
import "../styles/About.css";

const milestones = [
  { year: "2000", title: "The Idea is Born", description: "In the early days of digital health, we identified a critical gap — millions of Indians had no easy way to estimate their insurance costs. A small team of passionate technologists set out to change that." },
  { year: "2004", title: "First Algorithm", description: "After years of research with actuaries and insurance experts, we developed our first premium calculation algorithm. It proved that AI could democratize access to insurance intelligence." },
  { year: "2008", title: "Data Foundations", description: "We began aggregating anonymized health and insurance datasets, partnering with regional hospitals and clinics. This data backbone would fuel everything we built going forward." },
  { year: "2012", title: "Cloud Infrastructure", description: "Migrating to the cloud unlocked scale we never imagined. Our systems could handle millions of predictions per day with 99.99% uptime. We served our first 100,000 users within months." },
  { year: "2016", title: "Machine Learning Era", description: "We rebuilt our prediction engine using modern machine learning — integrating BMI, lifestyle habits, regional health trends, and pre-existing conditions. Accuracy leaped to over 94%." },
  { year: "2020", title: "Platform Launch", description: "The full consumer platform went live with a sleek dashboard, real-time predictions, and secure user accounts. Within the first year, over 500,000 users had calculated their premiums." },
  { year: "2023", title: "AI-Powered Assistant", description: "We introduced HealthBot, our in-house AI assistant trained on thousands of insurance scenarios. Users do not just get a number — they get an explanation and a path forward." },
  { year: "2026", title: "The Future Unfolds", description: "Today we stand at the frontier of health-tech innovation. With a growing team, cutting-edge models, and a mission unchanged in 26 years — we are just getting started." },
];

const team = [
  { name: "Shreyash Trivedi", role: "Frontend Developer", emoji: "🎨", description: "Shreyash architects every pixel of the user experience. With a deep love for motion design and component engineering, he transforms complex insurance data into interfaces that feel effortless and beautiful.", side: "left", accent: "#facc15" },
  { name: "Krish Panchal", role: "Backend & Security", emoji: "🔐", description: "Krish is the fortress behind the platform. He designs the APIs, secures user data with enterprise-grade encryption, and ensures every transaction is bulletproof so users can trust us completely.", side: "right", accent: "#3b82f6" },
  { name: "Dhananjay Navani", role: "Cloud & Data Engineer", emoji: "☁️", description: "Dhananjay keeps the engine running at scale. From cloud infrastructure to data pipelines that process millions of records daily — he is the reason our platform is fast, reliable, and always available.", side: "left", accent: "#22c55e" },
];

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

function MilestoneItem({ item, index }) {
  const [ref, inView] = useInView();
  const isLeft = index % 2 === 0;
  return (
    <div
      ref={ref}
      className={`milestone-item ${isLeft ? "milestone-left" : "milestone-right"} ${inView ? "milestone-visible" : ""}`}
    >
      <div className="milestone-card">
        <span className="milestone-year-tag">{item.year}</span>
        <h3 className="milestone-title">{item.title}</h3>
        <p className="milestone-desc">{item.description}</p>
      </div>
      <div className="milestone-dot-wrapper">
        <div className={`milestone-dot ${inView ? "dot-active" : ""}`}>
          <div className="dot-inner" />
        </div>
      </div>
      <div className="milestone-spacer" />
    </div>
  );
}

function TeamCard({ member }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`team-item ${member.side === "left" ? "team-left" : "team-right"} ${inView ? "team-visible" : ""}`}
      style={{ "--accent": member.accent }}
    >
      <div className="team-card">
        <div className="team-emoji-wrapper">
          <span className="team-emoji">{member.emoji}</span>
          <div className="team-emoji-glow" style={{ background: member.accent }} />
        </div>
        <div className="team-info">
          <p className="team-role">{member.role}</p>
          <h3 className="team-name">{member.name}</h3>
          <p className="team-desc">{member.description}</p>
        </div>
      </div>
    </div>
  );
}

function About() {
  const [heroRef, heroInView] = useInView();
  const [teamHeaderRef, teamHeaderInView] = useInView();

  return (
    <div className="about-page">
      <div className="about-bg-grid" />
      <div className="about-bg-glow" />

      <section ref={heroRef} className={`about-hero ${heroInView ? "hero-visible" : ""}`}>
        <div className="hero-label">Est. 2000 · Health Intelligence</div>
        <h1 className="hero-title">
          Two Decades of <br />
          <span className="hero-accent">Redefining</span> Insurance
        </h1>
        <p className="hero-subtitle">
          We started with a simple belief: every person deserves to understand their health insurance before they need it.
          Over 26 years, that belief has grown into a platform trusted by millions — built on data, driven by empathy,
          and powered by technology that puts people first.
        </p>
        <div className="hero-stats">
          {[["500K+", "Users Served"], ["94%", "Prediction Accuracy"], ["26", "Years of Innovation"], ["3", "Visionary Founders"]].map(([num, label]) => (
            <div className="hero-stat" key={label}>
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="timeline-section">
        <div className="timeline-header">
          <span className="section-label">Our Journey</span>
          <h2 className="section-title">From Vision to Reality</h2>
        </div>
        <div className="timeline-wrapper">
          <div className="timeline-line">
            <div className="timeline-line-fill" />
          </div>
          {milestones.map((item, index) => (
            <MilestoneItem key={item.year} item={item} index={index} />
          ))}
          <div className="timeline-end">
            <div className="timeline-end-dot"><span>✦</span></div>
            <p className="timeline-end-text">The journey continues…</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div ref={teamHeaderRef} className={`team-header ${teamHeaderInView ? "team-header-visible" : ""}`}>
          <span className="section-label">The Minds Behind It</span>
          <h2 className="section-title">Meet the Founders</h2>
          <p className="team-subtitle">
            Three specialists. One shared obsession with making health insurance transparent,
            accessible, and intelligent for every Indian.
          </p>
        </div>
        <div className="team-list">
          {team.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </section>

      <section className="about-cta">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to know your premium?</h2>
          <p className="cta-sub">Join half a million users who trust our AI-powered predictions.</p>
          <a href="/predict" className="cta-btn">Calculate My Premium →</a>
        </div>
      </section>
    </div>
  );
}

export default About;