;(function($) {
	"use strict";

	//menu
	$( ".genesis-nav-menu .sub-menu" ).menuAim({
		activate: function( row ) {
			var $row = $( row ),
				$submenu = $row.find( ".sub-menu" );
			$row.addClass( "active" );
			$submenu.show();
		},
		deactivate: function( row ) {
			var $row = $( row ),
				$submenu = $row.find( ".sub-menu" );
			$row.removeClass( "active" );
			$submenu.hide();
		},
		exitMenu: function() { return true; },
		submenuDirection: "right"
	});

	var $entry = $( ".entry" );
	$entry.scrollNav( { subSections: 'h3, h4' } );
	
	//remove hashtags from menu
	var $menuItems = $( ".scroll-nav" ).find( ".scroll-nav__item a, .scroll-nav__sub-item a" );
	$.each( $menuItems, function( i, v ) {
		var $a = $( this ),
			text = $a.text();
		text = text.replace( "#", "" );
		$a.text( text );
	} );

	window.openFancyBox = function( url ) {
		$.fancybox.show( url );
	};

	//create background altering, find all main section, except for the scrollNav-1 which wraps the whole page
	var $sections = $entry.find( ".scroll-nav__section:not(#scrollNav-1)" ),
		$h1p = $entry.find( ".entry-content > p"),
		lastSubSectionsCount = 0,
		lastSectionClass = "dark";
	
	$.each( $sections, function( i, v ) {

		var $section = $( this ),
			$subsections = $section.find( ".scroll-nav__sub-section" );

		if( lastSubSectionsCount%2 == 1 || $h1p.text().length < 10 ) {
			//odd number, need to alter classes
			lastSectionClass = ( lastSectionClass === "light" )? "dark": "light";
		}

		$section.addClass( lastSectionClass );
		lastSubSectionsCount = $subsections.length;
	
	} );

	//homepage grid
	var $win = $( window ),
		$homeNavGridWrapper = $( ".home-nav-grid-wrapper" ),
		$pageItemHasChildren = $homeNavGridWrapper.find( ".page_item_has_children" ),
		componentHeight = 0,
		onResize = function() {
			if( $pageItemHasChildren.length ) {
				if( $win.width() > 1023 ) {
					$pageItemHasChildren.css( "position", "absolute" );
					$homeNavGridWrapper.height( componentHeight );
				} else {
					$pageItemHasChildren.css( "position", "static" );
					$homeNavGridWrapper.height( "auto" );
				}
			}
		};

	if( $pageItemHasChildren.length ) {

		if( $win.width() > 1023 ) {
			//for safari and ie, we need to make elements absolute position otherwise impossible to compute correct top/left
			$pageItemHasChildren.css( "position", "absolute" );
		}

		var colsNum = 4,//3,
			marginBottom = parseInt( $pageItemHasChildren.css( "marginBottom" ), 10),
			paddingLeft = parseInt( $homeNavGridWrapper.css( "paddingLeft" ), 10),
			paddingRight = parseInt( $pageItemHasChildren.css( "paddingRight" ), 10);
		
		$.each( $pageItemHasChildren, function( i, v ) {

			var $item = $( v ),
				width = $item.width(),
				left = ( paddingLeft + width + paddingRight ) * ( i % colsNum ),
				top = 0;

			if( i >= colsNum ) {
				//is not first row, need to set height as well
				var $elAbove = $pageItemHasChildren.eq( i - colsNum ),
					elAboveTop = parseInt( $elAbove.css( "top" ), 10 );
				top = elAboveTop + parseInt( $elAbove.height(), 10 ) + marginBottom;
			}
			$item.css( { "left": left, "top": top } );
			componentHeight = Math.max( componentHeight, top + $item.height() );
		} );

		componentHeight += parseInt( $homeNavGridWrapper.css( "marginBottom" ), 10 );
		$homeNavGridWrapper.height( componentHeight );

		//remove last comma
		/*$pageItemHasChildren.find( "li:last-child a" ).each( function( i, v ) {
			var $lastItem = $( v ),
				lastItemText = $lastItem.text();
			lastItemText = lastItemText.substring( 0, lastItemText.length - 1 );
			$lastItem.text( lastItemText );
		} );*/

	}

	$win.on( "resize", onResize );
	onResize();

} )( jQuery );