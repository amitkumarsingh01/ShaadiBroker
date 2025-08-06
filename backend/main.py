from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Shadi Broker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.shadi_broker
collection = db.profiles

# Razorpay configuration
razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID", "rzp_test_"), os.getenv("RAZORPAY_KEY_SECRET", ""))
)

# Pydantic models
class ProfileBase(BaseModel):
    full_name: str
    gender: str
    date_of_birth: str
    permanent_address: str
    pin_code: str
    taluk: str
    father_name: str
    mother_name: str
    education: str
    occupation: str
    caste: str
    complexion: str
    height: str
    weight: str
    siblings_count: str
    asset_details: str
    payment_utr: Optional[str] = None
    payment_status: bool = False

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class PaymentRequest(BaseModel):
    amount: int = 19900  # Amount in paise (199 rupees)
    currency: str = "INR"
    receipt: str = "shadi_broker_receipt"

class PaymentResponse(BaseModel):
    order_id: str
    amount: int
    currency: str

# API Routes
@app.get("/")
async def root():
    return {"message": "Shadi Broker API is running"}

@app.post("/profiles", response_model=Profile)
async def create_profile(profile: ProfileCreate):
    profile_data = profile.dict()
    profile_data["id"] = str(datetime.now().timestamp())
    profile_data["created_at"] = datetime.now()
    profile_data["updated_at"] = datetime.now()
    
    result = await collection.insert_one(profile_data)
    profile_data["_id"] = str(result.inserted_id)
    
    return Profile(**profile_data)

@app.get("/profiles", response_model=list[Profile])
async def get_profiles():
    profiles = []
    cursor = collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        profiles.append(Profile(**document))
    return profiles

@app.get("/profiles/{profile_id}", response_model=Profile)
async def get_profile(profile_id: str):
    profile = await collection.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile["_id"] = str(profile["_id"])
    return Profile(**profile)

@app.put("/profiles/{profile_id}", response_model=Profile)
async def update_profile(profile_id: str, profile: ProfileUpdate):
    profile_data = profile.dict()
    profile_data["updated_at"] = datetime.now()
    
    result = await collection.update_one(
        {"id": profile_id},
        {"$set": profile_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updated_profile = await collection.find_one({"id": profile_id})
    updated_profile["_id"] = str(updated_profile["_id"])
    return Profile(**updated_profile)

@app.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    result = await collection.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile deleted successfully"}

@app.post("/create-payment", response_model=PaymentResponse)
async def create_payment(payment_request: PaymentRequest):
    try:
        order_data = {
            "amount": payment_request.amount,
            "currency": payment_request.currency,
            "receipt": payment_request.receipt + "_" + str(datetime.now().timestamp())
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return PaymentResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")

@app.post("/verify-payment")
async def verify_payment(payment_id: str, order_id: str, signature: str):
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_payment_id": payment_id,
            "razorpay_order_id": order_id,
            "razorpay_signature": signature
        })
        return {"message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
 