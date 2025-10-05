# Backend Server Startup Guide

## Quick Start
To start the backend server and resolve console errors:

```powershell
cd backend
npm start
```

The server will start on `http://localhost:5000`

## Verify Backend Status
Once started, you can verify the backend is running by:

1. **Browser**: Go to `http://localhost:5000/api/auth/status`
2. **Admin Dashboard**: The status banner will show "Online" in green
3. **Console**: No more ERR_CONNECTION_REFUSED errors

## Backend Features
When the backend is running, you'll have access to:

- ✅ Real-time notifications
- ✅ Live trainer schedules
- ✅ Complete API functionality
- ✅ Data persistence
- ✅ User authentication

## Offline Fallback
When the backend is offline, the app gracefully falls back to:

- 📝 Sample data for testing
- 🔄 Reduced API retry attempts
- ⚠️ Clear status indicators
- 📱 Core functionality still works

## Troubleshooting
If you see console errors:
1. Ensure backend is running: `cd backend && npm start`
2. Check port 5000 is available
3. Verify database connection in backend logs
4. Restart both frontend and backend if needed

## Development Workflow
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Admin panel will show backend status
4. Test all features with live data