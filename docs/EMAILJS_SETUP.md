# EmailJS Setup Guide

## 🚨 Current Error: EmailJS Credentials Missing

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
