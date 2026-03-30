import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# 1. Setup Paths
# 1. Setup Paths correctly using commas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
DATA_PATH = os.path.join(PARENT_DIR, "data", "ncd_dataset_final_clean.csv")
MODEL_PATH = os.path.join(PARENT_DIR, "artifacts", "rf_model.joblib")

def train_model():
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: Data file not found at {DATA_PATH}")
        return

    print("🚀 Loading data...")
    df = pd.read_csv(DATA_PATH)

    # 2. Select the 10 features defined in your cleaning script
    features = [
        'HighBP', 'HighChol', 'BMI', 'Smoker', 'PhysActivity', 
        'Fruits', 'Veggies', 'HvyAlcoholConsump', 'DiffWalk', 'Age', 'Sex',
        'Education', 'Income', 'Metabolic_Risk_Index', 'Clinical_Burden', 
        'Healthy_Habits_Score', 'Unhealthy_Lifestyle_Index', 'Physical_Mobility_Risk',
    ]
    target = 'NCD_Risk'

    X = df[features]
    y = df[target]

    # 3. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Initialize and Train Random Forest
    print("🌲 Training Random Forest Model (this may take a minute)...")
    rf = RandomForestClassifier(
        n_estimators=300,        # More trees = more "votes" on complex patterns
        max_depth=12,            # Limit depth slightly to prevent the model from memorizing noise
        min_samples_leaf=10,     # Ensures each "leaf" has enough data to be statistically significant
        random_state=42, 
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = rf.predict(X_test)
    print(f"✅ Training Complete. Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # 6. Save the Model Artifact
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(rf, MODEL_PATH)
    print(f"📦 Model saved to: {MODEL_PATH}")

if __name__ == "__main__":
    train_model()