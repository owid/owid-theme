<?php
/**
 * This file adds the Landing template to the Parallax Pro Theme.
 *
 * @author StudioPress
 * @package Parallax
 * @subpackage Customizations
 */

/*
Template Name: Landing
*/

//* Add custom body class to the head
add_filter( 'body_class', 'parallax_add_body_class' );
function parallax_add_body_class( $classes ) {

   $classes[] = 'parallax-landing';
   return $classes;
}
