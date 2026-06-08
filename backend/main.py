from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import pandas as pd
import json
import io


app = FastAPI(title="Anomaly Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     
    allow_credentials=True,
    allow_methods=["*"],     
    allow_headers=["*"],
)
JSON_FILE_PATH = "data/summaries.json"


@app.get("/anomalies")
def anomalies():
    with open(JSON_FILE_PATH,"r",encoding="utf-8") as f:
        data = json.load(f)
    return data


