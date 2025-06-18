import httpx
from sqlalchemy.orm import Session
from src.database.models.customer import Customer

CLAIM_SERVICE_URL = "http://claim_service:8000/api/v1/claim/claims/by-customer/{customer_id}"  # Update to real URL

async def fetch_and_update_payout_rate(customer_id: int, db: Session) -> float:
    url = f"{CLAIM_SERVICE_URL}/{customer_id}"
    
    try:
        response = await httpx.get(url)
        response.raise_for_status()
        claim_amounts = response.json()
        if not claim_amounts or len(claim_amounts) == 0:
            return 0.0

        payout = sum(claim_amounts) / len(claim_amounts)
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if customer:
            customer.payout_rate = payout
            db.commit()
            db.refresh(customer)
        return payout

    except Exception as e:
        print(f"Failed to fetch or update payout rate: {e}")
        return 0.0
