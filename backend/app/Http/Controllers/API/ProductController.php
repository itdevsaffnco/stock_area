<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku_code' => 'required|string|unique:products,sku_code',
            'sku_name' => 'required|string',
            'ml' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|string',
            'channel_distribution' => 'nullable|string',
            'pricing_rsp' => 'nullable|numeric',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'sku_code' => 'required|string|unique:products,sku_code,' . $id,
            'sku_name' => 'required|string',
            'ml' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|string',
            'channel_distribution' => 'nullable|string',
            'pricing_rsp' => 'nullable|numeric',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
