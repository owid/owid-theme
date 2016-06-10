<?php
/**
 * This file adds the Home Page to the Parallax Pro Theme.
 *
 * @author StudioPress
 * @package Parallax
 * @subpackage Customizations
 */

add_action( 'genesis_meta', 'parallax_home_genesis_meta' );
/**
 * Add widget support for homepage. If no widgets active, display the default loop.
 *
 */
function parallax_home_genesis_meta() {

	if ( is_active_sidebar( 'home-section-1' ) || is_active_sidebar( 'home-section-2' ) || is_active_sidebar( 'home-section-3' ) || is_active_sidebar( 'home-section-4' ) || is_active_sidebar( 'home-section-5' ) ) {
		//* Add parallax-home body class
		add_filter( 'body_class', 'parallax_body_class' );
		function parallax_body_class( $classes ) {
		
   			$classes[] = 'parallax-home';
  			return $classes;
  			
		}

		//* Force full width content layout
		add_filter( 'genesis_pre_get_option_site_layout', '__genesis_return_full_width_content' );

		//* Remove primary navigation
		remove_action( 'genesis_before_content_sidebar_wrap', 'genesis_do_nav' );

		//* Remove breadcrumbs
		remove_action( 'genesis_before_loop', 'genesis_do_breadcrumbs');

		//* Remove the default Genesis loop
		remove_action( 'genesis_loop', 'genesis_do_loop' );

		//* Add homepage widgets
		add_action( 'genesis_loop', 'parallax_homepage_widgets' );

	}
}

//* Add markup for homepage widgets
function parallax_homepage_widgets() {
	$html = "";

	$html .= <<<EOT
<div id="homepage-cover">
	<div class="lead-in">
		<h1 class="desktop">Our World In Data</h1>
		<div class="desktop subheading" style="font-family: Georgia;">Data visualisations and empirical research that tell you how and why living conditions around the world are changing.</div>
		<div class="mobile subheading">Living conditions around the world are changing rapidly. Explore how and why.</div>
		<img class="down-arrow" src="http://ourworldindata.org/wp-content/uploads/2015/01/oldOWID_arrowdown.png" alt=“Y" style=“height:40px">
		<div class="title-author-byline">A web publication by <a href="http://www.MaxRoser.com/about" target="_blank">Max Roser</a>.</div>
	</div>
</div>
EOT;


		/* First thing on the home page is a short list of blog posts indicating various updates */
		$posts = get_posts([ 			

		]);

		$html .= "<br><div class='owid-updates'>"
			  .	 "    <ul>";

	query_posts('posts_per_page=3');
		if (have_posts()) {
			while (have_posts()) {
				the_post();
 			// If a manually defined excerpt is available, make sure to use that
 			$excerpt = get_post()->post_excerpt;
 
 			if (!$excerpt) {
 				// Autogenerate an excerpt containing the first sentence and first graphic in the post.
 				$excerpt = "<p>";

 				$content = get_the_content();
 				$inTag = false;
 				$inSentence = false;
 				for ($i = 0; $i < strlen($content); $i++) {
 					$ch = $content[$i];

 					if ($ch == '<') $inTag = true;
 					if ($ch == '>') $inTag = false;

 					if (!$inTag && preg_match('/[A-Z]/', $ch))
 						$inSentence = true;

 					if ($inSentence)
 						$excerpt .= $ch;

 					if (!$inTag && preg_match('/[.!?]/', $ch))
 						break;
 				}

 				$excerpt .= " <a class='read-more' href='" . get_the_permalink() . "'>(more)</a>";
 				$excerpt .= "</p>";

	 			preg_match("/(<img[^>]*>|<iframe.*?<\/iframe>)/", get_the_content($post), $matches);
	 			if (sizeof($matches) > 0) {
	 				if (preg_match("/(<img[^>]*)>/", $matches[0])) {
	 					// Link <img>s to the post
		 				$excerpt .= "<a href='" . get_the_permalink() . "'>" . $matches[0] . "</a>";
	 				} else {
	 					// Iframes can't be linked, sadly
	 					$excerpt .= $matches[0];
	 				}
	 			}
 			}

 			$html .= "<li class='post'>"
 				  .	 "    <h3><a href='" . get_the_permalink() . "'>" . get_the_title() . "</a></h3>"
 				  .	 "    <div class='entry-meta'><time>" . get_the_date("d M") . "</time> by <span>" . get_the_author() . "</span></div>"
 				  .  "    <div class='entry-content'>" . $excerpt . "</div>";
 			$html .= "</li>";
			}
		}

		$html .= "</ul><br><hr></div>";

		/* Now we make the big data entries listing */
	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);


	$html .= "<div class='owid-data'>";
	$html .= "<div class='separator'><h2><span>Data Entries</span></h2><p>Research and visualisations by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p></div>";

	$html .= '<ul>';
	$category = null;

	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number.
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</div></li>";

			$category = preg_replace('/^\d+/', '', $page->post_title);
			$html .= "<li>"
				  .	     "<h3><span>" . $category . "</span></h3>"
				  .		 "<div class='link-container'>";
		} else {
			// NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin 
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a>";
			} else {
				$html .= "<a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a>";
			}
		}
	}

	$html .= "</ul></div>";
	
	$html .= "<div class='owid-data owid-presentations'>"
		  .	     "<h2>Presentations</h2>"
		  .		 "<p>Visual histories spanning multiple topics.</p>"
		  .		 "<ul>";

    $html .= "<li><h3>Visual History of...</h3>"
          .  "<div class='link-container'>";

    $html .= "<a href='/VisualHistoryOf/Violence.html'>War & Violence</a>"
          .  "<a href='/VisualHistoryOf/Poverty.html'>World Poverty</a>"
          .  "<a href='/VisualHistoryOf/Health.html'>Global Health</a>"
          .  "<a href='/VisualHistoryOf/Hunger.html'>World Hunger & Food Provision</a>"
          .  "<a href='/VisualHistoryOf/AfricaInData.html'>Africa</a>";

    $html .= "</div></li></ul></div>";


	echo($html);
}

genesis();
