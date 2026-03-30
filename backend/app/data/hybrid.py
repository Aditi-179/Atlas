import pandas as pd
import pickle
from faker import Faker

fake = Faker()

# 1. Load your master data and take a sample (e.g., 1000 rows) for the demo
df = pd.read_csv('data/master_ncd_data.csv').sample(1000, random_state=42)

# 2. THE 5-LINE HYBRID HACK: Generate Names, Phones, and Locations
df['Patient_Name'] = [fake.name() for _ in range(len(df))]
df['Phone_Number'] = [f"+91 {fake.msisdn()[3:]}" for _ in range(len(df))] # Indian-style numbers
df['City'] = [fake.city() for _ in range(len(df))]

# 3. ATTACH THE AI SCORES: Load your models and calculate risk
# (Replace these filenames with your actual .pkl names)
dia_model = pickle.load(open('models/diabetes_model.pkl', 'rb'))
hrt_model = pickle.load(open('models/heart_model.pkl', 'rb'))
gen_model = pickle.load(open('models/general_ncd_model.pkl', 'rb'))

# Select only the features the models were trained on (X)
features = ['HighBP', 'HighChol', 'BMI', 'DiffWalk', 'Smoker', 'PhysActivity', 'Veggies', 'HvyAlcoholConsump', 'Income', 'Education']
X = df[features]

# Add the real AI risk probabilities to the CSV
df['Diabetes_Risk'] = (dia_model.predict_proba(X)[:, 1] * 100).round(1)
df['Heart_Risk'] = (hrt_model.predict_proba(X)[:, 1] * 100).round(1)
df['Overall_NCD_Risk'] = (gen_model.predict_proba(X)[:, 1] * 100).round(1)

# 4. Save this specifically for your UI/Frontend
df.to_csv('data/ui_final_demo_data.csv', index=False)

print("Done! 'ui_final_demo_data.csv' is ready for your Streamlit UI.")