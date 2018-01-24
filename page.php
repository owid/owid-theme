<?php 
	the_post();

	// Redirect from admin site for live urls
	if (!is_preview() && strpos(get_the_permalink(), "https://owid.cloud") !== false) {
		$url = str_replace("https://owid.cloud", "https://ourworldindata.org", get_the_permalink());
		wp_redirect($url, 302);
		exit;
	}

	$ID = escapeshellarg(get_the_ID());
	$themeDir = dirname(__FILE__);
	$isPreview = is_preview() ? "preview" : "";
	$cmd = "cd $themeDir && node dist/src/renderPage.js $ID $isPreview 2>&1";
	error_log($cmd);
	exec($cmd, $op);
	echo join("\n", $op);
?>