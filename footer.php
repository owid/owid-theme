<?php
/**
 * The template for displaying the footer
 */
?> 
	<footer id="colophon" class="site-footer" role="contentinfo">
		<div class="wrap">
			<div class="clearfix">
				<div class="column">
				<h4><a href="/">Our World In Data</a></h4>
					<p>OWID is an online publication developed at the <a href="http://www.oxfordmartin.ox.ac.uk/research/programmes/world-data">Oxford Martin School</a> which explores the history and continued development of human civilization at a global scale. Our work is licensed under <a href="http://creativecommons.org/licenses/by-sa/4.0/deed.en_US">CC BY-SA</a> and freely reusable by journalists or educators.</p>
					<hr>
				</div>		
				<div class="column subscribe">
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
					<script type='text/javascript' src='/wp-content/themes/owid-theme/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
					<!--End mc_embed_signup-->

					<h6>Follow us</h6>
			    	<div class="social">
			    		<a href="https://twitter.com/MaxCRoser"><i class="fa fa-twitter"></i></a>
			    		<a href="https://www.facebook.com/OurWorldinData"><i class="fa fa-facebook"></i></a>
   				 		<a href="/feed/"><i class="fa fa-feed"></i></a>
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
				<!--<img src="/wp-content/themes/owid-theme/images/oxford-martin-school.png">-->
				<a href="http://www.inet.ox.ac.uk/"><img src="/wp-content/themes/owid-theme/images/inet-oxford.png"></a>
				<a href="http://www.nuffieldfoundation.org/"><img src="/wp-content/themes/owid-theme/images/nuffield-foundation.png"></a>
			</div>
		</div><!-- .wrap -->
	</footer><!-- .site-footer -->

	<?php wp_footer(); ?>

	<script>
		$("body").css('visibility', 'inherit');
		$("body").hide().fadeIn();
	</script>
</body>
</html>
