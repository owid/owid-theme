<?php 
	the_post();

	if (get_post_status() == 'publish') {
		$url = str_replace("http://l:8080", "https://ourworldindata.org", get_the_permalink());
		wp_redirect($url, 302);
		exit;
	}

	$ID = escapeshellarg(get_the_ID());
	$themeDir = dirname(__FILE__);
	$cmd = "cd $themeDir && node dist/src/renderPage.js $ID";
	error_log($cmd);
	exec($cmd, $op);
	echo join("\n", $op);
?>