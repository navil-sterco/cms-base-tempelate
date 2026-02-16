<!DOCTYPE html>
<html lang="en">

	<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base Tempelate</title>
    <meta name="author" content="Sterco Digitex">

	@if($page->sections)
			@foreach($page->sections as $section)
					@if($section->css_styles)
							<style>
									{!! $section->css_styles !!}
							</style>
					@endif
			@endforeach
	@endif
  </head>

	<body>
		@include('includes.header')

		<!-- Main Content (section-wise: same data as renderedHtml) -->
		<main class="main">
			@if(!empty($sectionsHtml))
				@foreach($sectionsHtml as $sectionHtml)
					{!! $sectionHtml !!}
				@endforeach
			@else
				{!! $renderedHtml !!}
			@endif
		</main>

		@include('includes.footer')

		<!-- Include section-specific JavaScript -->
		@if($page->sections)
			@foreach($page->sections as $section)
				@if($section->javascript)
					<script>
						{!! $section->javascript !!}
					</script>
				@endif
			@endforeach
		@endif
	</body>
</html>