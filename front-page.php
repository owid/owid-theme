<?php
add_action('genesis_meta', 'parallax_home_genesis_meta');
/**
 * Add widget support for homepage. If no widgets active, display the default loop.
 *
 */
function parallax_home_genesis_meta() {
		//* Add parallax-home body class
		add_filter('body_class', 'parallax_body_class');
		function parallax_body_class($classes) {
   			$classes[] = 'parallax-home';
  			return $classes;
		}

		//* Force full width content layout
		add_filter( 'genesis_pre_get_option_site_layout', '__genesis_return_full_width_content' );

		//* Remove the default Genesis loop
		remove_action( 'genesis_loop', 'genesis_do_loop' );

		//* Add homepage widgets
		add_action('genesis_loop', 'owid_homepage');
}

function owid_homepage() {
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
<div id="homepage-content" class="clearfix">
	<h3><a href="/grapher/latest">Latest Visualization</a></h3>
	<iframe src="https://ourworldindata.org/grapher/latest" width="100%" height="660px"></iframe>
EOT;

	// Blog sidebar
	$html .= <<<EOT
	<div id="homepage-blog">
		<h3><a href="/blog">Blog</a></h3>
		<ul>
EOT;

	query_posts('posts_per_page=6');
	if (have_posts()) {
		while (have_posts()) {
			the_post();

 			$html .= "<li class='post'>"
 				  .	 "    <h4><a href='" . get_the_permalink() . "'>" . get_the_title() . "</a></h4>"
 				  .	 "    <div class='entry-meta'><time>" . get_the_date("F d, Y") . "</time></div>";
 			$html .= "</li>";
		}
	}

	$html .= <<<EOT
		</ul>
		<a href="/blog">More →</a>
	</div>
EOT;

	/* Now we make the big data entries listing */
	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);

	$html .= <<<EOT
	<div id="homepage-entries" class="owid-data">
		<h3><a href="/data">Entries</a></h3>		
		<p>Collections of research and data by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p>
		<ul>
EOT;

	$category = null;

	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number.
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</div></li>";

			$category = preg_replace('/^\d+/', '', $page->post_title);
			$html .= "<li class='category'>"
				  .	     "<h4><span>" . $category . "</span></h4>"
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
		  .	     "<h3><a>Presentations</a></h3>"
		  .		 "<p>Visual histories spanning multiple topics.</p>"
		  .		 "<ul>";

    $html .= "<li><h4>Visual History of...</h4>"
          .  "<div class='link-container'>";

    $html .= "<a href='/VisualHistoryOf/Violence.html'>War & Violence</a>"
          .  "<a href='/VisualHistoryOf/Poverty.html'>World Poverty</a>"
          .  "<a href='/VisualHistoryOf/Health.html'>Global Health</a>"
          .  "<a href='/VisualHistoryOf/Hunger.html'>World Hunger & Food Provision</a>"
          .  "<a href='/VisualHistoryOf/AfricaInData.html'>Africa</a>";

    $html .= "</div></li></ul></div>";

    $html .= <<<EOT
    <div id="homepage-twitter">
    	<h3><a href="https://twitter.com/MaxCRoser">Follow us</a></h3>
    	<div class="social">
    		<a href="https://twitter.com/MaxCRoser"><i class="fa fa-twitter"></i></a>
    		<a href="https://www.facebook.com/OurWorldinData"><i class="fa fa-facebook"></i></a>
    	</div>
    	<a class="twitter-timeline" data-height="600" href="https://twitter.com/MaxCRoser">Tweets by MaxCRoser</a> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
    </div>
EOT;

    $html .= "</div>";

	echo($html);
}

genesis();
