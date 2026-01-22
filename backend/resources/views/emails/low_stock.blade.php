<!DOCTYPE html>
<html>
<head>
    <title>Low Stock Alert</title>
</head>
<body>
    <h1>Low Stock Alert</h1>
    <p>Product <strong>{{ $productName }}</strong> at Store <strong>{{ $storeName }}</strong> is running low.</p>
    <p>Current Stock: <span style="color: red; font-weight: bold;">{{ $stock }}</span></p>
    <p>Please restock immediately.</p>
</body>
</html>
