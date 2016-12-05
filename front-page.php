<?php get_header(); ?>

<?php

function owid_homepage() {
	$html = "";

	$html .= <<<EOT
<div id="homepage-cover">
	<div class="lead-in">
		<h1 class="desktop">Our world is changing</h1>
		<div class="desktop subheading" style="font-family: Georgia;">Explore the ongoing history of human civilization at the broadest level, through research and data visualization.</div>
		<div class="mobile subheading">Living conditions around the world are changing rapidly. Explore how and why.</div>
		<img class="down-arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAM1BMVEUAAAD/zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB//zB8l5oYuAAAAEHRSTlMAECAwQFBgcICPn6+/z9/vIxqCigAAAVxJREFUOMuFlcsWwyAIRFF8izr//7VdNK2KTeomJ+YGZggSon3ZkLJISZHpYdnc8V2juBvMCYCanCNiF8sAeviBmQz0YJYdL4BYzXGf7zPPHEMF9QPlG03kux+BtMkD4rxbQHJjJXlgzbCC2zPT13gKJAY+mjMq3YMU0a4yY5gnkORKXqBKoEGLvlwewCtU3J38AhmViBrsP5A6DJmPpycww5ND/g96JIoI/0GLSglbfxb7Bm3ZSIgGM5IRMUkJOkEGeu8dqhQnSO19YlQpIIeZ8AbDYUaXxwwAuk080lnwAgDlLDg1GPVhMVv1K9wQZd0U7bDCaL/arByZr46tp2/teVyBd4+sJcpHXFapxlAZ2jyu4eG4jplADYCU6G447Pq937iinM4hZcw6pFSpeKAfE5YFZ/+bCsi26wrQ+GY0jxqdJTIulH4zmomIuIw57FH904+BY6oikpIW/AINdBKzcQVAtQAAAABJRU5ErkJggg==
" alt=“Y">
		<div class="title-author-byline">A web publication by <a href="http://www.MaxRoser.com/about" target="_blank">Max Roser</a>.</div>
	</div>
</div>
<div id="homepage-content" class="clearfix">
	<h3><a href="/grapher/latest">Latest Visualization</a></h3>
	<iframe src="/grapher/latest" width="100%" height="660px"></iframe>
EOT;

	// Blog sidebar
	$html .= <<<EOT
	<div id="homepage-blog">
		<h3><a href="/blog">Blog</a></h3>
		<ul>
EOT;

	query_posts('posts_per_page=6');
	if (have_posts()) {
		while (have_posts()) {
			the_post();
			if (get_post_status() == 'private') continue;

 			$html .= "<li class='post'>"
 				  .	 "    <h4><a href='" . get_the_permalink() . "'>" . get_the_title() . "</a></h4>"
 				  .	 "    <div class='entry-meta'><time>" . get_the_date("F d, Y") . "</time></div>";
 			$html .= "</li>";
		}
	}

	$html .= <<<EOT
		</ul>
		<a class="more" href="/blog">More →</a>
	</div>
EOT;

	/* Now we make the big data entries listing */
	$pages = get_pages([
		'child_of'    => 621,
		'sort_column' => 'menu_order, post_title',
	]);

	$html .= <<<EOT
	<div id="homepage-entries" class="owid-data">
		<h3><a href="/entries">Entries</a></h3>		
		<p>Ongoing collections of research and data by topic. Entries marked with <i class='fa fa-star'></i> are the most complete.</p>
		<ul>
EOT;

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
	
	$html .= "<div class='owid-data owid-presentations'>"
		  .	     "<h3><a>Presentations</a></h3>"
		  .		 "<p>Visual histories spanning multiple topics.</p>"
		  .		 "<ul>";

    $html .= "<li><h4>Visual History of...</h4>"
          .  "<div class='link-container'>";

    $html .= "<a href='/slides/war-and-violence'>War & Violence</a>"
          .  "<a href='/slides/world-poverty'>World Poverty</a>"
          .  "<a href='/slides/global-health'>Global Health</a>"
          .  "<a href='/slides/hunger-and-food-provision'>World Hunger & Food Provision</a>"
          .  "<a href='/slides/africa-in-data'>Africa</a>";

    $html .= "</div></li></ul></div>";

    $html .= <<<EOT
    <div id="homepage-twitter">
    	<h3><a href="https://twitter.com/MaxCRoser">Follow us</a></h3>
    	<div class="social">
    		<a href="https://twitter.com/MaxCRoser"><i class="fa fa-twitter"></i></a>
    		<a href="https://www.facebook.com/OurWorldinData"><i class="fa fa-facebook"></i></a>
    		<a href="/feed/"><i class="fa fa-feed"></i></a>
    	</div>
    	<a class="twitter-timeline" data-height="600" href="https://twitter.com/MaxCRoser">Tweets by MaxCRoser</a> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
    </div>
EOT;

    $html .= "</div>";

	echo($html);
} ?>

<?php owid_homepage(); ?>
<?php get_footer(); ?>