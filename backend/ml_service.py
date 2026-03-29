import joblib
import pandas as pd
import numpy as np
from config import Config

try:
    ml_model = joblib.load(Config.MODEL_PATH)
    print(f"ML model loaded from {Config.MODEL_PATH}")
except Exception as e:
    ml_model = None
    print(f"ML model not loaded ({e}) - fallback formula will be used")

def predict_premium_ml(age, sex, bmi, children, smoker, region):
    if ml_model is not None:
        region_northwest = (region == 'northwest')
        region_southeast = (region == 'southeast')
        region_southwest = (region == 'southwest')

        features = pd.DataFrame([{
            'age':              age,
            'sex':              sex,
            'bmi':              bmi,
            'children':         children,
            'smoker':           smoker,
            'region_northwest': region_northwest,
            'region_southeast': region_southeast,
            'region_southwest': region_southwest,
            'age_bmi':          float(age * bmi),
            'age_smoker':       int(age * smoker),
            'bmi_smoker':       float(bmi * smoker),
            'children_smoker':  int(children * smoker),
            'bmi_sq':           float(bmi ** 2),
            'age_sq':           int(age ** 2)
        }])

        if hasattr(ml_model, "feature_names_in_"):
            features = features[ml_model.feature_names_in_]

        log_pred = ml_model.predict(features)[0]
        return round(float(np.expm1(log_pred)), 2)

    print("Using fallback formula - model not loaded")
    if bmi < 18.5:    bmi_p = 1000
    elif bmi < 25:    bmi_p = 0
    elif bmi < 30:    bmi_p = 1500
    else:             bmi_p = 3000

    region_p = {'northeast': 0, 'northwest': 500, 'southeast': 1000, 'southwest': 1500}.get(region, 0)
    return round(3000 + age*250 + bmi_p + children*500 + (20000 if smoker else 0) + (500 if sex else 0) + region_p, 2)
