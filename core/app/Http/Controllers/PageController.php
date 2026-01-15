<?php
namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $pages = Page::when($search, function($query, $search) {
            return $query->where('title', 'like', "%{$search}%")
                       ->orWhere('slug', 'like', "%{$search}%");
        })
        ->withCount('sections')
        ->orderBy('id', 'desc')
        ->paginate(10)
        ->withQueryString()
        ->through(function ($page) {
            return [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'sections_count' => $page->sections_count,
                'is_published' => $page->is_published,
                'created_at' => $page->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('Page/Index', [
            'pages' => $pages,
            'searchTerm' => $search ?? '',
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Page/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:pages,slug',
                'regex:/^\/?[a-z0-9]+(?:[-\/][a-z0-9]+)*$/i',
            ],
            'page_type' => 'required|in:cms,modular',
            'is_published' => 'boolean',
        ]);

        // Handle slug generation
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            if (Page::where('slug', $validated['slug'])->exists()) {
                return back()
                    ->withErrors(['slug' => 'The generated slug already exists. Please enter a unique slug.'])
                    ->withInput();
            }
        }

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'page_type' => $validated['page_type'],
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()->route('pages.index')->with('success', 'Page created successfully!');
    }

    public function show(Page $page)
    {
        return Inertia::render('Page/Show', [
            'page' => $page->load(['sections' => function($query) {
                $query->orderBy('order');
            }])
        ]);
    }

    public function edit(Request $request, Page $page)
    {
        return Inertia::render('Page/Edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:pages,slug,' . $page->id,
                'regex:/^\/?[a-z0-9]+(?:[-\/][a-z0-9]+)*$/i',
            ],
            'page_type' => 'required|in:cms,modular',
            'is_published' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            $exists = Page::where('slug', $validated['slug'])
                ->where('id', '!=', $page->id)
                ->exists();

            if ($exists) {
                return back()
                    ->withErrors(['slug' => 'The generated slug already exists. Please enter a unique slug.'])
                    ->withInput();
            }
        }

        $page->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'page_type' => $validated['page_type'],
            'is_published' => $validated['is_published'] ?? false,
        ]);


        return redirect()->route('pages.index')->with('success', 'Page updated successfully!');
    }

    public function destroy(Page $page)
    {
        $page->sections()->detach();
        $page->delete();

        return redirect()->route('pages.index')
            ->with('success', 'Page deleted successfully!');
    }

    public function togglePublish(Page $page)
    {
        $page->update([
            'is_published' => !$page->is_published
        ]);

        return redirect()->back()->with('success', 'Page publication status updated successfully!');
    }
}