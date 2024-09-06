from fastapi import FastAPI,APIRouter
from fastapi.middleware import cors
import realtimeinput

app = FastAPI()

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(realtimeinput.router)

