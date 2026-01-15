<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use App\Models\Degree;
use Illuminate\Http\Request;

class DegreeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $degree = Degree::filter(['search' => $search])->orderBy('id', 'desc')->paginate(10)->withQueryString()->through(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'short_name' => $item->short_name,
            ];
        });

        return Inertia::render('Degree/Index', [
            'degree' => $degree,
            'searchTerm' => $search ?? '',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Degree/Create'); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:255',
        ]);

        Degree::create($validated);

        return redirect()->route('degree.index')->with('success', 'Degree created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Degree $degree)
    {
        return Inertia::render('Degree/Edit',[
            'degree'=> $degree,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Degree $degree)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:255',
        ]);

        $degree->update($validated);

        return redirect()->route('degree.index')->with('success', 'Degree updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Degree $degree)
    {
        $degree->delete();

        return redirect()->route('degree.index')->with('success', 'Degree Deleted successfully!');
    }

    public function mapping($id)
    {
        $degree = Degree::with(['pages:id,title'])->findOrFail($id);
        $pages = Page::select('id', 'title')->where('page_type','modular')->get();

        return Inertia::render('Degree/Mapping', [
            'degree' => $degree,
            'pages' => $pages,
        ]);
    }

    public function attachMapping(Request $request, $id)
    {
        $degree = Degree::findOrFail($id);

        $validated = $request->validate([
            'page_ids' => 'nullable|array',
            'page_ids.*' => 'exists:pages,id',
        ]);

        $degree->pages()->sync($validated['page_ids'] ?? []);

        return redirect()->route('degree.index', $degree->id)->with('success', 'Degree mapped successfully!');
    }
}
