<!DOCTYPE html>
<html lang="en">

	<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base Tempelate</title>
    <meta name="author" content="Sterco Digitex">
  </head>

	<body>
		@include('includes.header')

		<!-- Main Content -->
		<main class="main">
			@isset($name)
                {!! $name !!}
            @endisset
		</main>

		@include('includes.footer')

	</body>
</html>