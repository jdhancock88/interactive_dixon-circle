$(document).ready(function() {

	//custom scripting goes here

	// injecting current year into footer
	// DO NOT DELETE

	var d = new Date();
	var year = d.getFullYear();

	$('.copyright').text(year);


	////////////////////////////////////////////////
	///// GETTING PAST THE SPLASH SCREEN ///////////
	////////////////////////////////////////////////

	$("#readMore").click(function(e) {
		e.preventDefault();
		$("#splash").fadeOut(500);
		$("body").removeClass("noScroll");
	});


	////////////////////////////////////////////////
	///// VIEWING STORIES WITHIN SECTIONS //////////
	////////////////////////////////////////////////

	var storyItem = $(".dixonStories ul li");

	storyItem.click(function() {

		var target = $(this).index();

		var chapter = $(this).closest(".dixonSection").attr("id");

		viewVignette(chapter, target);

	});

	$(".next").click(function() {
		var chapter = $(this).closest(".dixonSection").attr("id");
		var target = $(this).parent(".dixonStory").index();
		viewVignette(chapter, target);
	});

	function viewVignette(chapter, target) {
		var dixonCh = $("#" + chapter);

		dixonCh.find("ul").children("li").eq(target).addClass("activeItem").siblings("li").removeClass("activeItem");
		dixonCh.find(".dixonStory").addClass("noShow").eq(target).removeClass("noShow");

		var targetStory = dixonCh.find(".dixonStory").eq(target);

		if (targetStory.offset().top <= $(window).scrollTop() ) {
			$("html, body").animate({
				scrollTop: (targetStory.offset().top - 80) + "px"
			}, 250);
		}
	}


	////////////////////////////////////////////////
	///// WINDOW SCROLLING FUNCTIONS ///////////////
	////////////////////////////////////////////////


	$(window).scroll(function() {

		var top = $(window).scrollTop();

		// animate our reset and zoom controls based on if the black bar has scrolled out of view
		if (top > 52) {
			$("#mapReset").addClass("moved");
			$(".mapboxgl-ctrl-top-right").addClass("moved");
			$("#mapExpander").addClass("moved");
		} else {
			$("#mapReset").removeClass("moved");
			$(".mapboxgl-ctrl-top-right").removeClass("moved");
			$("#mapExpander").removeClass("moved");
		}


		//animate in our subchapter navigation to stay fixed at the top in each chapter
		var dixonContent = $(".dixonContent");

		$.each($(".dixonContent"), function() {
			if (($(this).offset().top + 60) < top && ($(this).offset().top + $(this).height()) > (top + 50)) {
				$(this).find($("ul")).addClass("stuck");
			} else {
				$(this).find($("ul")).removeClass("stuck");
			}
		});

	});



	//////////////////////////////////////////////////////
	///// CONTROLLING MAP VIEWING ON SMALLER SCREENS /////
	//////////////////////////////////////////////////////

	// functions that control expanding the map on smaller screen sizes
	function expandMap() {
		if ($("#map").hasClass("viewable") === true) {
			$("#map").removeClass("viewable");
			$("#mapExpander").removeClass("fa-times").addClass("fa-map-marker");
		} else {
			$("#map").addClass("viewable");
			$("#mapExpander").removeClass("fa-map-marker").addClass("fa-times");
		}
	}

	// clicking the map expander icon in the upper right or the view map buttons
	// triggers hiding or showing the map

	$("#mapExpander").click(function() {
		expandMap();
	});

	$(".mapper").click(function() {
		expandMap();
	});



	////////////////////////////////////////////////
	///// CHECKING IF WEBGL IS SUPPORTED ///////////
	////////////////////////////////////////////////

	if (!mapboxgl.supported()) {
		console.log("MapBox GL not supported");
	} else {
		console.log("Yay, maps!");
	}


	////////////////////////////////////////////////
	///// MAP SETUP ////////////////////////////////
	////////////////////////////////////////////////

	var originalLoc = [-96.7371063,32.7628376];

	var locations = [
		{number: "1", head: "Dixon Circle", lng: -96.73251, lat: 32.76531, zoom: 17, opacity: 1},
		{number: "2", head: "The Corner", lng: -96.73539, lat: 32.76385, zoom: 17, opacity: 1},
		{number: "3", head: "The Killing", lng: -96.73318, lat: 32.76324, zoom: 17, opacity: 1},
		{number: "4", head: "The People", lng: -96.73413, lat: 32.76522, zoom: 17, opacity: 1},
		{number: "5", head: "The Police", lng: -96.7371063, lat: 32.7628376, zoom: 15, opacity: 0},
		{number: "6", head: "The Kid Who Got Out", lng: -96.7369, lat: 32.76185, zoom: 17, opacity: 1},
		{number: "7", head: "Freddie’s Last Bust", lng: -96.73487, lat: 32.76461, zoom: 17, opacity: 1},
		{number: "8", head: "The example", lng: -96.7371063, lat: 32.7628376, zoom: 15, opacity: 0}
	];

	locations = GeoJSON.parse(locations, {Point: ['lat', 'lng'], include: ['number', 'head', 'zoom', 'opacity']});

	mapboxgl.accessToken = 'pk.eyJ1IjoibWFjbWFuIiwiYSI6ImVEbmNmZjAifQ.zVzy9cyjNT1tMYOTex51HQ';


	// defining the map and it's starting parameters
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/satellite-streets-v9',
		center: originalLoc,
		zoom: 15
	});

	// once the map has loaded, disable scroll zooming and add a zoom navigation
	// then draw the map using our location data
	map.on("load", function() {
		map.scrollZoom.disable();
		map.addControl(new mapboxgl.Navigation());

		drawMap(locations);
	});


	////////////////////////////////////////////////
	///// MAP DRAWING //////////////////////////////
	////////////////////////////////////////////////

	function drawMap(locations) {

		// adding the data source
		map.addSource("locations", {
			type: "geojson",
			data: locations
		});

		// adding the data layer
		map.addLayer({
			"id": "dixonCircle",
			"source": "locations",
			"type": "circle",
			"paint": {
				"circle-radius": {
					stops: [[1, 10], [8, 10], [16, 9]]
				},
				"circle-color": "#FBD44B",
				"circle-opacity": {
					"property": "opacity",
					"stops": [
						[0, 0], [1, 1]
					]
				}
			}
		});

	}


	////////////////////////////////////////////////
	///// MAP ANIMATING ////////////////////////////
	////////////////////////////////////////////////

	// function to animate the map, handling locaiton, zoom, duration and pitch
	function animateMap(location, zoom, duration, pitch) {
		map.easeTo({
			center: location,
			zoom: zoom,
			duration: duration,
			pitch: pitch
		});
	}


	// reseting the map to it's original orientation with a click of the reset button
	$("#mapReset").on("click", function() {
		animateMap(originalLoc, 15, 750, 0);
		currentLoc = "";
	});


	////////////////////////////////////////////////
	///// UPDATING THE MAP POSITION ////////////////
	////////////////////////////////////////////////

	// as we scroll through our content, we're going to animate the map center
	// location to correspoinding features within our content

	// variable set up. we need an array of ids for all the locaitons that have passed the
	// bottom of the screen, and a variable to hold the current visible location
	var visibleLocs = [];
	var currentLoc;

	function updateLoc() {

		// empty the visible locations array
		visibleLocs = [];


		// set our window dimension variables
		var windowTop = $(window).scrollTop();
		var windowHeight = $(window).height();
		var windowBottom = windowHeight + windowTop;

		// for each location section, if it's visible (i.e., above the windowBottom), push
		// that section's id to the visibleLocs array
		$.each($(".dixonMap"), function() {
			if (windowBottom > $(this).offset().top + ($(window).height() / 2)) {
				visibleLocs.push($(this).attr("id"));
			}
		});


		// now, if everything goes right, the last id in the array is the card
		// closest to the bottom of the screen

		// find out how many locations we're dealing with so we can grab the last one
		var l = visibleLocs.length;

		// if the last location in the visible array isn't the same as our current location
		// grab that locations lat and long and zoom the map

		if (visibleLocs[l-1] !== currentLoc && visibleLocs[l-1] !== undefined) {

			// position the map
			animateMap(locations.features[l-1].geometry.coordinates, locations.features[l-1].properties.zoom, 750, 0);

			// set the current location to the last visible location
			currentLoc = visibleLocs[l-1];

		// else, if visibleLocs is empty zoom the map back to the original view

		} else if (visibleLocs[l-1] === undefined) {
			animateMap(originalLoc, 15, 750, 0);
			currentLoc = "";
		}

		// if we get all the way to the end, and the credits div scrolls into view,
		// recenter and zoom the map to it's starting lat, long and zoom
		if (windowBottom > $(".credits").offset().top) {
			animateMap(originalLoc, 15, 750, 0);
			currentLoc = "";
		}

	}

	// throttle the updateLoc function to run every 600 milliseconds
	$(window).on("scroll", _.throttle(updateLoc, 600));



});
