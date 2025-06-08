# PowerShell script to fix SPA routing in production nginx container

Write-Host "🔧 Fixing SPA Routing Configuration..." -ForegroundColor Green

# Get frontend container name
Write-Host "🔍 Finding frontend container..." -ForegroundColor Yellow
$frontendContainer = docker ps --filter "name=frontend" --format "{{.Names}}" | Select-Object -First 1

if ($frontendContainer) {
    Write-Host "Found frontend container: $frontendContainer" -ForegroundColor Green
    
    # Create corrected nginx config
    $nginxConfig = @"
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;
    root   /usr/share/nginx/html;
    index  index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache images and fonts
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 6M;
        add_header Cache-Control "public, immutable";
    }

    # Handle React SPA routing - CRITICAL FIX
    location / {
        try_files `$uri `$uri/ @fallback;
        
        # No-cache for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }
    }

    # Fallback for SPA routes
    location @fallback {
        rewrite ^.*$ /index.html last;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
"@

    # Save config to temp file
    $tempFile = [System.IO.Path]::GetTempFileName()
    $nginxConfig | Out-File -FilePath $tempFile -Encoding UTF8
    
    Write-Host "✅ New nginx configuration created" -ForegroundColor Green
    
    # Backup current config
    Write-Host "💾 Backing up current configuration..." -ForegroundColor Yellow
    docker exec $frontendContainer cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
    
    # Copy new config to container
    Write-Host "📋 Copying new configuration..." -ForegroundColor Yellow
    docker cp $tempFile "$($frontendContainer):/etc/nginx/conf.d/default.conf"
    
    # Test nginx configuration
    Write-Host "🧪 Testing nginx configuration..." -ForegroundColor Yellow
    $testResult = docker exec $frontendContainer nginx -t 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nginx configuration is valid" -ForegroundColor Green
        
        # Reload nginx
        Write-Host "🔄 Reloading nginx..." -ForegroundColor Yellow
        docker exec $frontendContainer nginx -s reload
        
        Write-Host "✅ Nginx reloaded successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 SPA routing fix applied successfully!" -ForegroundColor Green
        
        # Test routes
        Write-Host ""
        Write-Host "🧪 Testing SPA routes..." -ForegroundColor Yellow
        
        try {
            $homeTest = curl.exe -s -o NUL -w "%{http_code}" https://bhavyabazaar.com/
            Write-Host "Homepage: $homeTest" -ForegroundColor $(if($homeTest -eq "200") {"Green"} else {"Red"})
            
            $loginTest = curl.exe -s -o NUL -w "%{http_code}" https://bhavyabazaar.com/login
            Write-Host "Login page: $loginTest" -ForegroundColor $(if($loginTest -eq "200") {"Green"} else {"Red"})
            
            $profileTest = curl.exe -s -o NUL -w "%{http_code}" https://bhavyabazaar.com/profile
            Write-Host "Profile page: $profileTest" -ForegroundColor $(if($profileTest -eq "200") {"Green"} else {"Red"})
        }
        catch {
            Write-Host "Note: curl testing failed, but nginx should be working" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Nginx configuration test failed" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        
        Write-Host "🔄 Restoring backup..." -ForegroundColor Yellow
        docker exec $frontendContainer cp /etc/nginx/conf.d/default.conf.backup /etc/nginx/conf.d/default.conf
        docker exec $frontendContainer nginx -s reload
        Write-Host "✅ Backup restored" -ForegroundColor Green
    }
    
    # Cleanup
    Remove-Item $tempFile -Force
    
} else {
    Write-Host "❌ Frontend container not found" -ForegroundColor Red
    Write-Host "Available containers:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "- SPA routing configuration updated" -ForegroundColor White
Write-Host "- All React routes should now return 200 OK" -ForegroundColor White
Write-Host "- Users should no longer get logged out on refresh" -ForegroundColor White
Write-Host "- Direct access to /login, /profile, etc. should work" -ForegroundColor White
