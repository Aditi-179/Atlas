import os
import joblib
import pandas as pd

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data", "ncd_dataset_final_clean.csv")
MODEL_PATH = os.path.join(BASE_DIR, "../artifacts", "xgb_model.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "../artifacts", "xgb_columns.pkl")


# ---------------------------
# TRAIN + TEST
# ---------------------------
def train_xgboost():
    print("🚀 Training XGBoost...")

    df = pd.read_csv(DATA_PATH)
    features = [
        'HighBP', 'HighChol', 'BMI', 'Smoker', 'PhysActivity', 
        'Fruits', 'Veggies', 'HvyAlcoholConsump', 'DiffWalk', 'Age', 'Sex',
        'Education', 'Income', 'Metabolic_Risk_Index', 'Clinical_Burden', 
        'Healthy_Habits_Score', 'Unhealthy_Lifestyle_Index', 'Physical_Mobility_Risk'
    ]
    TARGET = 'NCD_Risk'

    X = df[features]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        eval_metric="logloss"
    )

    model.fit(X_train, y_train)

    # ✅ Train accuracy
    train_pred = model.predict(X_train)
    train_acc = accuracy_score(y_train, train_pred)

    # ✅ Test accuracy
    test_pred = model.predict(X_test)
    test_acc = accuracy_score(y_test, test_pred)

    print(f"📊 Train Accuracy: {train_acc}")
    print(f"📊 Test Accuracy: {test_acc}")

    # Save model + columns
    joblib.dump(model, MODEL_PATH)
    joblib.dump(list(X.columns), COLUMNS_PATH)

    print("💾 XGBoost model saved")

    return {
        "model": "XGBoost",
        "train_accuracy": float(train_acc),
        "test_accuracy": float(test_acc)
    }


# ---------------------------
# LOAD MODEL
# ---------------------------
def load_xgb_model():
    if not os.path.exists(MODEL_PATH):
        raise Exception("Model not trained. Run train_xgboost() first.")

    model = joblib.load(MODEL_PATH)
    columns = joblib.load(COLUMNS_PATH)

    return model, columns


# ---------------------------
# PREDICT WITH PROBABILITY
# ---------------------------
def predict_xgb(data: dict):
    model, columns = load_xgb_model()

    input_df = pd.DataFrame([data])
    input_df = pd.get_dummies(input_df)

    input_df = input_df.reindex(columns=columns, fill_value=0)

    # 🔥 THIS IS IMPORTANT (team head point)
    prob = model.predict_proba(input_df)[0][1]  # probability of class 1

    return {
        "risk_score": round(prob * 100, 2),   # e.g. 88%
        "probability": float(prob),
        "risk_level": get_risk_level(prob)
    }


# ---------------------------
# RISK LEVEL LOGIC
# ---------------------------
def get_risk_level(prob):
    if prob > 0.8:
        return "High"
    elif prob > 0.5:
        return "Medium"
    else:
        return "Low"

if __name__ == "__main__":
    train_xgboost()