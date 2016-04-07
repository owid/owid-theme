<?php
	/*
		Template Name: Search results
		Author: Zdenek Hynek, zdenek.hynek@gmail.com
	*/

	/**
	 * modified version of genesis/search.php
	 */

	add_action( 'genesis_before_loop', 'genesis_do_search_title' );
	function genesis_do_search_title() {
		$title = sprintf( '<div class="search-results-header"><h1>%s <em>%s</em></h1></div>', apply_filters( 'genesis_search_title_text', __( 'Search Results for:', 'genesis' ) ), get_search_query() );
		echo apply_filters( 'genesis_search_title_output', $title ) . "\n";
	}

	remove_action('genesis_loop', 'genesis_do_loop');
	add_action('genesis_loop', 'custom_loop');
	
	function custom_loop() { 
		
		global $search_results_per_page;

		//vars for load more btn
		$search_term = (!empty($_REQUEST["s"])) ? $_REQUEST["s"]: "";
		$search_page_url = home_url( "?s=" .$search_term ); 
		$orderby = (!empty($_REQUEST["orderby"])) ? $_REQUEST["orderby"]: "";
		$ajax_url = admin_url("admin-ajax.php");

		?>
		<div class="search-results">
			<?php 
			if (have_posts()) :
				while (have_posts()) : the_post(); 
					//exclude list of topics (4723), and data sitemap (621)
					$pages_to_exclude = array( "4723", "621" );
					if( in_array( get_the_id(), $pages_to_exclude ) ) {
						continue;	
					}
				?>
				<div class="post type-post search-post hentry">
					<h2 class="search-entry-title entry-title"><a href="<?php echo get_permalink(); ?>" title="<?php the_title(); ?>" rel="bookmark"><?php the_title(); ?></a></h2>
					<div class="entry-summary">
						<div class="prod-list-content">
							<a class="more-link" href="<?php the_permalink(); ?>" alt="<?php the_title(); ?>" >
								<?php the_excerpt(); ?>
							</a>
						</div><!-- .prod-list-content -->
					</div><!-- .entry-summary -->
				</div><!-- .post -->
				 
			<?php 
				endwhile; 
			endif; 
			?>
	
		</div><!-- .search-results -->

		<!-- add load more btn //not used at the moment -->
		<!--<div class="row">
			<div class="col-xs-12 load-more">
				<a href="#" class="load-more-btn" class="btn btn-load-posts" data-ajax-url="<?php echo $ajax_url; ?>"  data-search-query="<?php echo $search_term; ?>" data-paged="2" data-orderby="<?php echo $orderby; ?>" data-posts-per-page="<?php echo $search_results_per_page; ?>">Load more articles</a>
			</div>
		</div>-->

		<?php echo genesis_posts_nav(); ?>

	<?php
	}
genesis();
?>
