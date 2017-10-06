<?php
/**
 * Single blog post
 */

get_header(); ?>

<header class="blog-header">
	<h1><a href="/blog">Blog</a></h1>
</header>

<div class="site-content">
	<?php while (have_posts()) : the_post(); ?>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<header class="article-header">
				<h1 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
			  	<div class='entry-meta'><time><?php the_date("F d, Y"); ?></time> by <?php
					$coauthors = coauthors(null, null, null, null, false);
					echo $coauthors;
			  	?></div>

			</header><!-- .article-header -->

			<div class="article-content">
				<?php the_content(); ?>
			</div><!-- .article-content -->

			<footer class="article-footer">
				<h2 id="footnotes">Footnotes</h2>
				<?php do_action('side_matter_list_notes'); ?>
			</footer><!-- .article-footer -->
		</article><!-- #post-## -->
	<?php endwhile; ?>			

	<?php the_posts_pagination([
		'prev_text'          => '« Prev',        
		'next_text'          => 'Next »',             
		'before_page_number' => '',
	]) ?>  
</div>

<?php get_footer(); ?>
