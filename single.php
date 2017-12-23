<?php 
	the_post();
	$ID = escapeshellarg(get_the_ID());
	$themeDir = dirname(__FILE__);
	$cmd = "cd $themeDir && node dist/src/renderPage.js $ID";
	error_log($cmd);
	exec($cmd, $op);
	echo join("\n", $op);
?>