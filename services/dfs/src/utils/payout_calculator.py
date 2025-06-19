import httpx
from sqlalchemy.orm import Session
from src.database.models.customer import Customer

CLAIM_SERVICE_URL = "http://claim_service:8000/api/v1/claim/claims/by-customer"

async def fetch_and_update_payout_rate(customer_id: int, db: Session) -> float:
    url = f"{CLAIM_SERVICE_URL}/{customer_id}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 404:
                print(f"No claims found for customer_id {customer_id}")
                return 0.0

            claim_amounts = response.json()
            if not isinstance(claim_amounts, list) or not claim_amounts:
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
