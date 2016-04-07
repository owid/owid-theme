<?php



add_action( 'widgets_init', 'home_nav_grid_init' );
function home_nav_grid_init() {
	register_widget( 'Home_Grid_Nav_Widget' );
}
add_filter( 'nav_grid_title_filter', 'home_nav_grid_title_filter', 1, 2 );
function home_nav_grid_title_filter( $title, $has_children ) {
	$full_title = $title;
	if( $has_children ) {
		//check if first word is number and if yes, remove it
		$words = explode( ' ', $title );
		if( count( $words ) > 0 ) {
			$first_word = $words[ 0 ];
			if( is_numeric( $first_word ) ) {
				$digit = $words[ 0 ];
				unset( $words[ 0 ] );
				$full_title = '<span class="nav-grid-digit">' . $digit . '</span><span class="nav-grid-title">' .implode( ' ', $words ). '</span>';
			}
		}
	}
	return $full_title;
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
 		// Frontend display HTML
 		echo "<div class='home-nav-grid-wrapper'>";
 			echo "<ol class='clearfix'>";
	 			wp_list_pages( 
	 				array( 
	 					'child_of' => 621, 
	 					'title_li' => '', 
	 					'link_after' => ',',
	 					'walker' => new Home_Nav_Grid_Walker,
	 					'echo' => true
	 				) 
	 			);
 			echo "</ol>";
 		echo "</div>";
 	}
 
}

/**
 * Create HTML list of pages.
 *
 * @since 2.1.0
 * @uses Walker
 */
class Home_Nav_Grid_Walker extends Walker {
	/**
	 * @see Walker::$tree_type
	 * @since 2.1.0
	 * @var string
	 */
	public $tree_type = 'page';

	/**
	 * @see Walker::$db_fields
	 * @since 2.1.0
	 * @todo Decouple this.
	 * @var array
	 */
	public $db_fields = array ('parent' => 'post_parent', 'id' => 'ID');

	/**
	 * @see Walker::start_lvl()
	 * @since 2.1.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int $depth Depth of page. Used for padding.
	 * @param array $args
	 */
	public function start_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "\n$indent<ul class='children'>\n";
	}

	/**
	 * @see Walker::end_lvl()
	 * @since 2.1.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int $depth Depth of page. Used for padding.
	 * @param array $args
	 */
	public function end_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "$indent</ul>\n";
	}

	/**
	 * @see Walker::start_el()
	 * @since 2.1.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param object $page Page data object.
	 * @param int $depth Depth of page. Used for padding.
	 * @param int $current_page Page ID.
	 * @param array $args
	 */
	public function start_el( &$output, $page, $depth = 0, $args = array(), $current_page = 0 ) {
		if ( $depth ) {
			$indent = str_repeat( "\t", $depth );
		} else {
			$indent = '';
		}
		$css_class = array( 'page_item', 'page-item-' . $page->ID );

		if ( isset( $args['pages_with_children'][ $page->ID ] ) ) {
			$css_class[] = 'page_item_has_children';
		}

		var_dump($page->ID);
		/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
		$isStarred = get_post_meta($page->ID, '_ino_star', true);
		if ($isStarred) {
			$css_class[] = 'starred';
		}

		if ( ! empty( $current_page ) ) {
			$_current_page = get_post( $current_page );
			if ( $_current_page && in_array( $page->ID, $_current_page->ancestors ) ) {
				$css_class[] = 'current_page_ancestor';
			}
			if ( $page->ID == $current_page ) {
				$css_class[] = 'current_page_item';
			} elseif ( $_current_page && $page->ID == $_current_page->post_parent ) {
				$css_class[] = 'current_page_parent';
			}
		} elseif ( $page->ID == get_option('page_for_posts') ) {
			$css_class[] = 'current_page_parent';
		}

		/**
		 * Filter the list of CSS classes to include with each page item in the list.
		 *
		 * @since 2.8.0
		 *
		 * @see wp_list_pages()
		 *
		 * @param array   $css_class    An array of CSS classes to be applied
		 *                             to each list item.
		 * @param WP_Post $page         Page data object.
		 * @param int     $depth        Depth of page, used for padding.
		 * @param array   $args         An array of arguments.
		 * @param int     $current_page ID of the current page.
		 */
		$css_classes = implode( ' ', apply_filters( 'page_css_class', $css_class, $page, $depth, $args, $current_page ) );

		if ( '' === $page->post_title ) {
			$page->post_title = sprintf( __( '#%d (no title)' ), $page->ID );
		}

		$args['link_before'] = empty( $args['link_before'] ) ? '' : $args['link_before'];
		$args['link_after'] = empty( $args['link_after'] ) ? '' : $args['link_after'];
		
		/** This filter is documented in wp-includes/post-template.php */
		$output .= $indent . sprintf(
			'<li class="%s"><a href="%s">%s%s%s</a>',
			$css_classes,
			get_permalink( $page->ID ),
			$args['link_before'],
			//custom modification of the default Walker_Page
			apply_filters( 'nav_grid_title_filter', apply_filters( 'the_title', $page->post_title, $page->ID ), isset( $args['pages_with_children'][ $page->ID ] ) ),
			( !isset( $args['pages_with_children'][ $page->ID ] ) )? '': ''
		);

		if ( ! empty( $args['show_date'] ) ) {
			if ( 'modified' == $args['show_date'] ) {
				$time = $page->post_modified;
			} else {
				$time = $page->post_date;
			}

			$date_format = empty( $args['date_format'] ) ? '' : $args['date_format'];
			$output .= " " . mysql2date( $date_format, $time );
		}
	}

	/**
	 * @see Walker::end_el()
	 * @since 2.1.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param object $page Page data object. Not used.
	 * @param int $depth Depth of page. Not Used.
	 * @param array $args
	 */
	public function end_el( &$output, $page, $depth = 0, $args = array() ) {
		$output .= "</li>\n";
	}

}