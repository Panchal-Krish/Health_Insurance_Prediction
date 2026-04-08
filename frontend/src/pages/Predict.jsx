import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/auth";
import { AlertCircle, User, Users, Calculator } from "lucide-react";
import "./../styles/SignIn.css";
import "./../styles/Predict.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Predict() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        prediction_for: "self",
        beneficiary_name: "",
        age: "",
        gender: "male",
        bmi: "",
        children: "",
        smoker: false,
        region: "northeast"
    });

    const [loading, setLoading] = useState(false);
    
    // New validation state object
    const [errors, setErrors] = useState({});
    
    // Global fetch error Catch
    const [globalError, setGlobalError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
        
        // Clear specific error as user begins to fix it
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
        if (globalError) setGlobalError("");
    };

    const validateForm = () => {
        const newErrors = {};

        // === BENEFICIARY NAME (only if "other") ===
        if (form.prediction_for === "other") {
            if (!form.beneficiary_name.trim()) {
                newErrors.beneficiary_name = "Name is required when predicting for someone else";
            } else if (form.beneficiary_name.trim().length < 2) {
                newErrors.beneficiary_name = "Name must be at least 2 characters";
            }
        }

        // === AGE ===
        if (!form.age && form.age !== 0) {
            newErrors.age = "Age is required";
        } else {
            const age = Number(form.age);
            if (age < 18 || age > 100) {
                newErrors.age = "Age must be between 18 and 100";
            }
        }

        // === BMI ===
        if (!form.bmi && form.bmi !== 0) {
            newErrors.bmi = "BMI is required";
        } else {
            const bmi = Number(form.bmi);
            if (bmi < 10 || bmi > 60) {
                newErrors.bmi = "BMI must be between 10 and 60";
            }
        }

        // === CHILDREN ===
        if (form.children === "" || form.children === null) {
            newErrors.children = "Number of children is required";
        } else {
            const children = Number(form.children);
            if (children < 0 || children > 10) {
                newErrors.children = "Must be between 0 and 10";
            }
        }

        // === GENDER ===
        if (!form.gender) newErrors.gender = "Gender is required";
        
        // === REGION ===
        if (!form.region) newErrors.region = "Region is required";

        setErrors(newErrors);

        // Form is valid if the errors object has no keys with truthy messages
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (loading) return;
        e.preventDefault();

        // Run validation rules
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setGlobalError("");

        try {
            const requestData = {
                age: Number(form.age),
                sex: form.gender === "male" ? 1 : 0,
                bmi: Number(form.bmi),
                children: Number(form.children),
                smoker: form.smoker ? 1 : 0,
                region: form.region,
                prediction_for: form.prediction_for,
                beneficiary_name: form.prediction_for === "other" ? form.beneficiary_name.trim() : null
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

            // Immediately redirect user to beautiful dashboard where their result sits
            navigate("/dashboard");

        } catch (err) {
            console.error("Prediction error:", err);
            setGlobalError(err.message || "Unable to calculate premium. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide" style={{ maxWidth: '1000px' }}>

                {/* Left Branding Panel */}
                <div className="auth-branding">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <Calculator size={28} />
                        </div>
                        <h2>AI Assessment</h2>
                        <p>
                            Our state-of-the-art machine learning model analyzes your demographics and lifestyle factors to accurately predict your optimal health insurance premium in real-time.
                        </p>
                        
                        <div className="brand-features">
                            <div className="brand-feature">
                                <span className="feature-dot"></span> Personalized Profiling
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot"></span> 100% Private & Secure
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot"></span> Instant Results
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="auth-form-panel" style={{ padding: '40px' }}>
                    <h2 className="auth-title">Calculate Premium</h2>
                    <p className="auth-subtitle">Provide your details to get an instant estimate.</p>

                    {/* HTTP/System errors */}
                    {globalError && (
                        <div className="pp-global-error">
                            <AlertCircle size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                            {globalError}
                        </div>
                    )}

                    <form className="pp-form" onSubmit={handleSubmit}>

                        {/* Prediction For */}
                        <div className="pp-group" style={{ gridColumn: 'span 2' }}>
                            <label>This prediction is for <span className="required-star">*</span></label>
                            <div className="pp-toggle-group">
                                <button
                                    type="button"
                                    className={`pp-toggle-btn ${form.prediction_for === 'self' ? 'pp-toggle-active' : ''}`}
                                    onClick={() => { setForm({ ...form, prediction_for: 'self', beneficiary_name: '' }); if (errors.beneficiary_name) setErrors({ ...errors, beneficiary_name: null }); }}
                                >
                                    <User size={16} />
                                    Myself
                                </button>
                                <button
                                    type="button"
                                    className={`pp-toggle-btn ${form.prediction_for === 'other' ? 'pp-toggle-active' : ''}`}
                                    onClick={() => setForm({ ...form, prediction_for: 'other' })}
                                >
                                    <Users size={16} />
                                    Someone Else
                                </button>
                            </div>
                        </div>

                        {/* Beneficiary Name (conditional) */}
                        {form.prediction_for === 'other' && (
                            <div className="pp-group pp-slide-in" style={{ gridColumn: 'span 2' }}>
                                <label>Beneficiary Name <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    name="beneficiary_name"
                                    className={errors.beneficiary_name ? 'input-error' : ''}
                                    placeholder="Enter the person's name"
                                    value={form.beneficiary_name}
                                    onChange={handleChange}
                                    maxLength={100}
                                />
                                {errors.beneficiary_name && (
                                    <span className="field-error-msg">
                                        <AlertCircle size={14} /> {errors.beneficiary_name}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Age */}
                        <div className="pp-group">
                            <label>Age <span className="required-star">*</span></label>
                            <input
                                type="number"
                                name="age"
                                className={errors.age ? "input-error" : ""}
                                placeholder="e.g., 34"
                                value={form.age}
                                onChange={handleChange}
                            />
                            {errors.age && (
                                <span className="field-error-msg">
                                    <AlertCircle size={14} /> {errors.age}
                                </span>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="pp-group">
                            <label>Gender <span className="required-star">*</span></label>
                            <select
                                name="gender"
                                className={errors.gender ? "input-error" : ""}
                                value={form.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            {errors.gender && (
                                <span className="field-error-msg">
                                    <AlertCircle size={14} /> {errors.gender}
                                </span>
                            )}
                        </div>

                        {/* BMI */}
                        <div className="pp-group">
                            <label>BMI (Body Mass Index) <span className="required-star">*</span></label>
                            <input
                                type="number"
                                name="bmi"
                                step="0.1"
                                className={errors.bmi ? "input-error" : ""}
                                placeholder="e.g., 24.5"
                                value={form.bmi}
                                onChange={handleChange}
                            />
                            {errors.bmi ? (
                                <span className="field-error-msg">
                                    <AlertCircle size={14} /> {errors.bmi}
                                </span>
                            ) : (
                                <small className="pp-hint">Normal range: 18.5 - 24.9</small>
                            )}
                        </div>

                        {/* Children */}
                        <div className="pp-group">
                            <label>Dependents <span className="required-star">*</span></label>
                            <input
                                type="number"
                                name="children"
                                className={errors.children ? "input-error" : ""}
                                placeholder="0"
                                value={form.children}
                                onChange={handleChange}
                            />
                            {errors.children && (
                                <span className="field-error-msg">
                                    <AlertCircle size={14} /> {errors.children}
                                </span>
                            )}
                        </div>

                        {/* Region */}
                        <div className="pp-group">
                            <label>Region <span className="required-star">*</span></label>
                            <select
                                name="region"
                                className={errors.region ? "input-error" : ""}
                                value={form.region}
                                onChange={handleChange}
                            >
                                <option value="">Select Region</option>
                                <option value="northeast">Northeast</option>
                                <option value="northwest">Northwest</option>
                                <option value="southeast">Southeast</option>
                                <option value="southwest">Southwest</option>
                            </select>
                            {errors.region && (
                                <span className="field-error-msg">
                                    <AlertCircle size={14} /> {errors.region}
                                </span>
                            )}
                        </div>

                        {/* Smoker */}
                        <div className="pp-group">
                            <div className="pp-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="smoker"
                                        checked={form.smoker}
                                        onChange={handleChange}
                                    />
                                    I am a smoker
                                </label>
                            </div>
                        </div>

                        {/* Button */}
                        <button type="submit" className="auth-submit" style={{ gridColumn: 'span 2', marginTop: '10px' }} disabled={loading}>
                            {loading ? "Calculating Premium..." : "Calculate Premium"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Predict;