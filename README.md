# Shadi Broker - Matrimonial Information Center

A complete matrimonial information management system with English/Kannada language support, MongoDB database, FastAPI backend, and Next.js frontend with Razorpay payment integration.

## Features

- 🌐 **Bilingual Support**: English and Kannada language toggle
- 📝 **Comprehensive Form**: All required matrimonial information fields
- 💳 **Payment Integration**: Razorpay payment gateway (₹199 registration fee)
- 🗄️ **Database**: MongoDB with full CRUD operations
- 🔄 **RESTful API**: FastAPI backend with all HTTP methods (GET, POST, PUT, DELETE)
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Optimized for mobile devices

## Form Fields

1. **Personal Information**
   - Full Name
   - Gender (Male/Female)
   - Date of Birth
   - Height
   - Weight
   - Complexion

2. **Address Information**
   - Permanent Address
   - PIN Code/ZIP Code
   - Taluk

3. **Family Information**
   - Father's Name
   - Mother's Name
   - Number of Siblings
   - Caste

4. **Education & Occupation**
   - Education
   - Occupation
   - Asset Details

5. **Payment**
   - QR Code Payment (₹199)
   - UTR Number

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation
- **Razorpay**: Payment gateway
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Hook Form**: Form management
- **Axios**: HTTP client
- **Lucide React**: Icons
- **React Hot Toast**: Notifications

## Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB (local installation)
- Razorpay account (for payment integration)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ShadiBroker
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
MONGODB_URL=mongodb://localhost:27017" > .env

# Start MongoDB (if not running)
# Windows
net start MongoDB
# macOS
brew services start mongodb-community
# Linux
sudo systemctl start mongod

# Run the backend
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Profiles
- `GET /profiles` - Get all profiles
- `GET /profiles/{profile_id}` - Get specific profile
- `POST /profiles` - Create new profile
- `PUT /profiles/{profile_id}` - Update profile
- `DELETE /profiles/{profile_id}` - Delete profile

### Payment
- `POST /create-payment` - Create payment order
- `POST /verify-payment` - Verify payment signature

## Database Schema

```javascript
{
  id: String,
  full_name: String,
  gender: String,
  date_of_birth: String,
  permanent_address: String,
  pin_code: String,
  taluk: String,
  father_name: String,
  mother_name: String,
  education: String,
  occupation: String,
  caste: String,
  complexion: String,
  height: String,
  weight: String,
  siblings_count: String,
  asset_details: String,
  payment_utr: String,
  payment_status: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Environment Variables

### Backend (.env)
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
MONGODB_URL=mongodb://localhost:27017
```

## Usage

1. **Start the application**:
   - Backend: `cd backend && python main.py`
   - Frontend: `cd frontend && npm run dev`

2. **Access the application**:
   - Open `http://localhost:3000` in your browser

3. **Fill the form**:
   - Toggle between English and Kannada languages
   - Fill in all required fields
   - Complete the payment process
   - Submit the form

4. **View/Manage data**:
   - Use the API endpoints to view, update, or delete profiles
   - Access MongoDB directly to view stored data

## Payment Integration

The application includes a simulated Razorpay payment flow:

1. User clicks "Scan QR" button
2. Payment order is created via API
3. Payment is simulated (in real implementation, integrate Razorpay SDK)
4. User enters UTR number
5. Form can be submitted after payment completion

## Development

### Backend Development
```bash
cd backend
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 