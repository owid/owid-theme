;(function($) {
	"use strict";

	var EntriesHeaderMenu = function() {
		// Desktop menu
		function showDefaultState() {	
			console.log("???");
			$("#topics-dropdown").hide();
			$("#entries-nav").hide();

			if ($("header.site-header .mobile:visible").length)
				return;

			$("#category-nav li.category").removeClass("active").removeClass("selected");

			// If we're already on a page, show it in the nav
			$("#category-nav ul.entries a").each(function() {
				var $entry = $(this);
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
		}

		showDefaultState();		
		// Since the expanding menu is absolutely positioned, push the rest of the page down a bit
		$(".site-main").css("margin-top", 
			parseInt($(".site-main").css("margin-top")) + $("#entries-nav").height() + "px");


		$("#category-nav li.category > a").on('mouseover', function(ev) {
			var $category = $(ev.target).closest("li.category");
			$("#entries-nav").html($category.find("ul.entries")[0].outerHTML);
			$("#entries-nav").show();
			$("#category-nav li.category").removeClass("active").removeClass("selected");
			$category.addClass("selected");

			$("body").on('mousemove.entries', function(ev) {
				if (!$(ev.target).closest("#entries-nav, #category-nav").length) {
					$("body").off('mousemove.entries');
					showDefaultState();
				}
			});
		});		

		// Mobile menu
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

		// Stop mobile-desktop transition from being weird
		$(window).on("resize", showDefaultState);
	}

	EntriesHeaderMenu();

	if (!$(".blog-index").length) {
		$(".entry").scrollNav({ 
			subSections: 'h3, h4'
		});		
	}
	
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

	$(".starred").attr("title", "Starred pages are our best and most complete entries.");

	// Don't let user enter empty search query
	$(".search-form").on("submit", function(evt) {
	    if ($(evt.target).find("input[type=search]").val() == '')
	        evt.preventDefault();
	});

})(jQuery);