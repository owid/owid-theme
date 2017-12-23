<?php 
	// Redirect from admin site for live urls
	if (!is_preview() && strpos(get_the_permalink(), "https://owid.cloud") !== false) {
		$url = str_replace("https://owid.cloud", "https://ourworldindata.org", get_the_permalink());
		wp_redirect($url, 302);
		exit;
	}

	$themeDir = dirname(__FILE__);
	$cmd = "cd $themeDir && node dist/src/renderPage.js blog";
	error_log($cmd);
	exec($cmd, $op);
	echo join("\n", $op);
?>