def retrieve_clinical_context(patient_data: dict) -> list[str]:
    """
    A lightweight, static RAG Retrieval Mechanism.
    In a full production scale, this would query a Vector Database (like FAISS/Chroma).
    For MVP, we use rule-based contextual injection of established medical guidelines.
    """
    context_chunks = []

    # 1. Obesity Context
    if patient_data.get('bmi', 0) >= 30:
        context_chunks.append(
            "[GUIDELINE - OBESITY]: Patients with a BMI >= 30 are at a significantly higher risk for Type 2 Diabetes and Cardiovascular diseases. "
            "First-line intervention requires a 5-10% weight loss target within 6 months via caloric deficit and a minimum of 150 minutes of moderate-intensity exercise weekly."
        )

    # 2. Hypertension Context
    if patient_data.get('high_bp', 0) == 1:
        context_chunks.append(
            "[GUIDELINE - HYPERTENSION]: Elevated blood pressure places extreme stress on arterial walls, exponentially increasing the risk of myocardial infarction (Heart Attack) and stroke. "
            "Recommend the DASH (Dietary Approaches to Stop Hypertension) diet, severe sodium restriction (<1,500 mg/day), and immediate clinical monitoring."
        )

    # 3. Cholesterol Context
    if patient_data.get('high_chol', 0) == 1:
        context_chunks.append(
            "[GUIDELINE - HYPERLIPIDEMIA]: High cholesterol directly clogs systemic arteries (atherosclerosis). "
            "Saturated fats must be replaced with polyunsaturated fats. Statins may be medically required. Increase soluble fiber intake."
        )

    # 4. Lifestyle & Smoking Context
    if patient_data.get('smoker', 0) == 1:
        context_chunks.append(
            "[GUIDELINE - SMOKING]: Combustible tobacco usage induces systemic inflammation and accelerates arterial plaque buildup. "
            "Immediate cessation is the single most impactful action the patient can take to lower their NCD risk."
        )

    if patient_data.get('phys_activity', 1) == 0:
        context_chunks.append(
            "[GUIDELINE - SEDENTARY]: Physical inactivity causes insulin resistance. "
            "Even light daily walking (20 minutes) profoundly improves metabolic insulin sensitivity and lowers baseline glucose."
        )

    # 5. Generic NCD Context
    if not context_chunks:
        context_chunks.append(
            "[GUIDELINE - GENERAL WELLNESS]: To maintain a healthy Non-Communicable Disease (NCD) footprint, CDC guidelines recommend "
            "a balanced diet rich in vegetables, consistent physical movement, and routine annual metabolic blood work."
        )

    return context_chunks
