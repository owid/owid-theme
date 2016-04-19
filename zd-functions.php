<?php 

	//global vars
	$search_results_per_page = 20;

	//add script for load more btn
	add_action( "wp_enqueue_scripts", 'enqueue_frontend_scripts' );
	function enqueue_frontend_scripts() {
		$template_dir = get_stylesheet_directory_uri();
		wp_enqueue_script( "scrollNav", $template_dir."/js/jquery.scrollNav.js", null, null, true );
		wp_enqueue_script( "scripts", $template_dir."/js/scripts.js", null, null, true );
		//not used at the moment
		/*if( is_search() ) {
			wp_enqueue_script( "search", $template_dir."/js/search.js", null, null, true );
		}*/
	}

	add_filter( 'genesis_search_text', 'sp_search_text' );
	function sp_search_text( $text ) {
	   return esc_attr( 'Poverty, violence, health...' );
	}

	add_action( 'pre_get_posts',  'set_posts_per_page'  );
	function set_posts_per_page( $query ) {
		global $search_results_per_page;
		// Make sure it is a search page
		if ( $query->is_search ) {
			$query->query_vars[ 'posts_per_page' ] = $search_results_per_page;
		}
		return $query;
	}

	add_action( 'wp_ajax_load_search_results', 'load_search_results' );
	add_action( 'wp_ajax_nopriv_load_search_results', 'load_search_results' );

	function load_search_results() {
		
		global $post;

		$query = $_POST['query'];
		$posts_per_page = $_POST['posts_per_page'];
		$paged = $_POST['paged'];
		$orderby = ( !empty($_POST["orderby"]) ) ? $_POST["orderby"]: "";

		$args = array(
			'post_status' => 'publish',
			'posts_per_page' => $posts_per_page,
			'paged' => $paged,
			's' => $query,
			'orderby' => $orderby
		);

		function custom_excerpt_length( $length ) {
			return 15;
		}
		add_filter( 'excerpt_length', 'custom_excerpt_length', 999 );

		$search = new WP_Query( $args );

		ob_start();

		if ( $search->have_posts() ) : 
		?>

			<?php
				while ( $search->have_posts() ) : $search->the_post();
					get_template_part( 'search', 'item' );
				endwhile;
				
				else :
		endif;

		$content = ob_get_clean();

		echo $content;
		die();
		
	}


	/* HACK (Mispy): Add starred class to menu items for pages starred by Admin Starred Posts plugin. */
	function star_menu_items($classes, $item, $args) {
		$isStarred = get_post_meta($item->ID, '_ino_star', true);
		if ($isStarred)
			$classes[] = 'starred';
		return array_unique($classes);
	}
	add_filter('nav_menu_css_class', 'star_menu_items', 10, 3);

	/* HACK (Mispy): Just redirect back to the front page if it's an empty search. */
	function search_redirect($query) {
   		if ( !is_admin() && $query->is_main_query() ) {
    			if ($query->is_search && empty(get_search_query())) {
       		    		wp_redirect( home_url() ); exit;
        		}
  		}
	}
	add_action('pre_get_posts','search_redirect');
	
?>