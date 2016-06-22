<?php
/**
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */

get_header(); ?>

<?php $hasSidebar = !is_page('data'); ?>

<?php while (have_posts()) : the_post(); ?>
	<div class="<?php if ($hasSidebar) { echo('owid-entry'); } ?> clearfix">
		<div class="entry-sidebar">
			<nav class="entry-toc">
				<!-- populated by JS -->
			</nav>
		</div>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<header class="entry-header">
				<?php
				?>

				<?php the_title('<h1 class="entry-title">', '</h1>'); ?>
				<div class='authors-byline'><a href="/about/#the-team"><?php
					if (!is_page('about') && !is_page('data') &&  !is_page('owid-grapher') && !is_page('support') && is_page()) {
					    $authors = coauthors(null, null, null, null, false);

					    if (strpos($authors, "Max Roser") === false) {
					      $authors = $authors . " and Max Roser";
					    }

					    echo $authors;
					}
				?></a></div>
			</header><!-- .entry-header -->

			<div class="entry-content">
				<?php the_content(); ?>
			</div><!-- .entry-content -->

			<footer class="entry-footer">
				<h2 id="endnotes" style="visibility: hidden; margin: 0; padding: 0; height: 0;">Endnotes</h2>
				<?php do_action('side_matter_list_notes'); ?>

				<?php if (!is_page('about') && !is_page('data') && !is_page('owid-grapher') && !is_page('support') && is_page()) : ?>
					<h2 id="citation-guidelines" style="visibility: hidden; margin: 0; padding: 0; height: 0;">Citation guidelines</h2>
					<div class="citation-guideline">
					<?php
					    $authors = coauthors(null, null, null, null, false);

					    if (strpos($authors, "Max Roser") === false) {
					      $authors = $authors . " and Max Roser";
					    }

					    $posttitle = 'Please cite the original source – including the original data source – and this entry on Our World in Data.<br>This entry can be cited as '.$authors.' ('.get_the_modified_date('Y').') – &lsquo;'.get_the_title($ID).'&rsquo;. <em>Published online at OurWorldInData.org.</em> Retrieved from: '.get_permalink().' [Online Resource]';

					    echo $posttitle;
					?>

					</div>
				<?php endif ?>
			</footer><!-- .entry-footer -->
		</article><!-- #post-## -->
	</div>
<?php endwhile; ?>

<?php get_footer(); ?>
