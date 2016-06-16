<?php
/**
 * The template for displaying all single posts and attachments
 */

get_header(); ?>

<main id="main" class="site-main" role="main">
	<?php while ( have_posts() ) : the_post(); ?>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<header class="entry-header">
				<?php the_title('<h1 class="entry-title">', '</h1>'); ?>
			  	<div class='entry-meta'><time><?php the_date("F d, Y"); ?></time> by <?php the_author(); ?></div>
			</header><!-- .entry-header -->

			<div class="entry-content">
				<?php the_content(); ?>
			</div><!-- .entry-content -->

			<footer class="entry-footer">
			</footer><!-- .entry-footer -->
		</article><!-- #post-## -->
	<?php endwhile; ?>
</main><!-- .site-main -->

<?php get_footer(); ?>
