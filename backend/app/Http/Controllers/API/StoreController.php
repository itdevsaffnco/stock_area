<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index()
    {
        // Return all stores for dropdowns
        // Or return hierarchical structure?
        // Let's return flat list, frontend can filter
        return response()->json(Store::all());
    }

    public function getHierarchy()
    {
        // Helper for waterfall
        $provinces = Store::select('province')->distinct()->get()->pluck('province');
        return response()->json([
            'provinces' => $provinces
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'channel' => 'required|string|max:255',
            'sub_channel' => 'required|string|max:255',
        ]);

        $store = Store::create($validated);

        return response()->json([
            'message' => 'Store created successfully',
            'data' => $store
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $store = Store::find($id);
        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'channel' => 'required|string|max:255',
            'sub_channel' => 'required|string|max:255',
        ]);

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'data' => $store
        ]);
    }

    public function destroy($id)
    {
        $store = Store::find($id);
        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $store->delete();

        return response()->json(['message' => 'Store deleted successfully']);
    }
}
