import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { getToken, fetchWithAuth } from "../utils/auth";
import "./../styles/Predict.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Predict() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        age: "",
        gender: "male",
        bmi: "",
        children: 0,
        smoker: false,
        region: "northeast" // ✅ ADDED: Default region
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        // Check authentication
        const token = getToken();
        if (!token) {
            navigate("/signin");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
        // Clear error when user types
        if (error) setError("");
    };

    const validateForm = () => {
        // Age validation
        const age = Number(form.age);
        if (!form.age || age < 18 || age > 100) {
            setError("Age must be between 18 and 100");
            return false;
        }

        // BMI validation
        const bmi = Number(form.bmi);
        if (!form.bmi || bmi < 10 || bmi > 60) {
            setError("BMI must be between 10 and 60");
            return false;
        }

        // Children validation
        const children = Number(form.children);
        if (children < 0 || children > 10) {
            setError("Number of children must be between 0 and 10");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            // ✅ Convert to ML model format
            const requestData = {
                age: Number(form.age),
                sex: form.gender === "male" ? 1 : 0, // ✅ male=1, female=0
                bmi: Number(form.bmi),
                children: Number(form.children),
                smoker: form.smoker ? 1 : 0, // ✅ Convert to 0/1
                region: form.region // ✅ Backend will one-hot encode
            };

            const response = await fetchWithAuth(
                `${API_URL}/predict-premium`,
                {
                    method: "POST",
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to calculate premium");
            }

            const data = await response.json();
            setResult(data.predicted_premium);

        } catch (err) {
            console.error("Prediction error:", err);
            setError(err.message || "Unable to calculate premium. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDashboard = () => {
        navigate("/dashboard");
    };

    const handlePredictAgain = () => {
        setResult(null);
        setForm({
            age: "",
            gender: "male",
            bmi: "",
            children: 0,
            smoker: false,
            region: "northeast"
        });
    };

    return (
        <div className="predict-page">
            <div className="predict-container">
                <h1 className="predict-title">Premium Calculator</h1>
                <p className="predict-subtitle">
                    Get an instant estimate of your insurance premium
                </p>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <AlertCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <div className="result-container">
                        <CheckCircle className="success-icon-large" />
                        <h2 className="result-title">Your Predicted Premium</h2>
                        <div className="result-amount">₹{result.toLocaleString()}</div>
                        <p className="result-subtitle">
                            This is an AI-powered estimate based on your information
                        </p>
                        <div className="result-actions">
                            <button
                                className="primary-btn"
                                onClick={handleGoToDashboard}
                            >
                                View Dashboard
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={handlePredictAgain}
                            >
                                Calculate Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Prediction Form */}
                {!result && (
                    <form className="predict-form" onSubmit={handleSubmit}>
                        {/* Age */}
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                placeholder="Enter your age (18-100)"
                                value={form.age}
                                onChange={handleChange}
                                disabled={loading}
                                min="18"
                                max="100"
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {/* BMI */}
                        <div className="form-group">
                            <label htmlFor="bmi">BMI (Body Mass Index)</label>
                            <input
                                type="number"
                                id="bmi"
                                name="bmi"
                                step="0.1"
                                placeholder="e.g., 24.5"
                                value={form.bmi}
                                onChange={handleChange}
                                disabled={loading}
                                min="10"
                                max="60"
                                required
                            />
                            <small className="form-hint">
                                Normal range: 18.5 - 24.9
                            </small>
                        </div>

                        {/* Children */}
                        <div className="form-group">
                            <label htmlFor="children">Number of Children</label>
                            <input
                                type="number"
                                id="children"
                                name="children"
                                placeholder="0"
                                value={form.children}
                                onChange={handleChange}
                                disabled={loading}
                                min="0"
                                max="10"
                            />
                        </div>

                        {/* Region - ✅ FIXED: Added dropdown */}
                        <div className="form-group">
                            <label htmlFor="region">Region</label>
                            <select
                                id="region"
                                name="region"
                                value={form.region}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="northeast">Northeast</option>
                                <option value="northwest">Northwest</option>
                                <option value="southeast">Southeast</option>
                                <option value="southwest">Southwest</option>
                            </select>
                        </div>

                        {/* Smoker */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="smoker"
                                    checked={form.smoker}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <span>I am a smoker</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spinner" />
                                    Calculating...
                                </>
                            ) : (
                                "Calculate Premium"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Predict;