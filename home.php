<?php
/**
 * The /blog page
 */

get_header(); ?>

<div class="site-content">
	<h2>Latest Posts</h2>
	<ul class="posts">
	<?php while ( have_posts() ) : the_post(); ?>
		<li class="post">
			<a href="<?php the_permalink(); ?>">
				<?php the_post_thumbnail(); ?>
				<h3><?php the_title(); ?></h3>
				<div class='entry-meta'><time><?php the_date("F d, Y"); ?></time> by <?php
						$coauthors = coauthors(null, null, null, null, false);
						echo $coauthors;
					  ?></div>
			</a>
		</li>
	<?php endwhile; ?>
	</ul>

	<?php the_posts_pagination([
		'prev_text'          => '« Prev',        
		'next_text'          => 'Next »',             
		'before_page_number' => '',
	]) ?>  
</div>

<?php get_footer(); ?>
