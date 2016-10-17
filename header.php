<?php
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<title><?php 
		if (!is_front_page()) {
			
			$title = get_the_title();
			if (is_home())
				$title = "Blog";

			if ($title) {
				echo $title;
				echo " - "; 
			}		
		}

		bloginfo('name');
	?></title>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="cache-control" content="max-age=0">
	
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<?php if ( is_singular() && pings_open( get_queried_object() ) ) : ?>
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<?php endif; ?>
	<?php wp_head(); ?>


	<link rel="stylesheet" type="text/css" media="all" href="<?php 
		echo get_stylesheet_uri();
    	echo '?v='.filemtime(get_stylesheet_directory() . '/style.css'); 
    ?>">
    <link rel="stylesheet" type="text/css" href="/wp-includes/css/admin-bar.min.css?ver=4.6.1">
    <link rel="stylesheet" type="text/css" href="/wp-includes/css/dashicons.min.css?ver=4.6.1">

	<!-- Hide until JS rendering -->
	<style>
	    body { visibility: hidden; }
	</style>

	<noscript>
	    <style>
	          body { visibility: inherit; }
	    </style>
	</noscript>

	<script>
		window.$ = jQuery;
	</script>
</head>

<body <?php body_class(); ?>>
	<header class="site-header">
<?php 
function owid_header() {
	$title = "Our World In Data";

	$categories = get_entries_by_category();

	$html = <<<EOT
	<nav id="owid-topbar">
		<ul class="desktop right">
			<li>
				<form id="search-nav" action="https://google.com/search" method="GET">
					<input type="hidden" name="sitesearch" value="ourworldindata.org">
					<input type="search" name="q" placeholder="Search...">
					<button type="submit">
						<i class="fa fa-search"></i>
					</button>
				</form>
			</li>
			<li>
				<a href="/blog">Blog</a>
			</li>
			<li>
				<a href="/about">About</a>
			</li>
			<li>
				<a href="/support">Donate</a>
			</li>
		</ul>

		<h1 id="owid-title">
			<a href="/"><i class="fa fa-globe"></i><span>$title</span></a>
		</h1>

		<ul class="mobile right">
			<li class="nav-button">
				<a href="/search" data-expand="#search-dropdown"><i class='fa fa-search'></i></a>
			</li><li class="nav-button">
				<a href="/data" data-expand="#topics-dropdown" class='mobile'><i class='fa fa-bars'></i></a>
			</li>
		</ul>
	</nav>

	<div id="topics-dropdown" class="mobile">
		<ul>
			<li class="header"><h2>Entries</h2></li>
EOT;

	foreach ($categories as $category) {
		$html .= "<li class='category'>"
			  	 . "<a><span>" . $category->name . "</span></a>"		 	
				 . "<div class='subcategory-menu'>"
				 	. "<div class='submenu-title'>" . $category->name . "</div>"
				 	. "<ul>";

		foreach ($category->pages as $page) {
			/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<li><a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			} else {
				$html .= "<li><a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			}				
		}

		$html .= "</ul></div></li>"; // Close off previous category
	}

	$html .= <<<EOT
			<li class='end-link'><a href='/about'>About</a></li>
			<li class='end-link'><a href='/support'>Donate</a></li>
			<li class='end-link'><a href='/data'>Browse All</a></li>
		</ul>
	</div>

	<div id="search-dropdown" class="mobile">
		<form action="/">
			<input type="search" name="s" placeholder="Search...">
			<button type="submit">
				<i class="fa fa-search"></i>
			</button>
		</form>
	</div>		

	<div id="category-nav" class="desktop"><ul>
EOT;

	foreach ($categories as $category) {
			$html .= "<li class='category' title='" . $category->name . "'>"
				  	 . "<a><span>" . $category->name . "</span></a>"		 	
					 . "<ul class='entries'><li><hr></li>";

		foreach ($category->pages as $page) {
			/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<li><a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			} else {
				$html .= "<li><a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			}				
		}

		$html .= "</ul></li>"; // Close off previous category
	}

	$html .= <<<EOT
	</ul></div>
	<div id="entries-nav" class="desktop"></div>
EOT;

	echo($html);
}

owid_header();
?>
	</header>

<main id="main" class="site-main">