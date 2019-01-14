window.$ = window.jQuery = require('jquery')
require ('./tooltip.js')

// Construct scroll-friendly nav sidebar for entries. Should be idempotent so it
// can be called again to reconstruct on window resize
var OWIDScrollNav = function() {
	var $page = $("article.page"),
		$sidebar = $(".entry-sidebar");

	if (!$page.length || !$sidebar.length || $(".no-sidebar").length) return;

	// Don't make sidebar unless there are enough headings
	if ($page.find('h2').length < 2) return;

	// Cleanup any existing stuff
	$sidebar.attr('style', '');
	$(window).off('scroll.toc');

	// For CSS
	$page.parent().addClass('page-with-sidebar');

	// Keep track of sections so we can find the closest one
	var headings = $(".article-content h2, .article-content h3").map(function(i, el) { return $(el); })

	var currentHeadingIndex = null;
	var onScroll = function() {
		var scrollTop = $(document).scrollTop(),
			scrollBottom = scrollTop + $(window).height(),
			mainOffset = $("main").offset(),
			navOffset = $sidebar.offset(),
			navHeight = $sidebar.height(),
			footerOffset = $("footer.SiteFooter").offset(),
			isFixed = $sidebar.css('position') == 'fixed',
			defaultTop = 10;

		// Fix the TOC once we scroll past the header
		if (scrollTop > mainOffset.top && !isFixed) {
			$sidebar.css({
				position: 'fixed',
				top: defaultTop + 'px',
				left: navOffset.left,
				width: $sidebar.outerWidth() + 'px'
			});
		} else if (scrollTop < mainOffset.top && isFixed) {
			$sidebar.attr('style', '');
		}

		// Figure out where in the document we are
		var lastHeadingIndex = null;
		headings.each(function(i, $heading) {
			// HACK (Mispy): The +50 is so being right on top of the heading after you
			// click a link in the TOC still counts as being under it
			if ($heading.offset().top <= scrollTop+50)
				lastHeadingIndex = i;
		});

		if (lastHeadingIndex != currentHeadingIndex) {
			$sidebar.find("li.active").removeClass("active");
			currentHeadingIndex = lastHeadingIndex;
			if (currentHeadingIndex !== null)
				$sidebar.find("li").eq(currentHeadingIndex).addClass("active");
		}

		// Ensure TOC doesn't overlap the footer
		var currentTop = parseFloat($sidebar.css('top')),
			currentTopAdjustment = currentTop - defaultTop,
			footerMargin = 80,
			unadjustedOverlapHeight = (navOffset.top - currentTopAdjustment + navHeight) - (footerOffset.top - footerMargin);

		if (unadjustedOverlapHeight > 0) {
			$sidebar.css({
				top: (defaultTop - unadjustedOverlapHeight) + 'px'
			});
		} else {
			$sidebar.css({
				top: defaultTop + 'px'
			});
		}
	};

	if ($sidebar.css("float") != "none") {
		onScroll();
		$(window).on('scroll.toc', onScroll);
	}
};

var EntriesHeaderMenu = function() {
	var canHoverMenu = false;

	function onCategoryActivate(ev) {
		ev.preventDefault();
		var $category = $(ev.target).closest("li.category");
		$("#entries-nav").html($category.find("ul.entries")[0].outerHTML);
		$("#entries-nav").show();
		$("#category-nav li.category").removeClass("active").removeClass("selected");
		$category.addClass("selected");
	}

	// Mobile menu
	$("#owid-topbar li.nav-button a").on("click", function(ev) {
		ev.preventDefault()
		window.runMobileEntriesMenu();
/*		ev.preventDefault();
		var toExpand = $(ev.target).attr("data-expand");
		$(toExpand).toggle();
		$(toExpand).find('input').focus();

		if (toExpand == "#search-dropdown") {
			$("#topics-dropdown").hide();
		} else {
			$("#search-dropdown").hide();
		}*/
	});


	function onResize() {
		// MISPY: Currently hover menu is disabled because it is too easy to cross over
		// the categories when trying to get to the subcategories with the mouse
		canHoverMenu = $("#category-nav").height() < 50;

		$("#category-nav li.category > a").off('mouseover');
		$("#category-nav li.category > a").off('click');

		//if (canHoverMenu)
		//	$("#category-nav li.category > a").on('mouseover', onCategoryActivate);
		//else
			$("#category-nav li.category > a").on('click', onCategoryActivate);

		$("#topics-dropdown .category > a").off('click');
		$("#topics-dropdown .category > a").on('click', function(ev) {
			ev.preventDefault();
			$(ev.target).closest('.category').toggleClass('active');
		});
	}

	// HACK (Mispy): Stop mobile-desktop transition from being weird.
	// Also make sure it's a real resize event, as mobile Chrome seems
	// to fire them on scroll as well.
	var origWidth = $(window).width();
	$(window).on("resize", function() {
		var width = $(window).width();
		if (origWidth != width) {
			onResize();
			origWidth = width;
		}
	});

	onResize();
};


EntriesHeaderMenu();
OWIDScrollNav();

$(window).on('resize.toc', OWIDScrollNav);

// Don't let user enter empty search query
$(".search-form").on("submit", function(evt) {
	if ($(evt.target).find("input[type=search]").val() === '')
		evt.preventDefault();
});

$(".citation-note").on('click', function() {
	$(".citation-guideline").toggle();
});

$("a.ref sup").removeAttr("title");

$("a.ref sup").tooltip({
	html: true,
	delay: { show: 100, hide: 500 },
	placement: 'auto right',
	trigger: 'manual',
	title: function() {
		var selector = $(this).closest('a.ref').attr('href');
		return $(selector).html();
	}
});

$("a.ref sup").on("mouseover", function() {
	var $sup = $(this);
	$sup.tooltip('show');

	$("body").on("mouseover.tooltip", function(evt) {
		if (!$(evt.target).closest(".tooltip").length && !$(evt.target).closest(".ref").length) {
			$sup.tooltip('hide');
			$('body').off('mouseover.tooltip');
		}
	});
});

if (document.cookie.indexOf('wordpress') != -1 || document.cookie.indexOf('wp-settings') != -1 || document.cookie.indexOf('isAdmin') != -1) {
    $('#wpadminbar').show();
}

$("html").addClass('js');
