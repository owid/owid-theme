<?php
//* Set Localization (do not remove)
load_child_theme_textdomain('owid', apply_filters('child_theme_textdomain', get_stylesheet_directory() . '/languages', 'owid'));

/* Remove unnecessary stuff */
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_print_styles', 'print_emoji_styles');

// Disable admin bar for cloudflare caching
add_filter('show_admin_bar', '__return_false');

add_action( 'wp_enqueue_scripts', 'owid_enqueue_scripts_styles' );
function owid_enqueue_scripts_styles() {
	//* Enqueue scripts and styles
	$template_dir = get_stylesheet_directory_uri();
	wp_enqueue_style('owid-theme', get_stylesheet_uri());
	wp_enqueue_style('font-awesome-owid', $template_dir . '/css/font-awesome.min.css');
	// Bootstrap tooltip, for footnotes on hover
	wp_enqueue_script("tooltip", $template_dir . "/js/tooltip.js", null, null, true);
	wp_enqueue_script("scripts", $template_dir . "/js/scripts.js", null, '?v=' . filemtime(get_stylesheet_directory() . '/js/scripts.js'), true);
}



add_theme_support('post-thumbnails');

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

/* MISPY: Send cache control headers for CloudFlare (works in combination with plugin to expire cache) */
add_action('send_headers', 'add_header_cf');
function add_header_cf() {
	header('Pragma: cache');
	header('Cache-Control: public, max-age=0, s-maxage=31536000');
}

function get_entries_by_category() {
	$parent_category = get_categories([
		'name' => 'Entries'
	])[0];

	$categories = get_categories([
		'child_of' => $parent_category->cat_ID
	]);

	$entries_by_category = [];

	foreach ($categories as $category) {
		$pages = get_posts([
			'posts_per_page' => 1000,
			'post_type' => 'page',
			'category' => $category->cat_ID,
			'orderby' => 'menu_order',
			'order' => 'ASC'				
		]);

		$entries_by_category[] = (object)[ 'name' => $category->name, 'pages' => $pages ];
	}

	return $entries_by_category;
}

/* MISPY: Output a nice listing of all the data entries for /data. */
function owid_pages() {
	$html = "<div class='owid-data'>";
	$html .= "<div class='separator'><h1><span>Data Entries</span></h1><hr><p>Ongoing collections of research and data by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p></div>";

	$html .= '<ul>';

	$categories = get_entries_by_category();
	foreach ($categories as $category) {
		$html .= "<li>"
			  .	     "<h4>" . $category->name . "</h4>"
			  .		 "<div class='link-container'>";

		foreach ($category->pages as $page) {
			/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a>";
			} else {
				$html .= "<a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a>";
			}
		}

		$html .= "</div></li>";
	}
	$html .= "</ul></div>";

	echo($html);
}
add_shortcode('owid_pages', 'owid_pages');

?>