<?php

namespace App\Http\Controllers\Frontend;

use App\Models\ModuleEntry;
use App\Models\Page;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FrontendController extends Controller
{
    public function cmsPages($slug)
    {
        $page = Page::published()->where('page_type', 'cms')->bySlug($slug)->firstOrFail();
        $page->load('sections');

        return view('pages.show', [
            'page' => $page,
            'renderedHtml' => $page->getRenderedHtml(),
            'sectionsHtml' => $page->getRenderedHtmlBySections(),
        ]);
    }

    public function modularPages($slug)
    {
        $bannerOne = ModuleEntry::getData(42)->where('slug', 'banner-one')->first();
        $page = Page::published()
            ->where('page_type', 'modular')
            ->bySlug($slug)
            ->firstOrFail();

        $viewData = $page->getModularPageData();

        if (request()->wantsJson()) {
            return response()->json(array_merge([
                'page' => ['id' => $page->id, 'title' => $page->title ?? null, 'slug' => $page->slug ?? null],
            ], $viewData));
        }

        return $viewData;


        return view('modular.' . $slug, array_merge([
            'page' => $page,
        ], $viewData));
    }
}