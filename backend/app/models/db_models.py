from datetime import datetime

def create_prediction_doc(input_data, output_data):
    return {
        "input": input_data,
        "output": output_data,
        "created_at": datetime.utcnow()
    }