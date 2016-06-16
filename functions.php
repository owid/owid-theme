<?php
//* Set Localization (do not remove)
load_child_theme_textdomain('parallax', apply_filters( 'child_theme_textdomain', get_stylesheet_directory() . '/languages', 'parallax'));

//* Include Section Image CSS
include_once(get_stylesheet_directory() . '/lib/output.php');

//* Child theme (do not remove)
define('CHILD_THEME_NAME', 'OWID Theme' );
define('CHILD_THEME_URL', 'https://ourworldindata.org');
define('CHILD_THEME_VERSION', '1.2');

//* Enqueue scripts and styles
add_action('wp_enqueue_scripts', 'owid_enqueue_scripts_styles');
function owid_enqueue_scripts_styles() {
	$template_dir = get_stylesheet_directory_uri();

	wp_enqueue_style('fontello-custom', $template_dir . '/css/fontello.css');
	wp_enqueue_style('font-awesome-owid', $template_dir . '/css/font-awesome.min.css');
	wp_enqueue_script("scrollNav", $template_dir . "/js/jquery.scrollNav.js", null, null, true);
	wp_enqueue_script("scripts", $template_dir . "/js/scripts.js", null, null, true);
}

//* Add HTML5 markup structure
add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
//* Add viewport meta tag for mobile browsers
add_theme_support('genesis-responsive-viewport');

// Increase the number of search results on the search page
$search_results_per_page = 20;
add_action('pre_get_posts', 'set_posts_per_page');
function set_posts_per_page($query) {
	global $search_results_per_page;
	if ($query->is_search) {
		$query->query_vars['posts_per_page'] = $search_results_per_page;
	}
	return $query;
}

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

/* MISPY: Custom Amazon-style header topics menu */
//remove_action('genesis_header', 'genesis_do_header' );
add_action('genesis_header', 'sp_custom_header' );
function sp_custom_header() {
	$title = "Our World In Data";

	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);

	$html = <<<EOT
	<nav id="owid-topbar">
		<ul class="desktop right">
			<li>
				<form id="search-nav" action="/">
					<input type="search" name="s" placeholder="Search..."></input>
					<button type="submit">
						<i class="fa fa-search"></i>
					</button>
				</form>
			</li>
			<li>
				<a href="/about">About</a>
			</li>
			<li>
				<a href="/support">Donate</a>
			</li>
		</ul>

		<h1 id="owid-title" itemprop="headline">
			<a href="/"><i class="fa fa-globe"></i><span>$title</span></a>
		</h1>

		<ul class="mobile right">
			<li class="nav-button">
				<a href="/search" data-expand="#search-dropdown"><i class='fa fa-search'></i></a>
			</li><li class="nav-button">
				<a href="/data" data-expand="#topics-dropdown" class='mobile'><i class='fa fa-bars'></i></a>
			</li>
		</ul>
	</nav>

	<div id="topics-dropdown" class="mobile">
		<ul>
			<header><h2>Entries</h2></header>
EOT;

	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number. */
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</ul></div></li>"; // Close off previous category

			$category = preg_replace('/^\d+/', '', $page->post_title);
			$html .= "<li class='category'>"
				  	 . "<a><span>" . $category . "</span></a>"		 	
					 . "<div class='subcategory-menu'>"
					 	. "<div class='submenu-title'>" . $category . "</div>"
					 	. "<ul>";
		} else {
			/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<li><a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			} else {
				$html .= "<li><a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			}
		}
	}

	$html .= "</ul></div></li>"; // Close off final category

	$html .= <<<EOT
			<li class='end-link'><a href='/about'>About</a></li>
			<li class='end-link'><a href='/support'>Donate</a></li>
			<li class='end-link'><a href='/data'>Browse All</a></li>
		</ul>
	</div>

	<div id="search-dropdown" class="mobile">
		<form action="/">
			<input type="search" name="s" placeholder="Search..."></input>
			<button type="submit">
				<i class="fa fa-search"></i>
			</button>
		</form>
	</div>		

	<div id="category-nav" class="desktop"><ul>
EOT;

	$shortCategories = [
		"Population Growth & Vital Statistics" => "Population",
		"Health" => "Health",
		"Food & Agriculture" => "Food",
		"Resources & Energy" => "Energy",
		"Environmental Change" => "Environment",
		"Technology & Infrastructure" => "Technology",
		"Growth & Distribution of Prosperity" => "Growth & Inequality",
		"Economic Development, Work & Standard of Living" => "Work & Life",
		"The Public Sector & Economic System" => "Public Sector",
		"Global Interconnections" => "Global Connections",
		"War & Peace" => "War & Peace",
		"Political Regimes" => "Politics",
		"Violence & Rights" => "Violence & Rights",
		"Education & Knowledge" => "Education",
		"Media & Communication" => "Media",
		"Culture, Values & Society" => "Culture"
	];

	$category = null;
	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number. */
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</ul></li>"; // Close off previous category

			$category = trim(preg_replace('/^\d+/', '', $page->post_title));
			if (isset($shortCategories[$category]))
				$category = $shortCategories[$category];
			$html .= "<li class='category' title='" . $category . "'>"
				  	 . "<a><span>" . $category . "</span></a>"		 	
					 . "<ul class='entries'><hr>";
		} else {
			/* NOTE (Mispy): Starred metadata comes from the Admin Starred Posts plugin */
			$isStarred = get_post_meta($page->ID, '_ino_star', true);
			if ($isStarred) {
				$html .= "<li><a class='starred' href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			} else {
				$html .= "<li><a href='" . get_page_link($page->ID) . "'>" . $page->post_title . "</a></li>";
			}
		}
	}

	$html .= "</ul></li>";

	// Now for mobile stuff

	$html .= <<<EOT
	</ul></div>
	<div id="entries-nav" class="desktop"></div>
EOT;

	echo($html);
}

/* MISPY: Output a nice listing of all the data entries for /data. */
function owid_pages() {
	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);


	$html = "<div class='owid-data'>";
	$html .= "<div class='separator'><h1><span>Data Entries</span></h1><hr><p>Entries marked with <i class='fa fa-star'></i> are complete. Others are ongoing collections of visualizations.</p></div>";

	$html .= '<ul>';
	$category = null;

	foreach ($pages as $page) {
		// HACK (Mispy): Identify top-level categories by whether they start with a number. */
		if (preg_match('/^\d+/', $page->post_title)) {
			if ($category)
				$html .= "</div></li>";

			$category = preg_replace('/^\d+/', '', $page->post_title);
			$html .= "<li>"
				  .	     "<h3>" . $category . "</h3>"
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


// Customize the entire footer

remove_action('genesis_footer', 'genesis_do_footer');
add_filter('genesis_footer_creds_text', 'sp_footer_creds_filter');
function sp_footer_creds_filter($creds) {
	return '';
}
add_action('genesis_footer', 'owid_footer');
function owid_footer() {
	?>
	<div class="clearfix">
		<div class="column">
			<h4><a href="/">Our World In Data</a></h4>
			<p>OWID is an online publication developed at the <a href="http://www.oxfordmartin.ox.ac.uk/research/programmes/world-data">Oxford Martin School</a> which shows how living conditions are changing around the world. Our work is licensed under <a href="http://creativecommons.org/licenses/by-sa/4.0/deed.en_US">CC BY-SA</a> and freely reusable by journalists or educators.</p>
			<hr>
		</div>		
		<div class="column">
			<h6>Sign up to stay informed</h6>

			<!-- Begin MailChimp Signup Form -->
			<div id="mc_embed_signup">
				<form action="//ourworldindata.us8.list-manage.com/subscribe/post?u=18058af086319ba6afad752ec&amp;id=2e166c1fc1" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
				    <div id="mc_embed_signup_scroll">				
						<div class="mc-field-group">
							<input type="email" value="" placeholder="Email" name="EMAIL" class="required email" id="mce-EMAIL"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">
						</div>
						<div id="mce-responses" class="clear">
							<div class="response" id="mce-error-response" style="display:none"></div>
							<div class="response" id="mce-success-response" style="display:none"></div>
						</div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
					    <div style="position: absolute; left: -5000px;"><input type="text" name="b_18058af086319ba6afad752ec_2e166c1fc1" tabindex="-1" value=""></div>
				    </div>
				</form>
				</div>
			<script type='text/javascript' src='/wp-content/themes/parallax-pro/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
			<!--End mc_embed_signup-->

			<h6>Follow us</h6>
	    	<div class="social">
	    		<a href="https://twitter.com/MaxCRoser"><i class="fa fa-twitter"></i></a>
	    		<a href="https://www.facebook.com/OurWorldinData"><i class="fa fa-facebook"></i></a>
	    	</div>			
	    	<hr>
		</div>
		<div class="column links">
			<h6>Links</h6>
			<a href="/data">Entries</a>
			<a href="/blog">Blog</a>
			<a href="/support">Donate</a>
			<a href="/about">About</a>
			<a href="/wp-admin">Login</a>
			<hr>
		</div>
	</div>
	<div class="supporters">
		<!--<img src="/wp-content/themes/parallax-pro/images/oxford-martin-school.png">-->
		<a href="http://www.inet.ox.ac.uk/"><img src="/wp-content/themes/parallax-pro/images/inet-oxford.png"></a>
		<a href="http://www.nuffieldfoundation.org/"><img src="/wp-content/themes/parallax-pro/images/nuffield-foundation.png"></a>
	</div>
	<?php
}

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

add_filter('genesis_post_info', 'remove_meta');
function remove_meta($meta) {
	echo "<p class='entry-meta'><time>" . get_the_date("d M") . "</time> by <span>" . get_the_author() . "</span>";
}

/* MAX: Remove Author Box on Posts */
//* Remove the author box on single posts XHTML Themes
remove_action( 'genesis_after_post', 'genesis_do_author_box_single' );
//* Remove the author box on single posts HTML5 Themes
remove_action( 'genesis_after_entry', 'genesis_do_author_box_single', 8 ); 
//* Remove the post info function
remove_action( 'genesis_before_post_content', 'genesis_post_info' ); 