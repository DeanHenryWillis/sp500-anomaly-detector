from datetime import date,timedelta 
from io import StringIO
import yfinance as yf
import pandas as pd 
import requests 

headers = {"User-Agent": "Mozilla/5.0"} 

def fetch_company_tickers(head):
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    response = requests.get(url,headers=head)
    html_stream = StringIO(response.text)
    tables = pd.read_html(html_stream)
    sp500_table = tables[0]
    return sp500_table
def batch_download(ticker_names):
    raw = yf.download(
        ticker_names,
        start=date.today() - timedelta(days=30), #go back for more accuracy, costs more.
        end = date.today(),
        group_by="ticker",
        auto_adjust=True,
        threads=True
    )
    return raw
def flatten(data):
    flat_df = data.stack(level=0, future_stack=True).reset_index()
    flat_df.rename(columns = {
        "Date":'date',
        "Ticker":'ticker',
        "Close":'close',
        "Volume":'volume',
    },
        inplace = True
    )
    flat_df = flat_df[["date", "ticker", "close", "volume"]]
    flat_df = flat_df.sort_values(by=["ticker", "date"]).reset_index(drop=True)
    flat_df["daily_return"] = flat_df.groupby("ticker")["close"].pct_change(fill_method=None)
    flat_df["daily_return"] = flat_df["daily_return"].round(3)
    return flat_df



def transfer_data_pipeline():
    # Fetch company tickers
    tickers = fetch_company_tickers(headers)
    ticker_list = tickers['Symbol'].str.replace('.','-',regex=False).tolist()
    # Batch download from ticker List
    raw_data = batch_download(ticker_list)
    # Flattening data
    return flatten(raw_data)






