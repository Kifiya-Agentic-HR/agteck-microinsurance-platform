# src/database/crud/insurance_company_crud.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from src.database.models.insurance_company import InsuranceCompany, CompanyStatus
from src.schemas.insurance_company_schema import InsuranceCompanyCreate, InsuranceCompanyUpdate

class InsuranceCompanyService:
    def __init__(self, db: Session):
        self.db = db

    def create_company(self, company: InsuranceCompanyCreate):
        # Validate required non-empty fields
        if not company.name.strip():
            raise HTTPException(status_code=400, detail="Company name cannot be empty")
        if not company.email.strip():
            raise HTTPException(status_code=400, detail="Email cannot be empty")
        if not company.phoneNo.strip():
            raise HTTPException(status_code=400, detail="Phone number cannot be empty")
        if not company.licenseNo.strip():
            raise HTTPException(status_code=400, detail="License number cannot be empty")
        if not company.licensedBy.strip():
            raise HTTPException(status_code=400, detail="LicensedBy field cannot be empty")

        # Check for duplicate email
        duplicate_email = self.db.query(InsuranceCompany).filter(
            InsuranceCompany.email == company.email
        ).first()
        if duplicate_email:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check for duplicate phone number
        duplicate_phone = self.db.query(InsuranceCompany).filter(
            InsuranceCompany.phoneNo == company.phoneNo
        ).first()
        if duplicate_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")

        # Create new instance from received data
        db_company = InsuranceCompany(
            name=company.name,
            licenseNo=company.licenseNo,
            licensedBy=company.licensedBy,
            operationDate=company.operationDate,
            capital=company.capital,
            country=company.country,
            city=company.city,
            phoneNo=company.phoneNo,
            postalCode=company.postalCode,
            email=company.email,
            status=company.status,
        )
        self.db.add(db_company)
        self.db.commit()
        self.db.refresh(db_company)
        return db_company

    def get_company(self, company_id: int):
        return self.db.query(InsuranceCompany).filter(InsuranceCompany.id == company_id).first()

    def get_companies(self, skip: int = 0, limit: int = 10):
        return self.db.query(InsuranceCompany).offset(skip).limit(limit).all()

    def update_company(self, company_id: int, company_update: InsuranceCompanyUpdate):
        db_company = self.db.query(InsuranceCompany).filter(InsuranceCompany.id == company_id).first()
        if not db_company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        update_data = company_update.dict(exclude_unset=True)

        # If updating email, validate it isn't empty and not already used by another company.
        if "email" in update_data:
            new_email = update_data["email"]
            if not new_email.strip():
                raise HTTPException(status_code=400, detail="Email cannot be empty")
            duplicate_email = self.db.query(InsuranceCompany).filter(
                InsuranceCompany.email == new_email,
                InsuranceCompany.id != company_id
            ).first()
            if duplicate_email:
                raise HTTPException(status_code=400, detail="Email already registered")

        # If updating phoneNo, validate it isn't empty and not already used by another company.
        if "phoneNo" in update_data:
            new_phone = update_data["phoneNo"]
            if not new_phone.strip():
                raise HTTPException(status_code=400, detail="Phone number cannot be empty")
            duplicate_phone = self.db.query(InsuranceCompany).filter(
                InsuranceCompany.phoneNo == new_phone,
                InsuranceCompany.id != company_id
            ).first()
            if duplicate_phone:
                raise HTTPException(status_code=400, detail="Phone number already registered")

        # Optional: Check for other fields (e.g., licenseNo) if needed

        # Update all provided fields
        for key, value in update_data.items():
            setattr(db_company, key, value)
        
        self.db.commit()
        self.db.refresh(db_company)
        return db_company
