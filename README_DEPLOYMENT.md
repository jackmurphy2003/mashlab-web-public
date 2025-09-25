# MashLab MVP - Split Stack Deployment

A DJ mashup helper application deployed as a split-stack MVP with private preview access.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Flask API     │    │   External      │
│   Frontend      │◄──►│   Backend       │◄──►│   APIs          │
│   (Vercel)      │    │   (Render)      │    │   (Deezer, etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │
        │                        │
   ┌────▼────┐              ┌────▼────┐
   │Preview  │              │Shared   │
   │Gate     │              │Secret   │
   │(Cookie) │              │(Header) │
   └─────────┘              └─────────┘
```

## 🔐 Security Features

- **Private Preview Gate**: Passcode-protected access
- **Shared Secret Authentication**: API requests validated with secret header
- **CORS Protection**: Limited to frontend domain only
- **HttpOnly Cookies**: Secure session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Local Development

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd MurphMixes_CrateMate
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   ./start_flask.sh
   ```

3. **Environment Setup**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_BACKEND_BASE=http://localhost:5000
   PREVIEW_CODE=mashlab2024
   PREVIEW_SHARED_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
   APP_DOMAIN=http://localhost:3000
   ```

4. **Start Development**
   ```bash
   # Terminal 1: Flask backend
   ./start_flask.sh
   
   # Terminal 2: Next.js frontend
   npm run dev
   ```

5. **Access Application**
   - Visit: http://localhost:3000
   - Enter preview code: `mashlab2024`
   - Start using MashLab!

## 🌐 Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Render)
1. Create Web Service on Render
2. Connect GitHub repo
3. Set environment variables
4. Deploy with `gunicorn flask_app:app`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
├── pages/                 # Next.js pages
│   ├── api/              # API proxy routes
│   ├── access.tsx        # Preview gate page
│   └── _app.tsx          # App wrapper
├── src/                  # React components (existing)
├── lib/                  # Utilities
│   └── serverFetch.ts    # Backend communication
├── flask_app.py          # Flask backend
├── middleware.ts         # Route protection
├── requirements_flask.txt # Python dependencies
└── Procfile             # Deployment config
```

## 🔧 Key Files

- **`middleware.ts`**: Protects routes with preview gate
- **`pages/access.tsx`**: Preview code entry page
- **`lib/serverFetch.ts`**: Adds shared secret to API calls
- **`flask_app.py`**: Flask backend with security middleware
- **`pages/api/*`**: Next.js API proxy routes

## 🛡️ Security Implementation

### Preview Gate Flow
1. User visits any protected route
2. Middleware checks for `ml_preview` cookie
3. If missing, redirect to `/access`
4. User enters preview code
5. API validates code and sets httpOnly cookie
6. User gains access to application

### API Protection Flow
1. Frontend makes API call to Next.js route (`/api/*`)
2. Next.js proxy adds `x-ml-preview-secret` header
3. Request forwarded to Flask backend
4. Flask validates secret header
5. If valid, processes request; if not, returns 401

## 📊 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_BASE=https://your-backend-url.onrender.com
PREVIEW_CODE=your-preview-passphrase
PREVIEW_SHARED_SECRET=64-character-random-string
APP_DOMAIN=https://your-frontend-url.vercel.app
```

### Backend (Render/Railway)
```bash
PREVIEW_SHARED_SECRET=same-as-frontend
FRONTEND_ORIGIN=https://your-frontend-url.vercel.app
```

## 🧪 Testing

### Local Testing
1. Start both servers
2. Visit http://localhost:3000
3. Verify redirect to `/access`
4. Enter preview code
5. Test API calls work

### Production Testing
1. Deploy both services
2. Visit production URL
3. Verify preview gate works
4. Test API functionality
5. Confirm CORS restrictions

## 🔍 Monitoring

### Health Checks
- Backend: `GET /healthz`
- Frontend: Vercel deployment status

### Logs
- Vercel: Function logs in dashboard
- Render: Service logs in dashboard

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**
- Verify `FRONTEND_ORIGIN` matches your Vercel URL exactly
- Check for trailing slashes or protocol mismatches

**401 Unauthorized**
- Ensure `PREVIEW_SHARED_SECRET` matches between frontend and backend
- Check API calls include the secret header

**Preview Gate Not Working**
- Verify middleware.ts is in project root
- Check cookie is being set correctly
- Confirm environment variables are loaded

**API Calls Failing**
- Verify Next.js API routes are properly configured
- Check Flask app is running and accessible
- Confirm proxy configuration in next.config.js

### Debug Steps
1. Check browser network tab for request flow
2. Verify environment variables are set
3. Check server logs for errors
4. Test API endpoints directly with curl

## 📈 Scaling Considerations

- **Vercel**: Handles frontend scaling automatically
- **Render**: Consider paid plans for production loads
- **Database**: Add Redis for session storage if needed
- **Monitoring**: Implement proper error tracking
- **Rate Limiting**: Add API rate limiting for security

## 🔒 Security Best Practices

1. **Rotate Secrets**: Change shared secret regularly
2. **HTTPS Only**: Both services use HTTPS in production
3. **Environment Variables**: Never commit secrets to Git
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Set up alerts for failed authentications
6. **Backup**: Regular database backups

## 📝 API Forms

When registering for external API access (e.g., GetSongBPM):

- **Website URL**: Your Vercel URL
- **Backlink URL**: Same as website URL
- **Backlink**: Footer link to GetSongBPM is required and included

## 🎯 Next Steps

1. Deploy to production environments
2. Set up monitoring and alerting
3. Implement rate limiting
4. Add comprehensive error handling
5. Set up automated testing
6. Plan for user feedback collection

---

**Ready to deploy?** Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions.
