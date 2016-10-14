<?php
/**
 * The /blog page
 */

get_header(); ?>

<header class="blog-header">
	<h1>Blog</h1>
</header>

<div class="site-content">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php if (get_post_status() == 'private') continue;

		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<header class="entry-header">
				<h1 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
				  	<div class='entry-meta'><time><?php the_date("F d, Y"); ?></time> by <?php the_author(); ?></div>
			</header><!-- .entry-header -->

			<div class="entry-content">
				<?php the_content(); ?>
			</div><!-- .entry-content -->

			<footer class="entry-footer">
			</footer><!-- .entry-footer -->
		</article><!-- #post-## -->
	<?php endwhile; ?>			

	<?php the_posts_pagination([
		'prev_text'          => '« Prev',        
		'next_text'          => 'Next »',             
		'before_page_number' => '',
	]) ?>  
</div>

<?php get_footer(); ?>
