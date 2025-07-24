$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJuY3MwMDAwdThuOHVqNGk4cXVhIiwiaWF0IjoxNzUyODAyMzI5LCJleHAiOjE3NTM0MDcxMjl9.bLHeJ9anS9EWI4X3jthycp7_MrRyjfJHzaiCWzdGJ4o"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/assignments/stats" -Method GET -Headers $headers
    Write-Host "Success:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
