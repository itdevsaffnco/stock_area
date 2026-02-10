
$path = "c:\Users\Ryan Handani\Documents\Coding\Stock_Area\frontend\src\pages\AdminDashboard.jsx"
$lines = Get-Content -Path $path

$newLines = @()
$skip = $false
$badStockTableFound = $false
$badRenderContentFound = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $nextLine = if ($i + 1 -lt $lines.Count) { $lines[$i + 1] } else { "" }
    
    # 1. Detect Bad renderStockTable (contains Pagination Logic)
    if ($line -match "const renderStockTable = \(withActions = false\) => \{" -and -not $badStockTableFound) {
        # Check next 20 lines for "Pagination Logic"
        $isBad = $false
        for ($j = 0; $j -lt 20; $j++) {
            if (($i + $j -lt $lines.Count) -and ($lines[$i + $j] -match "// Pagination Logic")) {
                $isBad = $true
                break
            }
        }
        
        if ($isBad) {
            $skip = $true
            $badStockTableFound = $true
            # Skip until we hit "// Dashboard Filters"
            continue
        }
    }
    
    # Stop skipping bad renderStockTable
    if ($skip -and $badStockTableFound -and $line -match "// Dashboard Filters") {
        $skip = $false
        # We assume "// Dashboard Filters" line itself is good to keep (it starts the next section)
        # So we append it.
        $newLines += $line
        continue
    }

    # 2. Detect Bad renderContent (uses double quotes for dashboard case)
    if ($line -match "const renderContent = \(\) => \{" -and -not $badRenderContentFound) {
        # Check next 20 lines for 'case "dashboard":'
        $isBad = $false
        for ($j = 0; $j -lt 20; $j++) {
            if (($i + $j -lt $lines.Count) -and ($lines[$i + $j] -match 'case "dashboard":')) {
                $isBad = $true
                break
            }
        }
        
        if ($isBad) {
            $skip = $true
            $badRenderContentFound = $true
            continue
        }
    }

    # Stop skipping bad renderContent
    # It ends before `const handleDownloadData`
    if ($skip -and $badRenderContentFound -and $line -match "const handleDownloadData") {
        $skip = $false
        # handleDownloadData is good, keep it
        $newLines += $line
        continue
    }

    if (-not $skip) {
        $newLines += $line
    }
}

$content = $newLines -join "`n"

# 3. Add isRefreshing and handleRefresh
# Check if we already have them (in case we ran this before)
if ($content -notmatch "const \[isRefreshing, setIsRefreshing\]") {
    $content = $content -replace "const \[editingStock, setEditingStock\] = useState\(null\);", "const [editingStock, setEditingStock] = useState(null);`n  const [isRefreshing, setIsRefreshing] = useState(false);"
}

if ($content -notmatch "const handleRefresh =") {
    $handleRefreshCode = @"
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStocks(),
        fetchStores(),
        fetchProducts(),
        fetchUsers(),
        fetchStockTypes()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
"@
    # Insert before the GOOD renderStockTable (the one that remains)
    # The good one is: const renderStockTable = (withActions = false) => {
    # We replaced the bad one, so the first occurrence now is the good one?
    # No, we deleted the bad one. So the next occurrence is the good one.
    
    # Use a regex that matches the line, but we need to be careful not to match inside the replaced text if we did multiple replacements.
    # But here we are manipulating the string.
    
    $content = $content -replace "(const renderStockTable = \(withActions = false\) => \{)", "$handleRefreshCode`n`n  `$1"
}

# 4. Fix potential double renderStockTable declarations if deletion failed
# (Optional check)

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Output "Cleanup completed."
