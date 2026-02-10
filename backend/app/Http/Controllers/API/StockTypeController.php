<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockType;
use Illuminate\Http\Request;

class StockTypeController extends Controller
{
    public function index()
    {
        return response()->json(StockType::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:stock_types,name|max:255',
        ]);

        $stockType = StockType::create($validated);

        return response()->json([
            'message' => 'Stock type created successfully',
            'data' => $stockType
        ], 201);
    }

    public function destroy($id)
    {
        $stockType = StockType::find($id);

        if (!$stockType) {
            return response()->json(['message' => 'Stock type not found'], 404);
        }

        $stockType->delete();

        return response()->json(['message' => 'Stock type deleted successfully']);
    }

    public function update(Request $request, $id)
    {
        $stockType = StockType::find($id);

        if (!$stockType) {
            return response()->json(['message' => 'Stock type not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:stock_types,name,' . $id,
        ]);

        $stockType->update($validated);

        return response()->json([
            'message' => 'Stock type updated successfully',
            'data' => $stockType
        ]);
    }
}
