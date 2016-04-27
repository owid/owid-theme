<?php


add_action( 'widgets_init', 'home_nav_grid_init' );
function home_nav_grid_init() {
	register_widget( 'Home_Grid_Nav_Widget' );
}

class Home_Grid_Nav_Widget extends WP_Widget {
	public function __construct() {
		$widget_details = array(
			'classname' => 'Home_Grid_Nav_Widget',
			'description' => 'Our World in Data home index'
		);
		parent::__construct( 'Home_Grid_Nav_Widget', 'Home Grid Nav Widget', $widget_details );
 	}

 	public function form($instance) {
 		// Backend Form
 	}

 	public function update($new_instance, $old_instance) {  
 		return $new_instance;
 	}

 	public function widget($args, $instance) {
		$html = "";

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


		/*$html .= "<div class='owid-blog'><h2>Life Expectancy</h2><time></time><p>Life expectancy has increased rapidly since the Enlightenment. Estimates suggest that in a pre-modern, poor world, life expectancy was around 30 years in all regions of the world. In the early 19th century, life expectancy started...</p><div><a>Read more...</a></div><hr></div>";*/


		$html .= "<div class='owid-data'>";
		$html .= "<div class='separator'><h2><span>Data Entries</span></h2><p>Research and visualisations by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p></div>";

		$html .= '<ul>';
		$category = null;

		foreach ($pages as $page) {
			// HACK (Mispy): Identify top-level categories by whether they start with a number. */
			if (preg_match('/^\d+/', $page->post_title)) {
				if ($category)
					$html .= "</div></li>";

				$category = preg_replace('/^\d+/', '', $page->post_title);
				$html .= "<li>"
					  .	     "<h3><span>" . $category . "</span></h3>"
					  .		 "<div class='link-container'>";
			} else {
				/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
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
			  .	 "<a href='/VisualHistoryOf/Poverty.html'>World Poverty</a>"
			  .	 "<a href='/VisualHistoryOf/Health.html'>Global Health</a>"
			  .	 "<a href='/VisualHistoryOf/Hunger.html'>World Hunger & Food Provision</a>"
			  .	 "<a href='/VisualHistoryOf/AfricaInData.html'>Africa</a>";

		$html .= "</div></li></ul></div>";

		echo($html);
 	}
 
}
