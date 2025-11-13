# MealOutpost SuperAgent - Deployment Guide 🚀

## Vercel Deployment (Recommended)

### Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** - Install globally
3. **Node.js 18+** - Ensure you have the correct version

### Quick Deploy via CLI

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

#### 3. Deploy to Production

```bash
# From project root
cd "/Users/jeremyalston/Downloads/Component paradise/Gesthemane/open-competitor"

# Deploy to production
vercel --prod
```

#### 4. Deploy to Preview (Staging)

```bash
# Deploy to preview environment
vercel
```

### Step-by-Step Deployment

#### First Time Deployment

1. **Navigate to project directory:**
   ```bash
   cd "/Users/jeremyalston/Downloads/Component paradise/Gesthemane/open-competitor"
   ```

2. **Initialize Vercel project:**
   ```bash
   vercel
   ```

3. **Answer setup questions:**
   - Set up and deploy? `Y`
   - Which scope? Select your account/team
   - Link to existing project? `N`
   - Project name? `mealoutput-superagent`
   - Directory location? `./` (press Enter)
   - Override settings? `N`

4. **Wait for deployment:**
   - Vercel will build and deploy your app
   - You'll get a preview URL (e.g., `mealoutput-superagent-xxx.vercel.app`)

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

#### Subsequent Deployments

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Configuration Files

#### `vercel.json` (Created)
- Framework: Next.js
- Node version: 18
- Build command: `npm run build`
- Output directory: `.next`
- Security headers included

#### `.vercelignore` (Created)
- Excludes unnecessary files from deployment
- Keeps deployment size minimal

### Environment Variables

If your app requires environment variables:

1. **Via CLI:**
   ```bash
   vercel env add VARIABLE_NAME production
   vercel env add VARIABLE_NAME preview
   vercel env add VARIABLE_NAME development
   ```

2. **Via Dashboard:**
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add variables for each environment

### Custom Domain

1. **Via CLI:**
   ```bash
   vercel domains add yourdomain.com
   ```

2. **Via Dashboard:**
   - Project Settings → Domains
   - Add custom domain
   - Configure DNS records

### Deployment Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-name]

# Link local project to Vercel project
vercel link

# Pull environment variables
vercel env pull

# View project info
vercel inspect [deployment-url]
```

### Continuous Deployment (Git Integration)

#### Connect to GitHub

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure build settings (auto-detected for Next.js)
5. Click "Deploy"

**Automatic deployments:**
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with comment

### Build Configuration

The project is configured with:

- **Framework:** Next.js 15
- **Node Version:** 18
- **Package Manager:** npm
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### Troubleshooting

#### Build Fails

1. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Clear cache and retry:**
   ```bash
   vercel --force
   ```

3. **Check build logs:**
   ```bash
   vercel logs [deployment-url]
   ```

#### Environment Issues

1. **Verify environment variables:**
   ```bash
   vercel env ls
   ```

2. **Pull latest env vars:**
   ```bash
   vercel env pull .env.local
   ```

#### Dependencies Issues

1. **Clear node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Redeploy:**
   ```bash
   vercel --prod --force
   ```

### Performance Optimization

Vercel automatically provides:

- ✅ **Edge Network** - Global CDN
- ✅ **Automatic HTTPS** - SSL certificates
- ✅ **Image Optimization** - Next.js Image component
- ✅ **Static Site Generation** - Pre-rendered pages
- ✅ **Incremental Static Regeneration** - Dynamic updates
- ✅ **Edge Functions** - Serverless at the edge

### Monitoring & Analytics

1. **Enable Analytics:**
   - Dashboard → Project → Analytics
   - Add Vercel Analytics package:
     ```bash
     npm install @vercel/analytics
     ```

2. **Add to your app:**
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Security Headers

Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### CLI Quick Reference

```bash
# Authentication
vercel login
vercel logout
vercel whoami

# Deployment
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel --force           # Force new deployment

# Project Management
vercel ls                # List deployments
vercel rm [name]         # Remove deployment
vercel link              # Link project
vercel pull              # Pull project settings

# Environment Variables
vercel env ls            # List variables
vercel env add [name]    # Add variable
vercel env rm [name]     # Remove variable
vercel env pull          # Pull to .env.local

# Domains
vercel domains ls        # List domains
vercel domains add [domain]  # Add domain
vercel domains rm [domain]   # Remove domain

# Logs & Debugging
vercel logs [url]        # View logs
vercel inspect [url]     # Inspect deployment
```

### Project URLs

After deployment, your app will be available at:

- **Production:** `https://mealoutput-superagent.vercel.app`
- **Preview:** `https://mealoutput-superagent-[hash].vercel.app`

### Next Steps After Deployment

1. ✅ Verify deployment at production URL
2. ✅ Test all features (chat, voice input, ratings)
3. ✅ Check mobile responsiveness
4. ✅ Configure custom domain (optional)
5. ✅ Set up environment variables (if needed)
6. ✅ Enable analytics
7. ✅ Configure Git integration for auto-deploy

### Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **CLI Docs:** [vercel.com/docs/cli](https://vercel.com/docs/cli)
- **Next.js on Vercel:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## Ready to Deploy! 🚀

Your **MealOutpost SuperAgent** is configured and ready for deployment with:
- ✅ Advanced AI Chat Interface
- ✅ Voice Recording with Waveform
- ✅ Message Feedback & Ratings
- ✅ QR Code Generation
- ✅ Dynamic Toolbar
- ✅ Multiple AI Tools
- ✅ Google Sheets/Docs Integration
- ✅ MealOutpost E-commerce Flow

Run `vercel --prod` to go live!
