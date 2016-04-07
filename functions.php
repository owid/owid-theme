<?php
//* Start the engine
include_once( get_template_directory() . '/lib/init.php' );

//* Setup Theme
include_once( get_stylesheet_directory() . '/lib/theme-defaults.php' );

//* Set Localization (do not remove)
load_child_theme_textdomain( 'parallax', apply_filters( 'child_theme_textdomain', get_stylesheet_directory() . '/languages', 'parallax' ) );

//* Add Image upload to WordPress Theme Customizer
add_action( 'customize_register', 'parallax_customizer' );
function parallax_customizer(){

	require_once( get_stylesheet_directory() . '/lib/customize.php' );
	
}

//* Include Section Image CSS
include_once( get_stylesheet_directory() . '/lib/output.php' );

//* Child theme (do not remove)
define( 'CHILD_THEME_NAME', 'Parallax Pro Theme' );
define( 'CHILD_THEME_URL', 'http://my.studiopress.com/themes/parallax/' );
define( 'CHILD_THEME_VERSION', '1.2' );

//* Enqueue scripts and styles
add_action( 'wp_enqueue_scripts', 'parallax_enqueue_scripts_styles' );
function parallax_enqueue_scripts_styles() {

	wp_enqueue_script( 'parallax-responsive-menu', get_bloginfo( 'stylesheet_directory' ) . '/js/responsive-menu.js', array( 'jquery' ), '1.0.0' );
	wp_enqueue_script( 'jquery-menu-aim', get_bloginfo( 'stylesheet_directory' ) . '/js/jquery.menu-aim.js', array( 'jquery' ), '1.0.0' );

	wp_enqueue_style( 'dashicons' );
	wp_enqueue_style( 'parallax-google-fonts', '//fonts.googleapis.com/css?family=Montserrat|Sorts+Mill+Goudy', array(), CHILD_THEME_VERSION );
	wp_enqueue_style( 'font-awesome-latest', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css' );

}

//* Add HTML5 markup structure
add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );

//* Add viewport meta tag for mobile browsers
add_theme_support( 'genesis-responsive-viewport' );

//* Reposition the primary navigation menu
remove_action( 'genesis_after_header', 'genesis_do_nav' );
add_action( 'genesis_before_content_sidebar_wrap', 'genesis_do_nav' );

//* Reposition the secondary navigation menu
remove_action( 'genesis_after_header', 'genesis_do_subnav' );
add_action( 'genesis_footer', 'genesis_do_subnav', 7 );

//* Reduce the secondary navigation menu to one level depth
add_filter( 'wp_nav_menu_args', 'parallax_secondary_menu_args' );
function parallax_secondary_menu_args( $args ){

	if( 'secondary' != $args['theme_location'] )
	return $args;

	$args['depth'] = 1;
	return $args;

}

//* Unregister layout settings
genesis_unregister_layout( 'content-sidebar-sidebar' );
genesis_unregister_layout( 'sidebar-content-sidebar' );
genesis_unregister_layout( 'sidebar-sidebar-content' );

//* Add support for additional color styles
add_theme_support( 'genesis-style-selector', array(
	'parallax-pro-blue'   => __( 'Parallax Pro Blue', 'parallax' ),
	'parallax-pro-green'  => __( 'Parallax Pro Green', 'parallax' ),
	'parallax-pro-orange' => __( 'Parallax Pro Orange', 'parallax' ),
	'parallax-pro-pink'   => __( 'Parallax Pro Pink', 'parallax' ),
) );

//* Unregister secondary sidebar
unregister_sidebar( 'sidebar-alt' );

//* Add support for custom header
add_theme_support( 'custom-header', array(
	'width'           => 360,
	'height'          => 70,
	'header-selector' => '.site-title a',
	'header-text'     => false,
) );

//* Add support for structural wraps
add_theme_support( 'genesis-structural-wraps', array(
	'header',
	'nav',
	'subnav',
	'footer-widgets',
	'footer',
) );

//* Modify the size of the Gravatar in the author box
add_filter( 'genesis_author_box_gravatar_size', 'parallax_author_box_gravatar' );
function parallax_author_box_gravatar( $size ) {

	return 176;

}

//* Modify the size of the Gravatar in the entry comments
add_filter( 'genesis_comment_list_args', 'parallax_comments_gravatar' );
function parallax_comments_gravatar( $args ) {

	$args['avatar_size'] = 120;

	return $args;

}

//* Add support for 3-column footer widgets
add_theme_support( 'genesis-footer-widgets', 1 );

//* Add support for after entry widget
add_theme_support( 'genesis-after-entry-widget-area' );

//* Relocate after entry widget
remove_action( 'genesis_after_entry', 'genesis_after_entry_widget_area' );
add_action( 'genesis_after_entry', 'genesis_after_entry_widget_area', 5 );

//* Register widget areas
genesis_register_sidebar( array(
	'id'          => 'home-section-1',
	'name'        => __( 'Home Section 1', 'parallax' ),
	'description' => __( 'This is the home section 1 section.', 'parallax' ),
) );
genesis_register_sidebar( array(
	'id'          => 'home-section-2',
	'name'        => __( 'Home Section 2', 'parallax' ),
	'description' => __( 'This is the home section 2 section.', 'parallax' ),
) );
genesis_register_sidebar( array(
	'id'          => 'home-section-3',
	'name'        => __( 'Home Section 3', 'parallax' ),
	'description' => __( 'This is the home section 3 section.', 'parallax' ),
) );
genesis_register_sidebar( array(
	'id'          => 'home-section-4',
	'name'        => __( 'Home Section 4', 'parallax' ),
	'description' => __( 'This is the home section 4 section.', 'parallax' ),
) );
genesis_register_sidebar( array(
	'id'          => 'home-section-5',
	'name'        => __( 'Home Section 5', 'parallax' ),
	'description' => __( 'This is the home section 5 section.', 'parallax' ),
) );

//remove_action('genesis_header', 'genesis_do_header');
add_action('genesis_header', 'sp_custom_header');
function sp_custom_header() {
	?>
	<script type="text/javascript">
		jQuery(function() {
			$("nav .menu-item").mouseover(function(ev) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				console.log("hi");
			});
		});
	</script>
	<?php
}

//* Customize the entire footer
remove_action( 'genesis_footer', 'genesis_do_footer' );
add_action( 'genesis_footer', 'sp_custom_footer' );
function sp_custom_footer() {
	?>
	<p>More information about this project can be found at the <a href="http://www.ourworldindata.org/about/">About page</a>.<br>
	<p>Click <a href="http://ourworldindata.org/copyrights-disclaimer-of-warranties-and-limitation-of-liability/">here to find the relevant information on copyrights, the disclaimer of warranties and the limitation of liability</a>.<br>
	
	Max Roser (<a href="http://www.MaxRoser.com">www.MaxRoser.com</a>) is the author of OurWorldInData.org<br>
	<br>
	
	OurWorldInData is based at the <a href="http://www.oxfordmartin.ox.ac.uk/">Oxford Martin School</a><br>
					 <a href="http://www.oxfordmartin.ox.ac.uk"><img class="aligncenter size-large wp-image-4122" alt="OMS" src="http://ourworldindata.org/wp-content/uploads/2016/01/ourworldindata_oms_white_verydarkonly-750x398.png" width="450" /></a><br>
	and supported by the <a href="http://www.inet.ox.ac.uk/">Institute for New Economic Thinking at the Oxford Martin School</a><br>
				 <a href="http://www.inet.ox.ac.uk/"><img class="aligncenter size-large wp-image-4122" alt="INET_Brand_Final-03" src="http://www.ourworldindata.org/wp-content/uploads/2014/03/explainingprogress_inet_brand_final-03-750x177.png" width="450" /></a><br>
	and the <a href="http://www.nuffieldfoundation.org/">Nuffield Foundation</a>:<br>
				 <a href="http://www.nuffieldfoundation.org/"><img class="aligncenter size-large wp-image-4122" alt="Nuffield Foundation" src="http://ourworldindata.org/wp-content/uploads/2015/01/ourworldindata_nuffield-logo-white-trans_small.png" width="450" /></a><br>


	The Nuffield Foundation is an endowed charitable trust that aims to improve social well-being in the widest sense. It has funded this project, but the views expressed are those of the authors and not necessarily those of the Foundation.<br>
<br>
	Invited Experts may log in <a href="http://www.ourworldindata.org/wp-login.php">here</a>.<br>
	</p>
	<?php
}

add_image_size('presentation-portfolio-large', 560, 373, TRUE);
add_image_size('presentation-portfolio-medium', 360, 240, TRUE);


/* MAX: Add Author Byline in Pages - so that it is citable (Exclude 'About-Page' and 'Data-Page' from this) */
add_action ('genesis_before_entry', 'max_byline', 10);
function max_byline($posttitle) {
	if ( !is_page('about') &&  !is_page('data') &&  !is_page('owid-grapher') &&  !is_page('web-developer') && !is_page('support') && !is_page('job-offer-quantitative-social-scientist-for-ourworldindata-org-at-the-university-of-oxford') && !is_page ('job-offer-web-developer-for-ourworldindata-org-at-the-university-of-oxford') && is_page() ) {
    $authors = coauthors(null, null, null, null, false);

    if (strpos($authors, "Max Roser") === false) {
      $authors = $authors . " and Max Roser";
    }

    $posttitle = 'Please cite the original source – including the original data source – and this entry on Our World In Data.<br>This entry can be cited as '.$authors.' ('.get_the_modified_date('Y').') – &lsquo;'.get_the_title($ID).'&rsquo;. <em>Published online at OurWorldInData.org.</em> Retrieved from: '.get_permalink().' [Online Resource]';

    echo "<div class=\"post-byline\">$posttitle</div>";
  }
}

/* MAX: Remove Author Box on Posts */
//* Remove the author box on single posts XHTML Themes
remove_action( 'genesis_after_post', 'genesis_do_author_box_single' );
//* Remove the author box on single posts HTML5 Themes
remove_action( 'genesis_after_entry', 'genesis_do_author_box_single', 8 ); 
//* Remove the post info function
remove_action( 'genesis_before_post_content', 'genesis_post_info' ); 

add_action ('genesis_entry_footer', 'genesis_do_author_box_single' );


/* zdenek */
include_once( get_stylesheet_directory() . '/home-nav-grid.php' );
include_once( get_stylesheet_directory() . '/zd-functions.php' );