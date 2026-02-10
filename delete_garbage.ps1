
$path = "c:\Users\Ryan Handani\Documents\Coding\Stock_Area\frontend\src\pages\AdminDashboard.jsx"
$lines = Get-Content -Path $path
$count = $lines.Count
$startLine = 1327
$endLine = 1763

# Verify range validity
if ($startLine -ge $count -or $endLine -ge $count) {
    Write-Error "Line numbers out of range. File has $count lines."
    exit 1
}

# 1-based index in my thought process, 0-based in array.
# Lines 1327-1763 (1-based) correspond to indices 1326-1762.
# But let's check the content at these indices to be safe.
# Index 1326 (Line 1327) should be `</div>` or similar garbage.
# Index 1763 (Line 1764) should be `return (`.

$line1327 = $lines[1326]
$line1764 = $lines[1763]

Write-Output "Line 1327: $line1327"
Write-Output "Line 1764: $line1764"

if ($line1764 -match "return \(") {
    Write-Output "Target verified. Deleting lines $startLine to $endLine."
    
    # Create new content excluding the range
    # We want to keep 0..1325 (Line 1..1326)
    # Skip 1326..1762 (Line 1327..1763)
    # Keep 1763..End (Line 1764..End)
    
    $newLines = $lines[0..1325] + $lines[1763..($count-1)]
    $newContent = $newLines -join "`n"
    
    Set-Content -Path $path -Value $newContent -Encoding UTF8
    Write-Output "Deletion complete."
} else {
    Write-Error "Verification failed. Line 1764 is not 'return ('."
    exit 1
}
