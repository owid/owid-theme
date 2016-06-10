;(function($) {
	"use strict";

	$("header.site-header").addClass("overlay");

	$("#owid-topbar li.nav-button a").on("click", function(ev) {
		ev.preventDefault();
		var toExpand = $(ev.target).attr("data-expand");
		$(toExpand).toggle();
		$(toExpand).find('input').focus();

		if (toExpand == "#search-dropdown") {
			$("#topics-dropdown").hide();
		} else {
			$("#search-dropdown").hide();		
		}
	});

	$("#topics-dropdown .category > a").on('click', function(ev) {
		$(ev.target).closest('.category').toggleClass('active');
	});

	// Header nav menu for selecting entries by category
	$("#category-nav li.category > a").on('click', function(ev) {
		var $category = $(ev.target).closest("li.category");
		$("#entries-nav").html($category.find("ul.entries")[0].outerHTML);
		$("#entries-nav").show();
		$("#category-nav li.category").removeClass("active");
		$category.addClass("active");
	});

	// HACK (Mispy): Prevent bolding on selection from shifting elements
	/*$('#category-nav li.category > a').each(function(){
	    $(this).parent().width($(this).width() + 8);
	});*/	

	// If we're already on a page, show it in the nav
	$("#category-nav ul.entries a").each(function() {
		$entry = $(this);
		if ($("h1.entry-title").text() == $entry.text()) {
			var $ul = $entry.closest("ul.entries");
			$("#entries-nav").html($ul[0].outerHTML);
			$("#entries-nav").show();

			$("#entries-nav li").each(function() {
				if ($("h1.entry-title").text() == $(this).text())
					$(this).addClass("active");
			});
			$entry.closest(".category").addClass("active");
		}
	});

	// Clear selection
	/*$("html").on("click", function(ev) {
		if (!$(ev.target).closest("a").length) {
			$("#category-nav li.category").removeClass("active");
			$("#entries-nav").hide();
		}
	});*/
	

	var $entry = $( ".entry" );
	$entry.scrollNav({ 
		subSections: 'h3, h4'
	});
	
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
	}

	$win.on( "resize", onResize );
	onResize();

} )( jQuery );