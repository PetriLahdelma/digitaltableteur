# EmailJS Setup Guide

## 🚨 Current Error: EmailJS Credentials Missing

# EmailJS Setup Guide

## ✅ CREDENTIALS FETCHED FROM VERCEL

EmailJS credentials have been successfully pulled from Vercel and saved to `.env.local`.

## 🚨 If Still Getting "EmailJS credentials not configured" Error

This error usually means you're viewing an old build. Follow these steps:

### Step 1: Rebuild the Application

The environment variables are included at build time, so rebuild:

```bash
npm run build
```

### Step 2: Test in Development Mode

```bash
npm run dev
# Visit http://localhost:5174/contact
```

In development mode, you should see debug logs in the browser console:
```
EmailJS Environment Check: {
  VITE_EMAIL_SERVICE_ID: true,
  VITE_EMAIL_TEMPLATE_ID: true, 
  VITE_EMAIL_PUBLIC_KEY: true,
  SERVICE_ID: true,
  TEMPLATE_ID: true,
  PUBLIC_KEY: true
}
```

### Step 3: Clear Browser Cache

If you're still seeing the old error:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache completely
3. Try in incognito/private browser window

### Step 4: Verify Environment Variables

Check that `.env.local` exists and contains:
```bash
ls -la .env.local  # Should exist and be recent
```

## 🔧 Current Setup Status

✅ **Vercel CLI**: Installed
✅ **Environment Variables**: Pulled from `digitaltableteur_secure_proxy`
✅ **Local File**: `.env.local` created with credentials
✅ **Build System**: Configured to include VITE_ prefixed variables

## 📧 EmailJS Template Variables

Your ContactForm sends these variables to EmailJS:

- `{{name}}` - Full name
- `{{email}}` - Email address  
- `{{phone}}` - Phone number
- `{{interest}}` - Selected interests (comma-separated)
- `{{message}}` - Message content
- `{{hearAbout}}` - How they heard about you
- `{{time}}` - Submission timestamp

## 🎯 Testing URLs

- **Development**: `http://localhost:5174/contact`
- **Production Build**: `http://localhost:8081/contact` 

## 🐛 Common Issues

**Old cached JavaScript files?**
- The error shows old file names like `Contact-YwjJxXMq.js`
- After rebuild, new files like `Contact-DGn2hcqy.js` should be generated
- Clear browser cache or use incognito mode

**Environment variables not loading?**
- Make sure `.env.local` is in project root (same directory as `package.json`)
- Restart development server after creating `.env.local`
- Check that variables start with `VITE_` prefix

**Still not working?**
- Check browser console for the debug logs mentioned in Step 2
- Verify you're not looking at a deployed version that doesn't have the credentials

You're seeing this error because EmailJS environment variables are not configured:

```
EmailJS credentials not configured. Missing:
SERVICE_ID: true, TEMPLATE_ID: true, PUBLIC_KEY: true
```

## 🛠️ How to Fix

### Step 1: Get EmailJS Credentials

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Sign up or log in to your account
3. **Get Service ID**:
   - Go to "Email Services"
   - Copy your service ID (e.g., `service_xxxxxxx`)
4. **Get Template ID**:
   - Go to "Email Templates"
   - Copy your template ID (e.g., `template_xxxxxxx`)
5. **Get Public Key**:
   - Go to "Account" > "API Keys"
   - Copy your public key

### Step 2: Create Environment File

Create a file named `.env.local` in your project root:

```bash
# .env.local
VITE_EMAIL_SERVICE_ID=service_xxxxxxx
VITE_EMAIL_TEMPLATE_ID=template_xxxxxxx
VITE_EMAIL_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## 📧 EmailJS Template Variables

Your ContactForm sends these variables to EmailJS:

- `{{name}}` - Full name
- `{{email}}` - Email address
- `{{phone}}` - Phone number
- `{{interest}}` - Selected interests (comma-separated)
- `{{message}}` - Message content
- `{{hearAbout}}` - How they heard about you
- `{{time}}` - Submission timestamp

## 🔒 Security Notes

- `.env.local` is already in `.gitignore` - your credentials won't be committed
- Only `VITE_` prefixed variables are exposed to the browser
- EmailJS credentials are safe to expose client-side

## ✅ Testing

After setup, the contact form should:

1. Save to MongoDB (even if EmailJS fails)
2. Send email via EmailJS
3. Show success modal
4. Clear the form

## 🐛 Common Issues

**Still getting errors after setup?**

- Make sure variable names match exactly: `VITE_EMAIL_SERVICE_ID`, `VITE_EMAIL_TEMPLATE_ID`, `VITE_EMAIL_PUBLIC_KEY`
- Restart your development server after creating `.env.local`
- Check EmailJS dashboard for correct IDs

**404 errors on /contact?**

- This might be a development server routing issue
- Try accessing via: `http://localhost:5173/contact` (or your dev port)
- Check if you're running the dev server: `npm run dev`
