import pandas as pd
import pickle
from faker import Faker
import os


# 1. Load your master data
# Taking a sample of 1000 for the demo dashboard
df = pd.read_csv('app/data/ncd_dataset_final_clean.csv').sample(1000, random_state=42)

# 2. THE HYBRID HACK: Generate Names, Phones, and Locations
Faker.seed(42) # Seed to ensure same names are generated for the frontend
fake = Faker()

df['Patient_ID'] = [f"PAT-{i+1:04d}" for i in range(len(df))]
df['Patient_Name'] = [fake.name() for _ in range(len(df))]
df['Phone_Number'] = [f"+91 {fake.msisdn()[3:]}" for _ in range(len(df))] 
df['City'] = [fake.city() for _ in range(len(df))]

# 3. LOAD THE UNIFIED XGBOOST MODEL & COLUMNS
# Assuming files are in the 'models' folder
model_path = 'app/models/artifacts/xgb_model.pkl'
columns_path = 'app/models/artifacts/xgb_columns.pkl'

with open(model_path, 'rb') as f:
    xgb_model = pickle.load(f)

with open(columns_path, 'rb') as f:
    trained_columns = pickle.load(f)

# 4. ALIGN DATA & CALCULATE RISK
# We use the 'trained_columns' list to ensure X matches the model perfectly
X = df[trained_columns]

# Calculate Overall NCD Risk probability (0-100 scale)
# predict_proba returns [prob_of_0, prob_of_1] -> we take index 1
df['Overall_NCD_Risk'] = (xgb_model.predict_proba(X)[:, 1] * 100).round(1)

# 5. UI ENHANCEMENTS: Map Age and Gender for Next.js Display
def map_age(val):
    age_map = {
        1: "18-24", 2: "25-29", 3: "30-34", 4: "35-39", 5: "40-44",
        6: "45-49", 7: "50-54", 8: "55-59", 9: "60-64", 10: "65-69",
        11: "70-74", 12: "75-79", 13: "80+"
    }
    return age_map.get(val, "Unknown")

# Create readable columns for the frontend
if 'Age' in df.columns:
    df['Age_Group'] = df['Age'].apply(map_age)

if 'Sex' in df.columns:
    df['Gender'] = df['Sex'].map({0: "Female", 1: "Male"})

# 6. Save final demo CSV
# Ensure it goes to the app/data folder the backend expects
df.to_csv('app/data/ui_final_demo_data.csv', index=False)

print("✅ Success! 'ui_final_demo_data.csv' is ready for your Next.js frontend.")
print(f"Features used by model: {trained_columns}")
print(f"Sample Risk Score: {df['Overall_NCD_Risk'].iloc[0]}%")