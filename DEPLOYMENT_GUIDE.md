# MashLab MVP Deployment Guide

This guide covers deploying MashLab as a split-stack MVP with private preview access.

## Architecture

- **Frontend**: Next.js on Vercel
- **Backend**: Flask on Render/Railway
- **Security**: Private preview gate with passcode
- **API Protection**: Shared secret header validation

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_BASE=https://mashlab-api.onrender.com
PREVIEW_CODE=mashlab2024
PREVIEW_SHARED_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
APP_DOMAIN=https://mashlab.vercel.app
```

### Backend (Render/Railway)
```bash
PREVIEW_SHARED_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
FRONTEND_ORIGIN=https://mashlab.vercel.app
```

## Deployment Steps

### 1. Backend Deployment (Render)

1. Create account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements_flask.txt`
   - **Start Command**: `gunicorn flask_app:app`
   - **Environment**: Python 3
5. Set environment variables in Render dashboard
6. Deploy and note the public URL (e.g., `https://mashlab-api.onrender.com`)

### 2. Frontend Deployment (Vercel)

1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `/` (root)
4. Set environment variables in Vercel dashboard
5. Deploy and note the public URL (e.g., `https://mashlab.vercel.app`)

### 3. Update Environment Variables

After deployment, update the environment variables with the actual URLs:

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_BACKEND_BASE=https://your-actual-backend-url.onrender.com
APP_DOMAIN=https://your-actual-frontend-url.vercel.app
```

**Backend (Render dashboard)**:
```bash
FRONTEND_ORIGIN=https://your-actual-frontend-url.vercel.app
```

### 4. Test Deployment

1. Visit your frontend URL
2. You should be redirected to `/access`
3. Enter the preview code: `mashlab2024`
4. Verify the app loads correctly
5. Test API calls work through the proxy

## Security Features

### Private Preview Gate
- Users must enter a passcode on `/access`
- Next.js sets an httpOnly cookie
- Middleware protects all app routes
- Cookie expires after 7 days

### API Protection
- All API calls go through Next.js proxy
- Shared secret header added automatically
- Flask rejects requests without the secret
- CORS limited to frontend domain only

### Rate Limiting (Optional)
Add to Flask app for additional security:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

@app.route("/api/*")
@limiter.limit("100 per minute")
def api_route():
    # Your API logic
```

## API Forms (GetSongBPM)

When registering for API access:

- **Website URL**: `https://your-frontend-url.vercel.app`
- **Backlink URL**: Same as website URL
- **Backlink**: Ensure footer link to GetSongBPM is live

## Development vs Production

### Development
```bash
# Install dependencies
npm install
pip install -r requirements_flask.txt

# Run both servers
npm run dev-full  # Runs Next.js + Flask concurrently
```

### Production
- Frontend automatically deployed on Vercel
- Backend automatically deployed on Render
- Environment variables set in respective dashboards

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check FRONTEND_ORIGIN matches your Vercel URL exactly
2. **401 Unauthorized**: Verify PREVIEW_SHARED_SECRET matches between frontend and backend
3. **API Not Found**: Ensure API routes are properly proxied in Next.js
4. **Cookie Not Set**: Check middleware.ts configuration

### Debug Mode

Enable debug logging in Flask:
```python
app.config['DEBUG'] = True
```

Check browser network tab for API call patterns:
- Browser → Next.js API → Flask
- All requests should include `x-ml-preview-secret` header

## Monitoring

### Health Checks
- Backend: `https://your-backend-url/healthz`
- Frontend: Check Vercel deployment status

### Logs
- Vercel: Check function logs in dashboard
- Render: Check service logs in dashboard

## Scaling Considerations

- Vercel handles frontend scaling automatically
- Render free tier has limitations; consider paid plans for production
- Consider adding Redis for session storage if needed
- Implement proper error handling and logging

## Security Best Practices

1. **Rotate Secrets**: Change PREVIEW_SHARED_SECRET regularly
2. **HTTPS Only**: Both services use HTTPS by default
3. **Environment Variables**: Never commit secrets to Git
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Set up alerts for failed authentications
