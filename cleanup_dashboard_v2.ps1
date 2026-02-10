
$path = "c:\Users\Ryan Handani\Documents\Coding\Stock_Area\frontend\src\pages\AdminDashboard.jsx"
$content = Get-Content -Path $path -Raw

# 1. Add isRefreshing state if not present
if ($content -notmatch "isRefreshing") {
    $content = $content -replace "const \[editingStock, setEditingStock\] = useState\(null\);", "const [editingStock, setEditingStock] = useState(null);`n  const [isRefreshing, setIsRefreshing] = useState(false);"
}

# 2. Add handleRefresh function if not present
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
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

"@
    # Insert before renderStockTable (the good one, or generally before render components)
    $content = $content -replace "(const renderStockTable)", "$handleRefreshCode`n$1"
}

# 3. Remove duplicate/broken renderStockTable (the one with Pagination Logic)
# Regex to match the function block is hard, but we know it has "// Pagination Logic"
# We will use a more specific replace or split logic.
# The bad one starts with `const renderStockTable` and has `// Pagination Logic` inside.
# The good one does not.

if ($content -match "(?s)const renderStockTable = \(withActions = false\) => \{.*?// Pagination Logic.*?\};") {
    # This regex is risky if braces are not balanced or matched correctly.
    # Instead, let's identify the start and end indices roughly.
    # The bad block is ~50 lines.
    
    # Let's try to remove it by splitting and filtering.
    # But strictly speaking, we want to remove the FIRST occurrence of renderStockTable if it has Pagination Logic.
    
    # Let's use a simpler approach: Read lines, identify the block.
    $lines = Get-Content -Path $path
    $newLines = @()
    $skip = $false
    $inBadRenderStockTable = $false
    $inBadRenderContent = $false
    
    foreach ($line in $lines) {
        # Detect start of bad renderStockTable
        if ($line -match "const renderStockTable = \(withActions = false\) => \{" -and $skip -eq $false) {
            # Check if this is the bad one (we assume the first one is bad if we haven't seen the good one yet, 
            # but let's check if the next few lines contain Pagination Logic. 
            # Actually, we can just check if we are in the "bad zone" based on line numbers or content context.
            # But line numbers change.
            
            # Heuristic: The bad renderStockTable is followed by "const renderStockTable" AGAIN later.
            # So if we see two definitions, we remove the first one?
            # Or we look for "// Pagination Logic".
            
            # Let's rely on the previous analysis:
            # Bad renderStockTable is followed by `// Dashboard Filters` at the end (broken closure).
            # Bad renderContent uses `case "dashboard":` (double quotes).
        }
    }
}

# Better approach with string replacement for known bad blocks
# Bad renderStockTable start
$badStockTableStart = "const renderStockTable = (withActions = false) => {"
$badStockTableIndicator = "// Pagination Logic"

# Bad renderContent start
$badRenderContentStart = "const renderContent = () => {"
$badRenderContentIndicator = 'case "dashboard":' # Double quotes

# We will read the file line by line and skip the bad blocks.
$lines = Get-Content -Path $path
$finalLines = @()
$skipMode = "none" # "stockTable", "renderContent"
$braceCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Check for start of bad renderStockTable
    if ($line -contains "const renderStockTable = (withActions = false) => {" -and $skipMode -eq "none") {
        # Look ahead to see if it contains "// Pagination Logic" in the next 10 lines
        $isBad = $false
        for ($j = 1; $j -le 10; $j++) {
            if ($lines[$i+$j] -match "// Pagination Logic") {
                $isBad = $true
                break
            }
        }
        
        if ($isBad) {
            $skipMode = "stockTable"
            $braceCount = 1 # We entered a block
            continue
        }
    }
    
    # Check for start of bad renderContent
    if ($line -contains "const renderContent = () => {" -and $skipMode -eq "none") {
        # Look ahead for `case "dashboard":`
        $isBad = $false
        for ($j = 1; $j -le 10; $j++) {
            if ($lines[$i+$j] -match 'case "dashboard":') {
                $isBad = $true
                break
            }
        }
        
        if ($isBad) {
            $skipMode = "renderContent"
            $braceCount = 1
            continue
        }
    }
    
    if ($skipMode -ne "none") {
        # We are skipping. Update brace count.
        # Simple brace counting to find end of function.
        $openBraces = ($line.ToCharArray() | Where-Object { $_ -eq '{' }).Count
        $closeBraces = ($line.ToCharArray() | Where-Object { $_ -eq '}' }).Count
        $braceCount += $openBraces - $closeBraces
        
        # Special case for the broken renderStockTable which might not close properly
        # It ended with `// Dashboard Filters` in the grep output, which was weird.
        # But if it's broken, brace counting might fail.
        # Let's rely on the fact that the bad renderContent ENDS before `const handleDownloadData`.
        
        if ($skipMode -eq "renderContent" -and $line -match "const handleDownloadData") {
             # We found the next function, so the bad block must have ended.
             # But wait, handleDownloadData is AFTER the bad block.
             # So we should stop skipping BEFORE this line.
             $skipMode = "none"
             $finalLines += $line # Add the current line (handleDownloadData)
             continue
        }
        
        # If brace count hits 0, we are done?
        if ($braceCount -le 0) {
            $skipMode = "none"
        }
    } else {
        $finalLines += $line
    }
}

$newContent = $finalLines -join "`n"

# Verify we didn't lose the good ones
if ($newContent -notmatch 'case ''dashboard'':') {
    Write-Error "Error: It seems we deleted the good renderContent too!"
    exit 1
}

# Save
Set-Content -Path $path -Value $newContent -Encoding UTF8
Write-Output "Cleanup completed."
