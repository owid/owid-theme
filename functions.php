<?php
//* Set Localization (do not remove)
load_child_theme_textdomain('owid', apply_filters('child_theme_textdomain', get_stylesheet_directory() . '/languages', 'owid'));


/* The default WP post visibility behavior causes issues with caching */
function published_only( $query ) {
    if ($query->is_home() && $query->is_main_query()) {
        $query->set('post_status', 'publish');
    }
}
add_action('pre_get_posts', 'published_only');

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

/* MISPY: Modified version of the "Add IDs to Header Tags" plugin, so it works with inline html in headings. */

add_filter( 'the_content', 'add_ids_to_header_tags' );
function add_ids_to_header_tags( $content ) {
	if ( ! is_singular() ) {
		return $content;
	}

	$pattern = '#(?P<full_tag><(?P<tag_name>h\d)(?P<tag_extra>[^>]*)>(?P<tag_contents>.*?)</h\d>)#i';
	if ( preg_match_all( $pattern, $content, $matches, PREG_SET_ORDER ) ) {
		$find = array();
		$replace = array();
		foreach( $matches as $match ) {
			if ( strlen( $match['tag_extra'] ) && false !== stripos( $match['tag_extra'], 'id=' ) ) {
				continue;
			}
			$find[]    = $match['full_tag'];
			$id        = sanitize_title( $match['tag_contents'] );
			$id_attr   = sprintf( ' id="%s"', $id );
			$extra = sprintf( ' <a class="deep-link" href="#%s"># </a>', $id );

			$replace[] = sprintf( '<%1$s%2$s%3$s>%4$s%5$s</%1$s>', $match['tag_name'], $match['tag_extra'], $id_attr, $extra,  $match['tag_contents']);
		}
		$content = str_replace( $find, $replace, $content );
	}

	return $content;
}


/* MISPY: Send cache control headers for CloudFlare (works in combination with plugin to expire cache) */
add_action('send_headers', 'add_header_cf');
function add_header_cf() {
	if (!is_user_logged_in()) {
		header('Pragma: cache');
		header('Cache-Control: public, max-age=0, s-maxage=31536000');				
	}
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

function contributors() {
	?>
		<style>
			.article-header {
				display: none;
			}

			h1 {
				margin-bottom: 0;
			}

			.article-content ul {
				margin: 0;
			}

			li.TeamMember {
				display: flex;
				align-items: center;
				margin-top: 30px;
			}

			li.TeamMember > img {
				margin-right: 10px;
				height: 200px;
			}

			li.TeamMember h3 {
				margin: 0;
			}

			li.TeamMember span {
				display: block;
				margin-top: -5px;
				margin-bottom: 10px;
				font-style: italic;
				font-size: 90%;
			}

			li.TeamMember p {
				margin-bottom: 10px;
			}

			li.TeamMember ul {
			}

			li.TeamMember ul > li {
				list-style-type: none;
				display: inline-block;
				margin-right: 5px;
			}

			li.TeamMember a {
				background-image: none !important;
				padding: 0 !important;
			}
		</style>
		<h1>OWID Team</h1>
		<ul>
			<li class="TeamMember">
				<img src="https://www.maxroser.com/wp-content/uploads/2014/10/maxroser_rosermax01_square-smaller-file-size.png"/>
				<div>
					<h3>Max Roser</h3>
					<span>Project Director</span>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet porttitor elit, vel faucibus sapien. Duis dictum est a ligula ultrices blandit. Vestibulum sed libero faucibus, dapibus lectus id, viverra est. Donec ac massa eget ligula efficitur dictum vitae in velit. Quisque hendrerit vitae sem id aliquet. Ut auctor metus quis enim luctus dignissim.</p>
					<ul>
						<li>
							<a href="https://twitter.com/MaxCRoser">
								<i class="fa fa-twitter"></i>
								@MaxCRoser
							</a>
						</li>
						<li>
							<a href="https://maxroser.com">
								<i class="fa fa-link"></i>
								maxroser.com
							</a>
						</li>
						<li>
							<a href="mailto:max@ourworldindata.org">
								<i class="fa fa-envelope-o"></i>
								max@ourworldindata.org
							</a>
						</li>
					</ul>
				</div>
			</li>					
			<li class="TeamMember">
				<img src="https://pbs.twimg.com/profile_images/809416216817401856/J1BUUyut_400x400.jpg"/>
				<div>
					<h3>Esteban Ortiz-Ospina</h3>
					<span>Senior Researcher</span>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet porttitor elit, vel faucibus sapien. Duis dictum est a ligula ultrices blandit. Vestibulum sed libero faucibus, dapibus lectus id, viverra est. Donec ac massa eget ligula efficitur dictum vitae in velit. Quisque hendrerit vitae sem id aliquet. Ut auctor metus quis enim luctus dignissim.</p>
					<ul>
						<li>
							<a href="https://twitter.com/eortizospina">
								<i class="fa fa-twitter"></i>
								@eortizospina
							</a>
						</li>
						<li>
							<a href="http://www.oxfordmartin.ox.ac.uk/people/743">
								<i class="fa fa-link"></i>
								oxfordmartin.ox.ac.uk/people/743
							</a>
						</li>
						<li>
							<a href="mailto:max@ourworldindata.org">
								<i class="fa fa-envelope-o"></i>
								esteban@ourworldindata.org
							</a>
						</li>
					</ul>
				</div>
			</li>		
			<li class="TeamMember">
				<img src="https://pbs.twimg.com/profile_images/853192971574956032/de4pKQEq_400x400.jpg"/>
				<div>
					<h3>Jaiden Mispy</h3>
					<span>Web Developer</span>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet porttitor elit, vel faucibus sapien. Duis dictum est a ligula ultrices blandit. Vestibulum sed libero faucibus, dapibus lectus id, viverra est. Donec ac massa eget ligula efficitur dictum vitae in velit. Quisque hendrerit vitae sem id aliquet. Ut auctor metus quis enim luctus dignissim.</p>
					<ul>
						<li>
							<a href="https://twitter.com/m1sp">
								<i class="fa fa-twitter"></i>
								@m1sp
							</a>
						</li>
						<li>
							<a href="https://mispy.me">
								<i class="fa fa-link"></i>
								mispy.me
							</a>
						</li>
						<li>
							<a href="mailto:jaiden@ourworldindata.org">
								<i class="fa fa-envelope-o"></i>
								jaiden@ourworldindata.org
							</a>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	<?php
}
add_shortcode('contributors', 'contributors');


?>