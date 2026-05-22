# Garda Wira Wiri - Backend (MERN Stack)

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Configure `.env` with your settings:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gardawirawiri
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Running the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### Project Structure

```
BE-GardaWiraWiri/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore file
├── models/            # Mongoose schemas
├── routes/            # API routes
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
└── README.md          # This file
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-Origin Resource Sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Request validation
- **multer**: File upload handling
- **dotenv**: Environment variables
- **nodemon**: Development tool for auto-restart

## API Endpoints

- `GET /api/health` - Health check endpoint

Add more routes as needed in the `routes/` folder.
