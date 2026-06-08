from anomaly_detection import transfer_anomalies
from newsapi import NewsApiClient
from dotenv import load_dotenv
from tqdm import tqdm
import pandas as pd
import anthropic
import time
import os

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))

def send(data_frame):
    df_send = data_frame[data_frame['high_confidence']==True].copy()
    df_send['max_z_score'] = df_send[['return_zscore','volume_zscore']].abs().max(axis=1)
    max_z_score = df_send.groupby('ticker')['max_z_score'].idxmax()
    sending = df_send.loc[max_z_score].copy()
    sending = sending[["date", "ticker", "close", "daily_return", "return_zscore", "volume_zscore"]]
    return sending
def get_news(ticker, date):
    articles = newsapi.get_everything(
        q=ticker,
        from_param=str(date),
        to=str(date),
        language='en',
        sort_by='relevancy',
        page_size=3
    )
    headlines = [a['title'] for a in articles['articles']]
    return " | ".join(headlines) if headlines else "No news found"
def get_summaries(df):
    summaries = []
    for _, row in tqdm(df.iterrows(), total=len(df)):
        headlines = get_news(row['ticker'], pd.Timestamp(row['date']).strftime('%Y-%m-%dT00:00:00'))
        prompt = f"""
        Stock: {row['ticker']}
        Date: {row['date']}
        Daily Return: {row['daily_return']:.1%}
        Return Z-Score: {row['return_zscore']:.2f}
        Volume Z-Score: {row['volume_zscore']:.2f}
        News headlines: {headlines}
        
        In 2-3 sentences explain what likely caused this anomaly based on the headlines.
        """
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        summaries.append({
            "ticker": row['ticker'],
            "date": row['date'],
            "daily_return": row['daily_return'],
            "return_zscore": row['return_zscore'],
            "volume_zscore": row['volume_zscore'],
            "summary": response.content[0].text
        })
        time.sleep(1)
    return pd.DataFrame(summaries)

df = transfer_anomalies()
send_to_client = send(df)
result = get_summaries(send_to_client)
result.to_csv("backend/data/summaries.csv", index=False)
result.to_json('backend/data/summaries.json', orient='records', indent=4)
