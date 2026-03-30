

import pandas as pd

# 1. Load the datasets
df_diabetes = pd.read_csv('diabetes_012_health_indicators_BRFSS2015.csv')
df_heart = pd.read_csv('heart_disease_health_indicators_BRFSS2015.csv')

# 2. Alignment & Binary Conversion
df_diabetes.rename(columns={'Diabetes_012': 'Diabetes'}, inplace=True)
df_diabetes['Diabetes'] = df_diabetes['Diabetes'].replace({2: 1})

# 3. Merge both datasets
merged_df = pd.concat([df_diabetes, df_heart], ignore_index=True)

# 4. FIRST LEVEL: Remove exact duplicates across all columns
# This removes rows where every single survey answer is identical.
initial_rows = len(merged_df)
merged_df.drop_duplicates(inplace=True)
print(f"Level 1: Removed {initial_rows - len(merged_df)} exact duplicates.")

# 5. Drop Noisy/Redundant Columns (Systemic/Healthcare related)
# These columns don't help predict biological risk; they are "Noise".
cols_to_drop = [
    'CholCheck', 'AnyHealthcare', 'NoDocbcCost', 
    'GenHlth', 'MentHlth', 'PhysHlth', 'Stroke'
]
merged_df.drop(columns=cols_to_drop, inplace=True, errors='ignore')

# 6. Create the Target Variable (NCD_Risk)
merged_df['NCD_Risk'] = ((merged_df['Diabetes'] == 1) | (merged_df['HeartDiseaseorAttack'] == 1)).astype(int)

# 7. FEATURE ENGINEERING: Creating Smarter Indicators (PS7)
merged_df['Metabolic_Risk_Index'] = merged_df['BMI'] * merged_df['Age']
merged_df['Clinical_Burden'] = merged_df['HighBP'] + merged_df['HighChol']
merged_df['Healthy_Habits_Score'] = merged_df['PhysActivity'] + merged_df['Veggies']
merged_df['Unhealthy_Lifestyle_Index'] = merged_df['Smoker'] + merged_df['HvyAlcoholConsump'] + merged_df['HighBP']
merged_df['Physical_Mobility_Risk'] = merged_df['BMI'] * merged_df['DiffWalk']

# 8. SECOND LEVEL: Remove Redundancy based on Feature Set
# Now that we have only our features, many rows will look identical again.
# We keep only ONE unique instance of each "Risk Profile -> Outcome" mapping.
feature_set = [
    'HighBP', 'HighChol', 'BMI', 'Smoker', 'HeartDiseaseorAttack', 'PhysActivity', 
    'Fruits', 'Veggies', 'HvyAlcoholConsump', 'DiffWalk', 'Age', 'Education', 
    'Income', 'Diabetes', 'NCD_Risk', 'Metabolic_Risk_Index', 'Clinical_Burden', 
    'Healthy_Habits_Score', 'Unhealthy_Lifestyle_Index', 'Physical_Mobility_Risk'
]

rows_before_feature_drop = len(merged_df)
# merged_df.drop_duplicates(subset=feature_set, inplace=True)
print(f"Level 2: Skipping redundant profiles drop to maintain dataset size.")

# 9. Handle Conflicting Data (Crucial for AI Accuracy)
# If two rows have the EXACT same features but one says "Risk=1" and one says "Risk=0", 
# it confuses the model. We drop these conflicting "ambiguous" profiles.
# merged_df.drop_duplicates(subset=[c for c in feature_set if c != 'NCD_Risk'], keep=False, inplace=True)
print(f"Level 3: Skipping ambiguous row drop. Final row count: {len(merged_df)}")

# 10. Save the Highly-Cleaned & Engineered Dataset
merged_df.to_csv('ncd_dataset_final_clean.csv', index=False)

print("\n--- Final Dataset Summary ---")
print(f"Unique, Cleaned Rows: {len(merged_df)}")
print("Engineered Features: Metabolic_Risk_Index, Clinical_Burden, Healthy_Habits_Score, Unhealthy_Lifestyle_Index, Physical_Mobility_Risk")
print("Target Variable: NCD_Risk (1 if Diabetes or Heart Disease present)")