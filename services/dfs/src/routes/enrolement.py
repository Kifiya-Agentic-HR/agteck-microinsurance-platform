import logging
import asyncio
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.crud.enrolement_crud import EnrolementService
from src.database.crud.customer_crud import CustomerService
from src.schemas.enrolement_schema import EnrolementRequest, EnrolementResponse, CustomerResponse
from src.schemas.customer_schema import CustomerRequest
from src.database.db import get_db
from src.core.config import settings
from src.utils.grid_and_zone_getter import GridAndZoneGetter
from src.utils.payout_calculator import fetch_and_update_payout_rate
from src.database.models.customer import Customer

POLICY_SERVICE_URL = settings.POLICY_SERVICE_URL + '/api'

router = APIRouter()
grid_zone_getter = GridAndZoneGetter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def build_customer_response(db_customer: Customer, db: Session) -> CustomerResponse:
    payout_rate = await fetch_and_update_payout_rate(db_customer.customer_id, db)
    return CustomerResponse(
        customer_id=db_customer.customer_id,
        f_name=db_customer.f_name,
        m_name=db_customer.m_name,
        l_name=db_customer.l_name,
        account_no=db_customer.account_no,
        account_type=db_customer.account_type,
        payout_rate=payout_rate,
    )


@router.post("/", response_model=EnrolementResponse, status_code=201)
def create_enrolement(
    enrolement: EnrolementRequest,
    db: Session = Depends(get_db),
):
    logger.info(">>> Incoming Enrollment Request")
    logger.info(f"Payload: {enrolement.dict()}")

    service = EnrolementService(db)
    customer_service = CustomerService(db)

    try:
        # 1) Validate coordinates
        if enrolement.latitude is None or enrolement.longitude is None:
            logger.error("latitude or longitude is missing.")
            raise HTTPException(status_code=400, detail="latitude or longitude is required.")

        logger.info(f"Validated coordinates: lat={enrolement.latitude}, lon={enrolement.longitude}")

        # 2) Create customer
        customer_req = CustomerRequest(
            f_name=enrolement.f_name,
            m_name=enrolement.m_name,
            l_name=enrolement.l_name,
            account_no=enrolement.account_no,
            account_type=enrolement.account_type,
        )

        logger.info("Creating customer record...")
        customer_id = customer_service.create_customer(customer_req)
        logger.info(f"Customer created successfully with ID: {customer_id}")

        # 3) Grid and zone lookup
        logger.info("Calling GridAndZoneGetter to fetch grid and zone...")
        try:
            grid, cps_zone = grid_zone_getter.get_grid_and_zone_inference_filtered(
                enrolement.latitude, enrolement.longitude
            )
            logger.info(f"Received GRID: {grid}, CPS_ZONE: {cps_zone}")
        except Exception as e:
            logger.exception("Grid and zone lookup failed.")
            raise HTTPException(status_code=400, detail=f"Grid/Zone error: {str(e)}")

        enrolement.cps_zone = cps_zone
        enrolement.grid = grid

    except HTTPException as e:
        logger.error(f"Handled HTTPException: {e.detail}")
        raise
    except ValueError as e:
        logger.error(f"Handled ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unhandled exception during enrollment setup.")
        raise HTTPException(status_code=500, detail="Internal server error")

    # 4) Create enrollment
    logger.info("Creating enrollment record...")
    try:
        enroll_json = service.create_enrolement(enrolement, customer_id)
        enroll_id = enroll_json["enrolement_id"]
        created_at = enroll_json["createdAt"]
        logger.info(f"Enrollment created: ID={enroll_id}, createdAt={created_at}")
    except Exception as e:
        logger.exception("Failed to create enrollment record.")
        raise HTTPException(status_code=500, detail="Enrollment creation failed")

    # 5) Prepare customer response
    db_customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    payout_rate = asyncio.run(fetch_and_update_payout_rate(db_customer.customer_id, db))

    customer_response = CustomerResponse(
        customer_id=customer_id,
        f_name=enrolement.f_name,
        m_name=enrolement.m_name,
        l_name=enrolement.l_name,
        account_no=enrolement.account_no,
        account_type=enrolement.account_type,
        payout_rate=payout_rate,
    ).dict()

    # 6) Return enrollment response
    logger.info(f"Final enrollment response for customer_id {customer_id}")

    response = EnrolementResponse(
        enrolement_id=enroll_id,
        customer_id=customer_id,
        customer=customer_response,
        createdAt=created_at,
        user_id=enrolement.user_id,
        status="pending",
        ic_company_id=enrolement.ic_company_id,
        branch_id=enrolement.branch_id,
        premium=enrolement.premium,
        sum_insured=enrolement.sum_insured,
        date_from=enrolement.date_from,
        date_to=enrolement.date_to,
        receipt_no=enrolement.receipt_no,
        product_id=enrolement.product_id,
        cps_zone=enrolement.cps_zone,
        grid=enrolement.grid,
        latitude=enrolement.latitude,
        longitude=enrolement.longitude,
    )

    logger.info(f"Final enrollment response: {response.dict()}")
    return response


@router.get("/{enrollment_id}", response_model=EnrolementResponse)
async def read_enrolement(enrollment_id: int, db: Session = Depends(get_db)):
    service = EnrolementService(db)
    db_enr = service.get_enrolement(enrollment_id)
    if not db_enr:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
    customer = await build_customer_response(db_customer, db)

    return EnrolementResponse(
        enrolement_id=db_enr.enrolment_id,
        customer_id=db_enr.customer_id,
        customer=customer,
        createdAt=db_enr.createdAt,
        user_id=db_enr.user_id,
        status=db_enr.status,
        ic_company_id=db_enr.ic_company_id,
        branch_id=db_enr.branch_id,
        premium=db_enr.premium,
        sum_insured=db_enr.sum_insured,
        date_from=db_enr.date_from,
        date_to=db_enr.date_to,
        receipt_no=db_enr.receipt_no,
        product_id=db_enr.product_id,
        cps_zone=db_enr.cps_zone,
        grid=db_enr.grid,
        latitude=db_enr.latitude,
        longitude=db_enr.longitude,
        payout_rate=customer.payout_rate
        )


@router.get("/by-company/{company_id}", response_model=list[EnrolementResponse])
def get_enrollments_by_company_id(
    company_id: int,
    db: Session = Depends(get_db),
):
    service = EnrolementService(db)
    enrollments = service.get_enrolements_by_company_id(company_id)
    result = []
    for db_enr in enrollments:
        db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
        customer = asyncio.run(build_customer_response(db_customer, db))
        enrol = EnrolementResponse(
            enrolement_id=db_enr.enrolment_id,
            customer_id=db_enr.customer_id,
            customer=customer,
            createdAt=db_enr.createdAt,
            user_id=db_enr.user_id,
            status=db_enr.status,
            ic_company_id=db_enr.ic_company_id,
            branch_id=db_enr.branch_id,
            premium=db_enr.premium,
            sum_insured=db_enr.sum_insured,
            date_from=db_enr.date_from,
            date_to=db_enr.date_to,
            receipt_no=db_enr.receipt_no,
            product_id=db_enr.product_id,
            cps_zone=db_enr.cps_zone,
            grid=db_enr.grid,
            latitude=db_enr.latitude,
            longitude=db_enr.longitude,
            payout_rate=customer.payout_rate
        )
        result.append(enrol)
    return result

@router.get("/by-user/{user_id}", response_model=list[EnrolementResponse])
def get_enrollments_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    service = EnrolementService(db)
    enrollments = service.get_enrolements_by_user_id(user_id)
    result = []
    for db_enr in enrollments:
        db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
        customer = asyncio.run(build_customer_response(db_customer, db))
        enrol = EnrolementResponse(
            enrolement_id=db_enr.enrolment_id,
            customer_id=db_enr.customer_id,
            customer=customer,
            createdAt=db_enr.createdAt,
            user_id=db_enr.user_id,
            status=db_enr.status,
            ic_company_id=db_enr.ic_company_id,
            branch_id=db_enr.branch_id,
            premium=db_enr.premium,
            sum_insured=db_enr.sum_insured,
            date_from=db_enr.date_from,
            date_to=db_enr.date_to,
            receipt_no=db_enr.receipt_no,
            product_id=db_enr.product_id,
            cps_zone=db_enr.cps_zone,
            grid=db_enr.grid,
            latitude=db_enr.latitude,
            longitude=db_enr.longitude,
            payout_rate=customer.payout_rate
        )
        result.append(enrol)
    return result

@router.get("/", response_model=list[EnrolementResponse])
def list_enrolements(
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    enrollments = service.get_enrolements()
    result = []
    for db_enr in enrollments:
        db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
        customer = asyncio.run(build_customer_response(db_customer, db))
        enrol = EnrolementResponse(
            enrolement_id=db_enr.enrolment_id,
            customer_id=db_enr.customer_id,
            customer=customer,
            createdAt=db_enr.createdAt,
            user_id=db_enr.user_id,
            status=db_enr.status,
            ic_company_id=db_enr.ic_company_id,
            branch_id=db_enr.branch_id,
            premium=db_enr.premium,
            sum_insured=db_enr.sum_insured,
            date_from=db_enr.date_from,
            date_to=db_enr.date_to,
            receipt_no=db_enr.receipt_no,
            product_id=db_enr.product_id,
            cps_zone=db_enr.cps_zone,
            grid=db_enr.grid,
            latitude=db_enr.latitude,
            longitude=db_enr.longitude,
            payout_rate=customer.payout_rate
        )
        result.append(enrol)
    return result

@router.put("/{enrollment_id}/approve")
async def approve_enrolement(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    
    try:
        result = service.approve_enrolement(enrollment_id)
    except HTTPException as e:
        raise e

    if not result:
        raise HTTPException(status_code=400, detail="Enrollment approval failed")

    url = f"{POLICY_SERVICE_URL}/policy"
    payload = {"enrollment_id": enrollment_id}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
        return {
            "success": True,
            "message": f"Enrollment for {enrollment_id} approved and policy created successfully",
            "data": result  # Ensure result is serializable
        }
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Policy service request failed: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"Policy service error: {e}")



@router.put("/{enrollment_id}/reject")
def reject_enrolement(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    try:
        return service.reject_enrolement(enrollment_id)
    except HTTPException as e:
        raise e
    