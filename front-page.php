<?php 
	$themeDir = dirname(__FILE__);
	$cmd = "cd $themeDir && node dist/src/renderPage.js front";
	error_log($cmd);
	exec($cmd, $op);
	echo join("\n", $op);
?>