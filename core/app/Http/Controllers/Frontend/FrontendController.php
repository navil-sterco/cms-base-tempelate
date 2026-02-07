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
        $page = Page::published()->where('page_type','cms')->bySlug($slug)->firstOrFail();
        
        return view('pages.show', [
            'page' => $page,
            'renderedHtml' => $page->getRenderedHtml()
        ]);
    }

    public function modularPages($slug)
    {
        $entries = ModuleEntry::getData(13);
        return $entries;

        $page = Page::published()
            ->with(['degrees', 'sections' => function($query) {
                $query->orderBy('order');
            }])
            ->where('page_type', 'modular')
            ->bySlug($slug)
            ->firstOrFail();

        $sectionsData = $page->sections->mapWithKeys(function ($section) use($page) {
            return [$section->identifier => $page->getSectionHtml($section)];
        })->toArray();

        return view('modular.' . $slug, array_merge([
            'page' => $page,
            'degrees' => $page->degrees,
        ], $sectionsData));
    }
}
