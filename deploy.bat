@echo off
echo =========================================
echo  vCard-Maker GitHub Deploy Tool
echo =========================================
echo.

echo [1/3] Adding changes...
git add .
echo.

echo [2/3] Committing changes...
git commit -m "Update via deploy.bat"
echo.

echo [3/3] Pushing to GitHub...
git push origin main
echo.

echo =========================================
echo  Deployment complete!
echo  (If Vercel is connected, it will be automatically updated shortly.)
echo =========================================
pause
