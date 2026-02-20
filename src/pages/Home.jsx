// import "./../styles/Home.css";

// function Home() {
//     return (
//         <section className="hero">
//             <span className="badge">AI-Powered Health Analysis</span>

//             <h1>
//                 Unlock Your Health's <br />
//                 <span>Future, Today</span>
//             </h1>

//             <p>
//                 Our AI-powered platform transforms your routine blood test data into clear, personalized risk predictions for chronic diseases, guiding you towards proactive wellness.
//             </p>

//             <div className="buttons">
//                 <button className="primary">
//                     Get Your Free Health Prediction →
//                 </button>
//                 <button className="secondary">
//                     Learn How It Works →
//                 </button>
//             </div>
//         </section>
//     );
// }

// export default Home;

import React from 'react';
import { Sparkles, ArrowRight, Award, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./../styles/Home.css";

function Home() {
    const navigate = useNavigate();

    const handleGetPrediction = () => {
        navigate('/dashboard');
    };

    const handleLearnMore = () => {
        navigate('/how-it-works');
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero">


                <h1>
                    Predict Your <br />
                    <span>Health Insurance, Today</span>
                </h1>

                <p>
                    Our AI-powered platform analyzes your health data to predict insurance charges early, so you can prepare your wallet before visiting the hospital.
                </p>

                <div className="buttons">
                    <button className="primary" onClick={handleGetPrediction}>
                        <Sparkles className="btn-icon" />
                        Get Your Free Health Prediction
                        <ArrowRight className="btn-icon" />
                    </button>
                    <button className="secondary" onClick={handleLearnMore}>
                        Learn How It Works
                        <ArrowRight className="btn-icon" />
                    </button>
                </div>
            </section>

            {/* Why Trust PrognosAI Section */}
            <section className="trust-section">
                <div className="trust-container">
                    <h2 className="trust-title">Why Trust Yam Hai Hum?</h2>
                    <p className="trust-subtitle">
                        Discover the key factors that make Yam your trusted partner in Insurance.
                    </p>

                    <div className="trust-cards">
                        <div className="trust-card">
                            <div className="trust-icon">
                                <Award className="icon" />
                            </div>
                            <h3 className="trust-card-title">Science-Backed</h3>
                            <p className="trust-card-description">
                                Our AI models are trained on extensive medical datasets and validated
                                through rigorous scientific research.
                            </p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon">
                                <Users className="icon" />
                            </div>
                            <h3 className="trust-card-title">Human-Validated</h3>
                            <p className="trust-card-description">
                                Every prediction is reviewed and validated by certified Insurance
                                professionals for accuracy and safety.
                            </p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon">
                                <Lock className="icon" />
                            </div>
                            <h3 className="trust-card-title">Completely Private</h3>
                            <p className="trust-card-description">
                                Your health data is encrypted, secure, and never shared with third
                                parties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;