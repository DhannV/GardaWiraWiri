# MongoDB Setup Guide for MERN Stack

## Option 1: Local MongoDB Installation (Recommended for Development)

### Windows:

**Step 1: Download MongoDB Community Server**
- Visit: https://www.mongodb.com/try/download/community
- Download Windows MSI Installer
- Run the installer and follow the setup wizard

**Step 2: Install MongoDB Service**
- During installation, choose "Install MongoDB as a Windows Service"
- This will automatically start MongoDB on system startup

**Step 3: Verify Installation**
```bash
mongod --version
```

**Step 4: Start MongoDB Service**
```bash
# Windows - MongoDB should auto-start, or manually:
net start MongoDB

# Check if running:
mongo --version
```

**Step 5: Connect to MongoDB**
```bash
# Open MongoDB shell
mongosh
```

**Step 6: Create Database**
```bash
# In mongosh:
use gardawirawiri
db.createCollection("users")
db.users.insertOne({ name: "Test User", email: "test@example.com" })
```

---

## Option 2: MongoDB Cloud (Atlas) - Easy & Free

**Step 1: Create Account**
- Visit: https://www.mongodb.com/cloud/atlas
- Sign up with email/Google account

**Step 2: Create Cluster**
- Click "Create" -> Choose Free Tier (M0)
- Select region closest to you
- Click "Create Deployment"

**Step 3: Get Connection String**
- In Clusters page, click "Connect"
- Choose "Drivers" option
- Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gardawirawiri`)

**Step 4: Update .env File**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gardawirawiri
```

**Step 5: Add Database User**
- Go to "Database Access" in Atlas
- Click "Add New Database User"
- Set username and password
- Click "Add User"

---

## Setup .env File

Create `.env` file in `BE-GardaWiraWiri/` folder:

### Local MongoDB:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gardawirawiri
JWT_SECRET=your_super_secret_key_12345
NODE_ENV=development
```

### MongoDB Atlas (Cloud):
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gardawirawiri
JWT_SECRET=your_super_secret_key_12345
NODE_ENV=development
```

---

## Testing MongoDB Connection

**1. Check Backend Logs**
- Run: `npm run dev` in BE-GardaWiraWiri
- Look for: "MongoDB connected" message

**2. Use MongoDB Compass** (Visual Tool)
- Download: https://www.mongodb.com/products/compass
- Connect with your MONGODB_URI
- See databases and collections visually

**3. Test via API**
- Frontend test page checks your backend connection
- Go to: http://localhost:5173 (frontend)
- Click "Test Connection Again"

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB not found | Install MongoDB or use Atlas instead |
| Connection refused | Make sure MongoDB service is running |
| ECONNREFUSED | Check MONGODB_URI in .env file |
| Auth failed | Verify username/password in connection string |
| Port 5000 in use | Change PORT in .env or kill existing process |

---

## Next Steps

1. ✅ Set up MongoDB (local or Atlas)
2. ✅ Create `.env` file with connection string
3. ✅ Run backend: `npm run dev` (should show "MongoDB connected")
4. ✅ Run frontend: `npm run dev` in FE folder
5. ✅ Test on http://localhost:5173

Good to go! 🚀
