<?php

namespace App\Http\Controllers\Frontend;

use App\Models\Page;
use App\Models\ModuleEntry;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FrontendController extends Controller
{
    public function cmsPages($slug)
    {
        $page = Page::published()->where('page_type', 'cms')->bySlug($slug)->firstOrFail();

        return view('pages.show', [
            'page' => $page,
            'renderedHtml' => $page->getRenderedHtml()
        ]);
    }

    public function modularPages($slug)
    {
        $entries = ModuleEntry::getData(26);
        $page = Page::published()
            ->where('page_type', 'modular')
            ->bySlug($slug)
            ->firstOrFail();
    
        $viewData = $page->getModularPageData();
    
        return $viewData; // for API
        return view('modular.' . $slug, array_merge([
                'page' => $page,
        ], $viewData));
    }
}