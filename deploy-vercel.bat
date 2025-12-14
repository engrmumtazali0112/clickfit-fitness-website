@echo off
echo Deploying ClickFit to Vercel with Turso...
echo.

echo Step 1: Install dependencies...
cd server
npm install

echo Step 2: Deploy to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 📍 Your site: https://clickfit.vercel.app
echo 📊 Health check: https://clickfit.vercel.app/health
echo 👥 Users API: https://clickfit.vercel.app/api/users
echo.

pause