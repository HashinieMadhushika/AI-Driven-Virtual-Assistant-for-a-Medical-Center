@echo off
echo Adding doctor to database...
curl -X POST http://localhost:5000/api/doctors ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Sarah Silva\",\"email\":\"sarah.silva@medicare.com\",\"password\":\"password123\",\"phone\":\"+1 (555) 123-4567\",\"specialization\":\"Cardiology\",\"designation\":\"Senior Cardiologist\",\"yearsOfExperience\":15,\"education\":\"MD - Harvard Medical School\\nResidency - Johns Hopkins Hospital\",\"certifications\":[\"Board Certified in Cardiology\",\"Advanced Cardiac Life Support (ACLS)\"]}"
echo.
echo Done! Now try logging in with:
echo Email: sarah.silva@medicare.com
echo Password: password123
pause
