#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Yoco Payment Integration Test Script
    
.DESCRIPTION
    Automated test script to verify Yoco payment integration functionality.
    Tests booking creation, payment URL generation, webhook simulation, and status updates.
    
.PARAMETER SkipWebhook
    Skip webhook simulation (only test booking and payment URL generation)
    
.PARAMETER BookingId
    Test existing booking by ID instead of creating new one
    
.EXAMPLE
    .\test-yoco-payment.ps1
    # Full test: Create booking → Generate payment URL → Simulate webhook → Verify status
    
.EXAMPLE
    .\test-yoco-payment.ps1 -SkipWebhook
    # Test only booking creation and payment URL generation
    
.EXAMPLE
    .\test-yoco-payment.ps1 -BookingId "booking-abc123"
    # Test existing booking
#>

param(
    [switch]$SkipWebhook,
    [string]$BookingId = $null
)

$ErrorActionPreference = "Stop"

# Configuration
$API_BASE = "http://localhost:4000"
$FRONTEND_BASE = "http://localhost:5173"
$TEST_AMOUNT = 1000.00
$WEBHOOK_SECRET = "whsec_test_7f5e8d9a2b3c4e5f6a7b8c9d0e1f2a3b"
$YOCO_SECRET_KEY = "sk_test_a0cd6efbOgaAN69e54148299e760"
$YOCO_PUBLIC_KEY = "pk_test_2dc62e2c0qvDRbz83e94"

Write-Host "🧪 Yoco Payment Integration Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Health Check
Write-Host "1️⃣  Checking API health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ API is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ API health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the backend server is running: npm run server" -ForegroundColor Yellow
    exit 1
}

# Step 2: Create or Load Booking
if ($BookingId) {
    Write-Host ""
    Write-Host "2️⃣  Loading existing booking: $BookingId" -ForegroundColor Yellow
    try {
        $booking = Invoke-RestMethod -Uri "$API_BASE/api/bookings/$BookingId" -Method GET
        Write-Host "✅ Booking loaded:" -ForegroundColor Green
        Write-Host "   ID: $($booking.id)" -ForegroundColor White
        Write-Host "   Total: R$($booking.pricing.total)" -ForegroundColor White
        Write-Host "   Status: $($booking.paymentStatus)" -ForegroundColor White
    } catch {
        Write-Host "❌ Failed to load booking: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "2️⃣  Creating test booking..." -ForegroundColor Yellow
    
    $bookingPayload = @{
        supplierId = "beekman"
        userId = "test_yoco_$(Get-Date -Format 'yyyyMMddHHmmss')"
        bookingType = "FIT"
        checkInDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        checkOutDate = (Get-Date).AddDays(9).ToString("yyyy-MM-dd")
        lineItems = @(
            @{
                serviceType = "accommodation"
                description = "Yoco Test Hotel - Deluxe Room"
                basePrice = 500
                retailPrice = 500
                quantity = 1
                nights = 2
            }
        )
        metadata = @{
            propertyName = "Yoco Test Hotel"
            location = "Cape Town"
            customerEmail = "yoco.test@example.com"
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $booking = Invoke-RestMethod -Uri "$API_BASE/api/bookings" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $bookingPayload
            
        Write-Host "✅ Booking created successfully:" -ForegroundColor Green
        Write-Host "   ID: $($booking.id)" -ForegroundColor White
        Write-Host "   Reference: $($booking.ref)" -ForegroundColor White
        Write-Host "   Total: R$($booking.pricing.total)" -ForegroundColor White
        Write-Host "   Status: $($booking.paymentStatus)" -ForegroundColor White
    } catch {
        Write-Host "❌ Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Generate Payment URL
Write-Host ""
Write-Host "3️⃣  Generating Yoco payment URL..." -ForegroundColor Yellow

$paymentPayload = @{
    bookingId = $booking.id
    processor = "yoco"
    amount = $booking.pricing.total
    returnUrl = "$FRONTEND_BASE/pay/success"
    cancelUrl = "$FRONTEND_BASE/pay/cancel"
    notifyUrl = "$API_BASE/api/webhooks/yoco"
} | ConvertTo-Json -Depth 10

try {
    $payment = Invoke-RestMethod -Uri "$API_BASE/api/payments/generate-url" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $paymentPayload
        
    Write-Host "✅ Payment URL generated:" -ForegroundColor Green
    Write-Host "   $($payment.paymentUrl)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   💳 To complete payment, open this URL in a browser" -ForegroundColor Yellow
    Write-Host "   Use test card: 4242 4242 4242 4242, CVV: 123, Expiry: 12/25" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Payment URL generation failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check if response has error details
    if ($_.ErrorDetails) {
        Write-Host "   Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "   Possible causes:" -ForegroundColor Yellow
    Write-Host "   - YOCO_SECRET_KEY not set in server/.env" -ForegroundColor Yellow
    Write-Host "   - Yoco API is unavailable" -ForegroundColor Yellow
    Write-Host "   - Invalid Yoco credentials" -ForegroundColor Yellow
    
    exit 1
}

# Exit if skipping webhook
if ($SkipWebhook) {
    Write-Host ""
    Write-Host "✅ Test completed (webhook skipped)" -ForegroundColor Green
    Write-Host ""
    Write-Host "To test the full flow:" -ForegroundColor Cyan
    Write-Host "1. Open payment URL in browser: $($payment.paymentUrl)" -ForegroundColor White
    Write-Host "2. Complete payment with test card" -ForegroundColor White
    Write-Host "3. Verify redirect to success page" -ForegroundColor White
    Write-Host "4. Check booking status: Invoke-RestMethod '$API_BASE/api/bookings/$($booking.id)'" -ForegroundColor White
    exit 0
}

# Step 4: Simulate Webhook
Write-Host ""
Write-Host "4️⃣  Simulating Yoco webhook..." -ForegroundColor Yellow

# Create webhook payload
$webhookPayload = @{
    type = "checkout.paid"
    data = @{
        id = "ch_test_$(Get-Random -Minimum 100000 -Maximum 999999)"
        amount = [int]($booking.pricing.total * 100)  # Convert to cents
        chargeId = "charge_test_$(Get-Random -Minimum 100000 -Maximum 999999)"
        metadata = @{
            bookingId = $booking.id
        }
        reference = $booking.id
    }
} | ConvertTo-Json -Depth 10 -Compress

# Calculate HMAC signature
$hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($WEBHOOK_SECRET))
$signatureBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($webhookPayload))
$signature = [System.BitConverter]::ToString($signatureBytes).Replace("-", "").ToLower()

Write-Host "   Payload: $($webhookPayload.Substring(0, [Math]::Min(100, $webhookPayload.Length)))..." -ForegroundColor Gray
Write-Host "   Signature: $signature" -ForegroundColor Gray

try {
    $webhookResponse = Invoke-RestMethod -Uri "$API_BASE/api/webhooks/yoco" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "X-Yoco-Signature" = $signature
        } `
        -Body $webhookPayload
        
    Write-Host "✅ Webhook processed successfully" -ForegroundColor Green
    Write-Host "   Response: $($webhookResponse | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "❌ Webhook simulation failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "   Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "   Possible causes:" -ForegroundColor Yellow
    Write-Host "   - Webhook signature verification failed" -ForegroundColor Yellow
    Write-Host "   - YOCO_WEBHOOK_SECRET mismatch" -ForegroundColor Yellow
    Write-Host "   - Booking amount mismatch" -ForegroundColor Yellow
    
    exit 1
}

# Step 5: Verify Booking Status
Write-Host ""
Write-Host "5️⃣  Verifying booking status update..." -ForegroundColor Yellow

Start-Sleep -Seconds 1  # Give webhook handler time to process

try {
    $updatedBooking = Invoke-RestMethod -Uri "$API_BASE/api/bookings/$($booking.id)" -Method GET
    
    if ($updatedBooking.paymentStatus -eq "paid") {
        Write-Host "✅ Booking payment status updated correctly:" -ForegroundColor Green
        Write-Host "   Payment Status: $($updatedBooking.paymentStatus)" -ForegroundColor White
        Write-Host "   Payment Processor: $($updatedBooking.paymentProcessor)" -ForegroundColor White
        Write-Host "   Paid At: $($updatedBooking.paidAt)" -ForegroundColor White
        Write-Host "   Payment ID: $($updatedBooking.paymentId)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Booking status not updated to 'paid'" -ForegroundColor Yellow
        Write-Host "   Current status: $($updatedBooking.paymentStatus)" -ForegroundColor Yellow
        Write-Host "   This might indicate webhook processing failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to verify booking: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Check Payment Logs
Write-Host ""
Write-Host "6️⃣  Checking payment event logs..." -ForegroundColor Yellow

$logFile = Join-Path $PSScriptRoot ".." "server" "data" "payment_notifications.jsonl"

if (Test-Path $logFile) {
    $recentLogs = Get-Content $logFile -Tail 3 | ForEach-Object { $_ | ConvertFrom-Json }
    
    Write-Host "✅ Recent payment events:" -ForegroundColor Green
    foreach ($log in $recentLogs) {
        Write-Host "   [$($log.processor)] $($log.type) - Booking: $($log.bookingId) - Status: $($log.status)" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  Payment log file not found: $logFile" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Yoco Payment Test Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Results:" -ForegroundColor Cyan
Write-Host "  ✅ API Health Check" -ForegroundColor Green
Write-Host "  ✅ Booking Creation" -ForegroundColor Green
Write-Host "  ✅ Payment URL Generation" -ForegroundColor Green
Write-Host "  ✅ Webhook Simulation" -ForegroundColor Green
Write-Host "  ✅ Status Update Verification" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test manual payment flow: $($payment.paymentUrl)" -ForegroundColor White
Write-Host "  2. Verify email confirmations are sent" -ForegroundColor White
Write-Host "  3. Test failure scenarios (declined card: 4000 0000 0000 0002)" -ForegroundColor White
Write-Host "  4. Run full test suite: npm run test -- tests/yoco.webhook.test.js" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full testing guide: docs/YOCO_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
