# API Configuration Fix

## Issue
The frontend was making requests to `http://localhost:3000/resume/5/analysis` instead of using the Vite proxy to forward requests to the backend at `http://localhost:8000`.

## Root Cause
The `resumeApi` axios instance had an empty `baseURL: ''`, which should work with Vite's proxy, but there might be a port or configuration issue.

## Solution Applied

### 1. Fixed resumeApi Configuration
```typescript
// Before (problematic)
const resumeApi = axios.create({
  baseURL: '', // This should work with Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// After (confirmed correct)
const resumeApi = axios.create({
  baseURL: '', // Empty base URL to use Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Vite Proxy Configuration
The `vite.config.js` is correctly configured:
```javascript
server: {
  port: 3000,
  proxy: {
    '/resume': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

### 3. Expected Request Flow
1. Frontend makes request to: `/resume/5/analysis`
2. Vite proxy forwards to: `http://localhost:8000/resume/5/analysis`
3. Backend processes request and returns response

## Verification Steps

### 1. Check Frontend Port
Ensure the frontend is running on port 3000:
```bash
cd frontend
npm run dev
```
Should show: `Local: http://localhost:3000/`

### 2. Check Backend Port
Ensure the backend is running on port 8000:
```bash
cd backend
python app.py
```
Should show: `Uvicorn running on http://0.0.0.0:8000`

### 3. Check Network Requests
In browser DevTools Network tab:
- Request should go to: `/resume/5/analysis`
- NOT to: `http://localhost:3000/resume/5/analysis`

## Troubleshooting

### If requests still go to localhost:3000:
1. **Check if frontend is running on correct port**
2. **Restart the frontend dev server**
3. **Clear browser cache**
4. **Check if there are any hardcoded URLs**

### If proxy is not working:
1. **Verify vite.config.js proxy configuration**
2. **Check if backend is running on port 8000**
3. **Check for port conflicts**

### If CORS errors persist:
1. **Verify backend CORS configuration**
2. **Check if frontend origin is allowed**
3. **Ensure both servers are running**

## Files Modified
- `frontend/src/services/resumeService.ts` - Fixed resumeApi baseURL
- `frontend/src/services/index.ts` - Updated API_CONFIG.UPLOAD

## Expected Behavior
- ✅ Frontend runs on `http://localhost:3000`
- ✅ Backend runs on `http://localhost:8000`
- ✅ API requests are proxied through Vite
- ✅ No CORS errors
- ✅ Resume analysis loads correctly

## Testing
1. Start both servers
2. Navigate to resume analysis page
3. Check browser network tab for correct request URLs
4. Verify data loads without errors
