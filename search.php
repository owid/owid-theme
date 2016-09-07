<?php
/**
 * The template for displaying search results pages
 */

get_header(); ?>

	<section id="primary" class="content-area">
		<main id="main" class="site-main">

		<?php if (have_posts()) : ?>
			<header class="page-header">
				<h1 class="page-title"><?php printf('Search Results for: %s', '<span>' . esc_html(get_search_query()) . '</span>'); ?></h1>
			</header><!-- .page-header -->

			<?php while (have_posts()) : the_post(); ?>
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<header class="entry-header">
						<h1 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
	 				  	<div class='entry-meta'><time>Updated <?php the_modified_date("F d, Y"); ?></time> by <?php the_author(); ?></div>
					</header><!-- .entry-header -->

					<div class="entry-content">
						<?php the_excerpt(); ?>
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

		<?php else : ?>
			<h1 class="page-title no-results">No results found for <?php echo esc_html(get_search_query()) ?></h1>
		<?php endif; ?>

		</main><!-- .site-main -->
	</section><!-- .content-area -->

<?php get_footer(); ?>