var search = {};
search.results = new Array();
search.desc = new Array();

search.icon = L.icon({
    iconUrl: 'js/leaflet/images/marker.png',
    shadowUrl: 'js/leaflet/images/marker-shadow.png',
    iconSize: [31, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -41]
});

/*
 * Open/close search panel
 */
var bsearch = true;
$(".navbar #search").click(function () {
    $(".navbar #search").toggleClass('active');
    if(!bsearch) {
        if(brouting) {
            $("#tool-nav").fadeOut('quick');
            $(".navbar #nav").toggleClass('active');
            brouting = !brouting;
            $("#tool-search").delay(150);
        }
        $("#tool-search").fadeIn('quick');
    } else
        $("#tool-search").fadeOut('quick');
    bsearch = !bsearch;
});

$('#search-clear').click(function(){
    search.clear();
});



//change tabs in search box
$("#box-search-switcher > button").click(function () {
    var clicked = $(this).attr('name');
    if(clicked === "clear") {
        layers.search.clearLayers();
        $("#box-search-results-container").fadeOut(150);
        $("#box-search > div").delay(300).css("bottom","auto");
    } else {
        $("#box-search-results > div[name!="+clicked+"]").fadeOut(150);
        $("#box-search-results > div[name="+clicked+"]").delay(150).fadeIn(150); 
    }
});

/*
 * Result click
 */
$("#search-results").on("click", "p", function(){
    var id = $(this).attr('id');
    map.setView(search.results[id].coord, 17);
    search.results[id].marker.openPopup();
});

/*
 * Start searching
 */
$("#tool-search .tool-bar button").click(function () {
    search.start($("#tool-search .tool-bar input").val());
    search.show();
});
$("#tool-search .tool-bar input").keypress(function(e) {
    if(e.which === 13) {
        search.start($("#tool-search .tool-bar input").val());
        search.show();
    }
});

search.show = function() {
    $("#tool-search").css("bottom", "10px");
    $("#tool-search .tool-results-container").fadeIn('quick');
};

search.hide = function() {
    $("#tool-search .tool-results-container").fadeOut('quick');
    $('#tool-search').delay(150).queue(function(){ 
        $(this).css("bottom", "default");  
    });
};

search.clear = function() {
    search.hide();
    layers.search.clearLayers();
};



/*
 * Found point - class
 */
search.type = {
    ADDR : 0,
    POI : 1
};

search.point = function(id) {
    this.id = id;
    this.element = "node";
    
    this.getMarker = function() {
        
        var txt = '<div class="popup-body"><h1>'+this.name+'</h1><div>'+this.desc+'</div><div>'+
                '<a class="btn btn-mini" href="http://www.openstreetmap.org/browse/'+this.element+'/'+this.id+'" target="_blank" />Zobacz w OSM</a> '+
                '<a class="btn btn-mini" href="http://nominatim.openstreetmap.org/details.php?place_id='+this.nominatim+'" target="_blank" />Nominatim</a> '+
                '</div></div>';

        this.marker = L.marker(this.coord, {icon: search.icon}).bindPopup(txt).openPopup();
        return this.marker;
    };
    
    this.getInfo = function() {
        var txt = "";
        if(this.type === search.type.POI) {
            /*txt += "<p class=\"search-results-poi\" id=\""+this.id+"\"><strong>"+this.name+"</strong><br />"+
                this.road+" "+this.number+"<br />"+this.city+"</p>";*/
            txt += '<p class="search-results-poi" id="'+this.id+'">'+this.desc+'</p>';
        } else {
            if(this.tag === 'boundary')   
                txt += '<p class="search-results-town" id="'+this.id+'">'+this.desc+'</p>';
            else if(this.tag === 'place' && this.value === 'house')  
                txt += '<p class="search-results-address" id="'+this.id+'">'+this.desc+'</p>';
            else
                txt += '<p class="search-results-town" id="'+this.id+'">'+this.desc+'</p>'; 
        }
        return txt;
    };
};

/*
 * Start search
 */
search.start = function(query) {
    /*$("#box-search .loading").delay(150).fadeIn(150);
    $("#box-search-results-container").fadeOut(150);
    $("#box-search").css("bottom","20px");*/
    $('#search-results').text("Szukam...");
    
    //clear
    layers.search.clearLayers();
    search.results = new Array();
    search.desc['addr'] = "";
    search.desc['poi'] = "";
    
    $.ajax({
        type: "GET",
        dataType : 'text',
        crossDomain: true,
        url: "http://nominatim.openstreetmap.org/search",
        data: "q="+query+"&format=xml&addressdetails=1&polygon=1",
        error:function(xhr, status, errorThrown) {
            alert("Błąd: " + errorThrown);
	},
        success: function(output) {
            search.parse(output);
        }
    });
};

search.parse = function(output) {
    $("#box-search .loading").fadeOut(150);
    
    // results -> class object -> push to array
    $(output).find('place').each(function() {
        var point = new search.point($(this).attr("osm_id"));
        
            point.nominatim = $(this).attr("place_id"); 
            point.element = $(this).attr("osm_type");                               //node, way, relation
            point.coord = new L.LatLng($(this).attr("lat"), $(this).attr("lon"));
            point.desc = $(this).attr("display_name");                              // long disp. name

            point.tag = $(this).attr("class");
            point.value = $(this).attr("type");

            point.name = $(this).find($(this).attr("type")).text();                 // name
            point.number = $(this).find("house_number").text();                     // number for house/poi
            point.road = $(this).find("road").text();
            point.pedestrian = $(this).find("pedestrian").text();   //wtf? why they made this
            
            point.district = $(this).find("city_district").text();
            point.city = $(this).find("city").text();
            point.county = $(this).find("county").text();
            point.state = $(this).find("state").text();
            point.country = $(this).find("country").text();
            
            point.polygon = $(this).attr("polygonpoints");
            
            //nominatim fixes
            //if(point.name === '') point.name = point.value;
            //if(point.name === 'house') point.name = 'numer '+point.number;
            //if(point.road === '') point.road = point.pedestrian;
            
//            if(point.name === undefined)
//                point.name = $(this).find($(this).attr("place")).each(function(){
//                    alert($(this).text());
//                });

        //type
        if(point.tag === "place") {
            point.type = search.type.ADDR;
            search.results[$(this).attr("osm_id")] = point;
        } 
        if(point.tag === "boundary" && point.value === "administrative") {
            point.type = search.type.ADDR;
            search.results[$(this).attr("osm_id")] = point;
        }
        if(point.tag === "amenity" || point.tag === "shop") {
            point.type = search.type.POI;
            search.results[$(this).attr("osm_id")] = point;
        }
        if(point.tag === "railway") {
            point.type = search.type.POI;
            search.results[$(this).attr("osm_id")] = point;
        }
        if(point.tag === "highway") {
            point.type = search.type.ADDR;
            search.results[$(this).attr("osm_id")] = point;
        } 
//        if($(this).attr("class")=="highway")
//            point.type = search.type.ADDR;

        
    });

    // add to map
    for(var i in search.results) {
        search.desc['addr'] += search.results[i].getInfo(); 
        console.log(search.results[i].getInfo());
        layers.search.addLayer(search.results[i].getMarker());
                
//        switch(search.results[i].type) {
//            case search.type.ADDR:
//                search.desc['addr'] += search.results[i].getInfo(); 
//                layers.search.addLayer(search.results[i].getMarker());
//                break;
//            case search.type.POI:
//                search.desc['poi'] += search.results[i].getInfo();
//                layers.search.addLayer(search.results[i].getMarker());
//                break;
//        }
    }
    map.fitZoom(search.results);

    //show
    
    //auto
    $("#box-search > div").animate({bottom: 0}, 300);
    $("#box-search-results-container").delay(300).fadeIn(150);

    //content
    $("#box-search-switcher button[name=addr]").click();
    /*$("#box-search-results div[name=addr]").html(search.desc['addr']);
    $("#box-search-results div[name=poi]").html(search.desc['poi']);*/
    $("#tool-search .tool-results").html(search.desc['addr']);      
};



search.returnBox = function() {
    
};