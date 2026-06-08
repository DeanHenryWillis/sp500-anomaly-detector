from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from pipeline import transfer_data_pipeline
import yfinance as yf
import pandas as pd
import numpy as np

def z_score(df):
    #daily return 
    df['ticker_std'] = df.groupby('ticker')['daily_return'].transform('std')
    df['ticker_mean'] = df.groupby('ticker')['daily_return'].transform('mean')
    df['return_zscore'] = (df['daily_return'] - df['ticker_mean']) / df['ticker_std']
    #volume 
    df['volume_std'] = df.groupby('ticker')['volume'].transform('std')
    df['volume_mean'] = df.groupby('ticker')['volume'].transform('mean')
    df['volume_zscore'] = (df['volume'] - df['volume_mean']) / df['volume_std']
    #anomaly
    df['anomaly'] = (df['return_zscore'].abs() >3) | (df['volume_zscore'].abs() >3)
    #frame
    df = df[["date", "ticker", "close", "volume",'daily_return','return_zscore','volume_zscore','anomaly']]
    return df
def isolation_forest(data_frame):
    df_copy = data_frame.dropna(subset=['daily_return','volume_zscore']).copy()
    analyze = ['daily_return','volume_zscore']
    data = df_copy[analyze]
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)
    model = IsolationForest(contamination=0.01, random_state=42)
    predict = model.fit_predict(data_scaled)
    df_copy['iforest'] = predict == -1
    data_frame['iforest'] = False
    data_frame.loc[df_copy.index, 'iforest'] = df_copy['iforest']
    data_frame['high_confidence'] = data_frame['anomaly'] & data_frame['iforest']
    return data_frame

def transfer_anomalies():
    #z_score
    df = z_score(transfer_data_pipeline())
    #isolation_forest
    df = isolation_forest(df)
    return df





