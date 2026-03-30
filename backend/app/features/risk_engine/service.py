from app.models.logistic import predict

def get_risk_prediction(data: dict):
    return predict(data)