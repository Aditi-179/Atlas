import os
import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

DATA_PATH = "app/data/ncd_dataset_final_clean.csv"
MODEL_PATH = "app/models/logistic_model.pkl"
COLUMNS_PATH = "app/models/columns.pkl"


# ---------------------------
# TRAIN + TEST (BACKEND ONLY)
# ---------------------------
from sklearn.metrics import accuracy_score


def train_and_evaluate():
    print("🚀 Training started...")

    df = pd.read_csv(DATA_PATH)
    df = df.dropna()
    df = pd.get_dummies(df, drop_first=True)

    TARGET = "Target_Diabetes"

    # Remove all target columns from features
    X = df.drop(["Target_Heart", "Target_Diabetes", "Target_General_NCD"], axis=1)
    y = df[TARGET]

    from sklearn.model_selection import train_test_split

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    # ✅ Train accuracy
    train_pred = model.predict(X_train)
    train_acc = accuracy_score(y_train, train_pred)

    # ✅ Test accuracy
    test_pred = model.predict(X_test)
    test_acc = accuracy_score(y_test, test_pred)

    print(f"📊 Train Accuracy: {train_acc}")
    print(f"📊 Test Accuracy: {test_acc}")

    # Save model
    joblib.dump(model, MODEL_PATH)
    joblib.dump(list(X.columns), COLUMNS_PATH)

    return {
        "train_accuracy": float(train_acc),
        "test_accuracy": float(test_acc)
    }


# ---------------------------
# LOAD MODEL (API USE)
# ---------------------------
def load_model():
    if not os.path.exists(MODEL_PATH):
        raise Exception("❌ Model not trained. Run training script first.")

    model = joblib.load(MODEL_PATH)
    columns = joblib.load(COLUMNS_PATH)

    return model, columns


# ---------------------------
# PREDICT (API ONLY)
# ---------------------------
def predict(data: dict):
    model, columns = load_model()

    input_df = pd.DataFrame([data])
    input_df = pd.get_dummies(input_df)

    input_df = input_df.reindex(columns=columns, fill_value=0)

    prediction = model.predict(input_df)[0]
    confidence = model.predict_proba(input_df)[0].max()

    return {
        "prediction": int(prediction),
        "confidence_score": float(confidence)
    }