import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Predict.css";

function Predict() {
    const navigate = useNavigate();
    const email = localStorage.getItem("userEmail");

    const [form, setForm] = useState({
        age: "",
        gender: "male",
        bmi: "",
        children: 0,
        smoker: false,
        region: "north",
        pre_existing_diseases: false,
        annual_income: ""
    });

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/signin");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/predict-premium", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    age: Number(form.age),
                    bmi: Number(form.bmi),
                    children: Number(form.children),
                    annual_income: Number(form.annual_income),
                    email
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Predicted Insurance Premium: ₹${data.predicted_premium}`);
                navigate("/dashboard");
            } else {
                alert("Failed to calculate premium");
            }
        } catch (error) {
            alert("Server error. Please try again.");
        }
    };

    return (
        <div className="predict-page">
            <form className="predict-form" onSubmit={handleSubmit}>
                <h2>Predict Insurance Premium</h2>

                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                    required
                />

                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

                <input
                    type="number"
                    step="0.1"
                    name="bmi"
                    placeholder="BMI"
                    value={form.bmi}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="children"
                    placeholder="Number of Children"
                    value={form.children}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="annual_income"
                    placeholder="Annual Income"
                    value={form.annual_income}
                    onChange={handleChange}
                    required
                />

                <label>
                    <input
                        type="checkbox"
                        name="smoker"
                        checked={form.smoker}
                        onChange={handleChange}
                    />
                    Smoker
                </label>

                <label>
                    <input
                        type="checkbox"
                        name="pre_existing_diseases"
                        checked={form.pre_existing_diseases}
                        onChange={handleChange}
                    />
                    Pre-existing Diseases
                </label>

                <button type="submit">
                    Calculate Premium
                </button>
            </form>
        </div>
    );
}

export default Predict;
