<?php
/**
 * The template for displaying all single posts and attachments
 */

get_header(); ?>

<main id="main" class="site-main" role="main">

	<?php
	/* MAX: Add Author Byline in Pages - so that it is citable (Exclude 'About-Page' and 'Data-Page' from this) */
	if ( !is_page('about') &&  !is_page('data') &&  !is_page('owid-grapher') &&  !is_page('web-developer') && !is_page('support') && !is_page('job-offer-quantitative-social-scientist-for-ourworldindata-org-at-the-university-of-oxford') && !is_page ('job-offer-web-developer-for-ourworldindata-org-at-the-university-of-oxford') && is_page() ) {
	    $authors = coauthors(null, null, null, null, false);

	    if (strpos($authors, "Max Roser") === false) {
	      $authors = $authors . " and Max Roser";
	    }

	    $posttitle = 'Please cite the original source – including the original data source – and this entry on Our World In Data.<br>This entry can be cited as '.$authors.' ('.get_the_modified_date('Y').') – &lsquo;'.get_the_title($ID).'&rsquo;. <em>Published online at OurWorldInData.org.</em> Retrieved from: '.get_permalink().' [Online Resource]';

	    echo "<div class=\"post-byline\">$posttitle</div>";
	}
	?>


	<?php
	// Start the loop.
	while ( have_posts() ) : the_post();
		// Include the single post content template.
		get_template_part( 'template-parts/content', 'single' );
		// End of the loop.
	endwhile;
	?>

</main><!-- .site-main -->

<?php get_footer(); ?>
