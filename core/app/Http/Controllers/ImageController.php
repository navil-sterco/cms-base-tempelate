<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $image = Image::filter(['search' => $search])->orderBy('id', 'desc')->paginate(12)->withQueryString()->through(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'created_at' => $item->created_at,
                'type' => $item->type,
                'images' => $item->file_path ? asset($item->file_path) : asset('assets/img/placeholder.png')
            ];
        });

        // Return Inertia response for regular page visits
        return Inertia::render('Images/Index', [
            'images' => $image,
        ]);
    }

    public function create()
    {
        return Inertia::render('Images/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'images' => 'required|array|min:1',
            'images.*' => 'required|file|mimes:jpg,jpeg,png,svg,webp|max:4096',
            'type' => 'required|in:image,icon'
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $file) {
            // Generate secure filename
            $extension = $file->getClientOriginalExtension();
            $name = time() . '_' . Str::random(20) . '.' . $extension;
            $filePath = 'assets/img/page-images/' . $name;

            try {
                $file->move(public_path('assets/img/page-images'), $name);

                $image = Image::create([
                    'file_path' => $filePath,
                    'type' => $request->type,
                    'name' => $request->name,
                ]);

                $uploadedImages[] = $image;
            } catch (\Exception $e) {
                // Clean up any already uploaded files if one fails
                foreach ($uploadedImages as $uploadedImage) {
                    if (file_exists(public_path($uploadedImage->file_path))) {
                        unlink(public_path($uploadedImage->file_path));
                    }
                    $uploadedImage->delete();
                }

                return back()->with('error', 'Failed to upload files: ' . $e->getMessage());
            }
        }

        return redirect()->route('images.index')->with('success', 'Images uploaded successfully!');
    }

    public function destroy(Image $image)
    {
        try {
            if (file_exists(public_path($image->file_path))) {
                unlink(public_path($image->file_path));
            }
            $image->delete();

            return redirect()->route('images.index')->with('success', 'Images Deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete image: ' . $e->getMessage());
        }
    }
}