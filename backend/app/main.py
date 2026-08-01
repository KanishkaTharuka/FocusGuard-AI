from fastapi import FastAPI

app = FastAPI(
    title="FocusGuard AI",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "FocusGuard AI Backend Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }