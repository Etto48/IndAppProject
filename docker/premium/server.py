import fastapi as f
from fastapi.responses import JSONResponse
import uvicorn
import os
import random

app = f.FastAPI()
PORT = int(os.getenv('PORT', 5432))


@app.get("/premium")
def get_premium_tier(request: f.Request, id: str):
    # Tier: 0 = Base, 1 = Plus, 2 = Ultra (con priorità a 0)
    tier = random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0]
    return JSONResponse(content={"id": id, "tier": tier})


if __name__ == "__main__":
    uvicorn.run(app, port=PORT, host="0.0.0.0")
