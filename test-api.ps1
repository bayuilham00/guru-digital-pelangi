# Test API Script
Write-Host "Testing API endpoints..."

# Login first
$loginBody = @{
    identifier = "admin@pelangi.sch.id"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "Login successful!"
    
    $token = $loginResponse.data.token
    Write-Host "Token: $($token.Substring(0, 20))..."
    
    # Test the class detail endpoint
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Testing /api/classes/cmct4udfa0003u88gvj93r0qo/full endpoint..."
    $classResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/classes/cmct4udfa0003u88gvj93r0qo/full" -Method GET -Headers $headers
    
    Write-Host "Class API Response:"
    $classResponse | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
