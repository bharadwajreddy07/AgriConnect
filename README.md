# AgriMart - Agricultural Marketplace Platform

A comprehensive full-stack MERN application connecting farmers, wholesalers, and consumers through a digital agricultural marketplace.

## 🌾 Features

### Multi-Role Portals
- **Farmer Portal**: List crops, manage sample requests, negotiate prices, track orders
- **Wholesaler Portal**: Browse seasonal crops, request samples, negotiate bulk orders
- **Consumer Portal**: Purchase fresh farm produce directly from farmers
- **Admin Portal**: Verify users, approve crops, view analytics and reports

### Core Functionality
- ✅ Seasonal crop intelligence (Kharif, Rabi, Zaid)
- ✅ Sample-based price negotiation
- ✅ Real-time chat and notifications (Socket.io)
- ✅ Order tracking and management
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ File upload for crop images
- ✅ Comprehensive analytics dashboard

## 🚀 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io for real-time features
- Multer for file uploads

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Socket.io-client
- React Toastify for notifications
- Vite for build tooling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AgriMart
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/agrimart
# JWT_SECRET=your_secret_key
# PORT=5000

# Start MongoDB (if running locally)
# mongod

# Start backend server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
AgriMart/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cropController.js
│   │   ├── sampleController.js
│   │   ├── negotiationController.js
│   │   ├── orderController.js
│   │   ├── chatController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Crop.js
│   │   ├── Sample.js
│   │   ├── Negotiation.js
│   │   ├── Order.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── sampleRoutes.js
│   │   ├── negotiationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── chatRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── farmer/
│   │   │   ├── wholesaler/
│   │   │   ├── consumer/
│   │   │   ├── admin/
│   │   │   ├── shared/
│   │   │   └── Home.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   └── cropData.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔑 Admin Account Setup

### Quick Access

**Admin Credentials:**
- Email: `superadmin@agrimart.com`
- Password: `Admin@2026`

**Login URLs:**
- Regular login: `http://localhost:3000/login`
- Admin login: `http://localhost:3000/admin/login`

### Creating the Admin Account

Run the admin creation script:

```bash
cd backend
node createAdmin.js
```

This will create the admin account with the credentials above.

> ⚠️ **Security Warning**: These are development credentials. Change them immediately in production!

For detailed admin documentation, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) and [ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md).

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Crops
- `GET /api/crops` - Get all crops (with filters)
- `POST /api/crops` - Create crop listing (Farmer)
- `GET /api/crops/:id` - Get crop details
- `PUT /api/crops/:id` - Update crop (Farmer)
- `DELETE /api/crops/:id` - Delete crop (Farmer)

### Samples
- `POST /api/samples/request` - Request sample (Wholesaler)
- `GET /api/samples/farmer` - Get farmer's samples
- `GET /api/samples/wholesaler` - Get wholesaler's samples
- `PUT /api/samples/:id/status` - Update sample status

### Negotiations
- `POST /api/negotiations` - Start negotiation (Wholesaler)
- `GET /api/negotiations` - Get user's negotiations
- `POST /api/negotiations/:id/offer` - Make price offer
- `PUT /api/negotiations/:id/accept` - Accept offer
- `PUT /api/negotiations/:id/reject` - Reject offer

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user's orders
- `PUT /api/orders/:id/status` - Update order status

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/verify` - Verify user
- `GET /api/admin/crops/pending` - Get pending crops
- `GET /api/admin/analytics` - Get platform analytics

## 🎨 Design Features

- Modern, premium agricultural theme
- Responsive design for all devices
- Glassmorphism effects
- Smooth animations and transitions
- Seasonal color coding (Kharif, Rabi, Zaid)
- Status badges and indicators

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- XSS protection

## 📊 Database Schema

### User
- Basic info (name, email, password, phone)
- Role (farmer, wholesaler, consumer, admin)
- Address and region
- Verification status

### Crop
- Farmer reference
- Crop details (name, category, season)
- Quantity and pricing
- Location (state, district, region)
- Quality grade and images
- Status (pending, approved, sold)

### Sample
- Crop and user references
- Requested quantity
- Delivery address
- Status tracking
- Quality evaluation

### Negotiation
- Crop and participants
- Offer history
- Current offer and status
- Final agreed price

### Order
- Buyer and seller references
- Crop and quantity
- Pricing and payment status
- Delivery tracking
- Order status history

## 🚧 Future Enhancements

- Payment gateway integration
- Mobile app (React Native)
- AI-based price prediction
- Weather integration
- Multi-language support
- Advanced analytics and reporting
- SMS notifications
- Logistics partner integration

## 📝 License

This project is licensed under the ISC License.

## 👥 Support

For support, email support@agrimart.com or create an issue in the repository.

## 🙏 Acknowledgments

- Built for connecting the agricultural ecosystem
- Inspired by the need for fair pricing and transparency in agriculture
- Designed to empower farmers and improve supply chain efficiency
#   A g r i C o n n e c t  
 