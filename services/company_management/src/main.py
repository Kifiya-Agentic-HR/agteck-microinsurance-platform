from fastapi import FastAPI
from src.database.db import Base
from src.database.db import engine
from src.routes.insurance_company import router as insurance_comapany_router
from fastapi.middleware.cors import CORSMiddleware  


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insurance API")

origins = [
    "http://localhost:8001",      
    "http://localhost:8000",      
    "http://3.216.34.218",        
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(insurance_comapany_router, prefix="/companies", tags=["companies"])
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
