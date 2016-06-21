<?php
//* Set Localization (do not remove)
load_child_theme_textdomain('owid', apply_filters('child_theme_textdomain', get_stylesheet_directory() . '/languages', 'owid'));
//* Include Section Image CSS
include_once(get_stylesheet_directory() . '/lib/output.php');

//* Enqueue scripts and styles
$template_dir = get_stylesheet_directory_uri();
wp_enqueue_style('fontello-custom', $template_dir . '/css/fontello.css');
wp_enqueue_style('font-awesome-owid', $template_dir . '/css/font-awesome.min.css');
wp_enqueue_script("scrollNav", $template_dir . "/js/jquery.scrollNav.js", null, null, true);
wp_enqueue_script("scripts", $template_dir . "/js/scripts.js", null, '?v=' . filemtime(get_stylesheet_directory() . '/js/scripts.js'), true);

// Increase the number of search results on the search page
$search_results_per_page = 20;
function set_posts_per_page($query) {
	global $search_results_per_page;
	if ($query->is_search) {
		$query->query_vars['posts_per_page'] = $search_results_per_page;
	}
	return $query;
}
add_action('pre_get_posts', 'set_posts_per_page');

/* HACK (Mispy): Just redirect back to the front page if it's an empty search. */
function search_redirect($query) {
		if (!is_admin() && $query->is_main_query()) {
			$searchQuery = get_search_query();
		if ($query->is_search && empty($searchQuery)) {
    		wp_redirect(home_url()); 
    		exit;
		}
		}
}
add_action('pre_get_posts', 'search_redirect');	

/* MISPY: Output a nice listing of all the data entries for /data. */
function owid_pages() {
	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);


	$html = "<div class='owid-data'>";
	$html .= "<div class='separator'><h1><span>Data Entries</span></h1><hr><p>Ongoing collections of research and data by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p></div>";

	$html .= '<ul>';
	$category = null;

	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number. */
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</div></li>";

			$category = preg_replace('/^\d+/', '', $page->post_title);
			$html .= "<li>"
				  .	     "<h4>" . $category . "</h4>"
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

	echo($html);
}
add_shortcode('owid_pages', 'owid_pages');

?>