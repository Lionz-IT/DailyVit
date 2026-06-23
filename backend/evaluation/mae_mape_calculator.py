import pandas as pd
import numpy as np

def calculate_metrics(y_true, y_pred):
    """
    Calculate Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE).
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    mae = np.mean(np.abs(y_true - y_pred))
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    
    return mae, mape

if __name__ == "__main__":
    # Example usage
    data = {
        'actual': [7000, 8000, 7500, 9000, 8500],
        'predicted': [7350, 8400, 7875, 9450, 8925]
    }
    df = pd.DataFrame(data)
    
    mae, mape = calculate_metrics(df['actual'], df['predicted'])
    print(f"MAE: {mae:.2f}")
    print(f"MAPE: {mape:.2f}%")
