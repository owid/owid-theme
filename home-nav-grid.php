<?php


add_action( 'widgets_init', 'home_nav_grid_init' );
function home_nav_grid_init() {
	register_widget( 'Home_Grid_Nav_Widget' );
}

class Home_Grid_Nav_Widget extends WP_Widget {
	public function __construct() {
		$widget_details = array(
			'classname' => 'Home_Grid_Nav_Widget',
			'description' => 'http://thewirecutter.com/ like navigation'
		);
		parent::__construct( 'Home_Grid_Nav_Widget', 'Home Grid Nav Widget', $widget_details );
 	}

 	public function form( $instance ) {
 		// Backend Form
 	}

 	public function update( $new_instance, $old_instance ) {  
 		return $new_instance;
 	}

 	public function widget( $args, $instance ) {
		$pages = get_pages([
			'child_of'    => 621,
			'sort_column' => 'menu_order, post_title',
		]);


		$html = "";

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
