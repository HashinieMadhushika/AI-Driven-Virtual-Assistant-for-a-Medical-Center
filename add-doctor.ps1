# PowerShell script to add a doctor to the database

$doctorData = @{
    name = "Sarah Silva"
    email = "sarah.silva@medicare.com"
    password = "password123"
    phone = "+1 (555) 123-4567"
    specialization = "Cardiology"
    designation = "Senior Cardiologist"
    yearsOfExperience = 15
    education = "MD - Harvard Medical School`nResidency - Johns Hopkins Hospital"
    certifications = @("Board Certified in Cardiology", "Advanced Cardiac Life Support (ACLS)")
}

$json = $doctorData | ConvertTo-Json

Write-Host "Creating doctor account for: $($doctorData.name)" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✓ Doctor created successfully!" -ForegroundColor Green
    Write-Host "Doctor ID: $($response.doctor.id)" -ForegroundColor Yellow
    Write-Host "Email: $($response.doctor.email)" -ForegroundColor Yellow
    Write-Host "`nYou can now login with:" -ForegroundColor Cyan
    Write-Host "  Email: sarah.silva@medicare.com" -ForegroundColor White
    Write-Host "  Password: password123" -ForegroundColor White
} catch {
    Write-Host "✗ Error creating doctor:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
