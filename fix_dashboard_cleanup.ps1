
$path = "c:\Users\Ryan Handani\Documents\Coding\Stock_Area\frontend\src\pages\AdminDashboard.jsx"
$content = Get-Content $path -Raw

# Deletion 1: Duplicate Editing, Stock, Account States (Lines ~169-198)
# Context: Starts with "// Editing State (Modal)" and ends before "// Add Store Form State"
# We match loosely to capture the blocks.
$regex1 = "(?ms)\s*// Editing State \(Modal\)\s*const \[editingStock.*?\s*// Add Stock Form State.*?\s*// Add Account Form State.*?\s*isLoading: false,\s*\}\);\s*(?=// Add Store Form State)"
if ($content -match $regex1) {
    Write-Host "Found Duplicate States Block 1 (Editing/Stock/Account). Removing..."
    $content = $content -replace $regex1, ""
} else {
    Write-Host "Block 1 not found."
}

# Deletion 2: Duplicate Stock Type State (Lines ~234-236)
# Context: Starts with "// Stock Type State" and ends before "// Edit Product State"
$regex2 = "(?ms)\s*// Stock Type State\s*const \[stockTypes.*?\s*const \[addStockTypeForm.*?\}\);\s*(?=// Edit Product State)"
if ($content -match $regex2) {
    Write-Host "Found Duplicate Stock Type State Block. Removing..."
    $content = $content -replace $regex2, ""
} else {
    Write-Host "Block 2 not found."
}

# Deletion 3: Duplicate Effects (Lines ~252-325)
# Context: Starts with "// Fetch Initial Data (Stores, Products, StockTypes)" and ends with the closing of the fetchCurrentStock effect.
# The last effect ends with `}, [addStockForm.storeId, addStockForm.skuCode]);`
$regex3 = "(?ms)\s*// Fetch Initial Data \(Stores, Products, StockTypes\).*?\}\s*,\s*\[addStockForm\.storeId, addStockForm\.skuCode\]\);\s*"
if ($content -match $regex3) {
    Write-Host "Found Duplicate Effects Block. Removing..."
    $content = $content -replace $regex3, ""
} else {
    Write-Host "Block 3 not found."
}

$content | Set-Content $path -Encoding UTF8
Write-Host "Cleanup complete."
