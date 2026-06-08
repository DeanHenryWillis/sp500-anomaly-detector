# sp500-anomaly-detector
Using AI for stock analysis.

Anomaly detection across S&P 500 companies using Z-Score and 
Isolation Forest, along with AI-generated summaries explaining each anomaly.

## Stack
- Python, pandas, yfinance, scikit-learn
- FastAPI
- React
- Claude AI (Anthropic)

## How it works
1. Pulls 90 days of price and volume data for all 500 S&P 500 constituents
2. Flags statistically anomalous days using Z-Score (|z| > 3) and Isolation Forest
3. High confidence anomalies flagged where statistical anomalies are true
4. Claude AI generates summaries explaining each anomaly using recent news
