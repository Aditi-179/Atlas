import pandas as pd

# 1. Load BOTH raw datasets
df_dia_raw = pd.read_csv('diabetes_012_health_indicators_BRFSS2015.csv')
df_hrt_raw = pd.read_csv('heart_disease_health_indicators_BRFSS2015.csv')

# 2. Define our Feature Groups (PS7 Requirements)
# These are common to both files
features = [
    'HighBP', 'HighChol', 'BMI', 'DiffWalk',      # Clinical
    'Smoker', 'PhysActivity', 'Veggies', 'HvyAlcoholConsump', # Behavioral
    'Income', 'Education'                         # Social
]

# 3. Process the Diabetes File
# Target: Diabetes_012 (0=no, 1=pre, 2=diabetic)
# We also keep HeartDiseaseorAttack if it exists there
cols_dia = features + ['Diabetes_012', 'HeartDiseaseorAttack']
df_dia = df_dia_raw[cols_dia].copy()
df_dia['Target_Diabetes'] = df_dia['Diabetes_012'].replace({2: 1}) # 0=no, 1=risk
df_dia.rename(columns={'HeartDiseaseorAttack': 'Target_Heart'}, inplace=True)
df_dia.drop(columns=['Diabetes_012'], inplace=True)

# 4. Process the Heart Disease File
# Target: HeartDiseaseorAttack (0/1)
# We also keep Diabetes if it exists there
cols_hrt = features + ['HeartDiseaseorAttack', 'Diabetes']
df_hrt = df_hrt_raw[cols_hrt].copy()
df_hrt.rename(columns={'HeartDiseaseorAttack': 'Target_Heart', 'Diabetes': 'Target_Diabetes'}, inplace=True)
# Ensure Target_Diabetes here is also binary (0/1)
df_hrt['Target_Diabetes'] = df_hrt['Target_Diabetes'].replace({2: 1})

# 5. MERGE: Stack them on top of each other
# Since they have the same column names now, they will align perfectly
master_df = pd.concat([df_dia, df_hrt], axis=0, ignore_index=True)

# 6. CLEANING: Remove exact duplicates
# (Very important because the two files often contain the same survey respondents)
initial_count = len(master_df)
master_df.drop_duplicates(inplace=True)
final_count = len(master_df)

# 7. Create the "General NCD Risk" Target (For your 3rd model)
# If they have either, risk = 1
master_df['Target_General_NCD'] = ((master_df['Target_Diabetes'] == 1) | (master_df['Target_Heart'] == 1)).astype(int)

# 8. Final Check for NaN (Empty) values
master_df.dropna(inplace=True)

# 9. Save the Master File
master_df.to_csv('master_ncd_data.csv', index=False)

print(f"Merge Complete!")
print(f"Rows before duplicate removal: {initial_count}")
print(f"Rows after duplicate removal: {final_count}")
print(f"Columns available: {list(master_df.columns)}")