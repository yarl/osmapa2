var map = {};

$(document).ready(function() {
 
    var startPosition = {};
    if(localStorage.getItem("lat") !== null) {
        startPosition.lat = localStorage.getItem("lat");
        startPosition.lon = localStorage.getItem("lon");
        startPosition.zoom = localStorage.getItem("zoom");
    } else {
        startPosition.lat = 52.2484;
        startPosition.lon = 20.9928;
        startPosition.zoom = 13;
    }
 
    map = L.map('map', {
        center: new L.LatLng(startPosition.lat, startPosition.lon),
        zoom: startPosition.zoom,
        layers: [layers.container_, layers.container, layers.search],
        minZoom: 3
    });
    L.control.scale().addTo(map);
    //L.control.geoloc().addTo(map);
    //L.control.fullscreen().addTo(map);
    map.attributionControl.setPrefix('');
    
    // layers
    map.layer = undefined;
    $("#box-layers button[name=osmapa]").click();
    map.hash = new L.Hash(map);
    
    //save position
    map.on('moveend',function() {
        localStorage.setItem("lat", map.getCenter().lat);
        localStorage.setItem("lon", map.getCenter().lng);
    });
    map.on('zoomend',function() {
        localStorage.setItem("zoom", map.getZoom());
    });

    map._lastClick = new L.LatLng(0,0);
    map.on('contextmenu', function(e) {
        map._lastClick = e.latlng;
        console.log(e.latlng);
    });
    
    map.move = function() {
        map.panTo(map._lastClick);
    };
    
    map.fitZoom = function(array) {
        var minLat;
        var maxLat;
        var minLon;
        var maxLon;
        
        for(var i in array) {
            if(minLat === undefined) {
                minLat = array[i].coord.lat;
                maxLat = array[i].coord.lat;
                minLon = array[i].coord.lng;
                maxLon = array[i].coord.lng;
            }
                if(array[i].coord.lat>maxLat) maxLat = array[i].coord.lat;
                if(array[i].coord.lat<minLat) minLat = array[i].coord.lat;
                if(array[i].coord.lng>maxLon) maxLon = array[i].coord.lng;
                if(array[i].coord.lng<minLon) minLon = array[i].coord.lng;
        }
        map.fitBounds([[minLat, minLon], [maxLat, maxLon]]);
    };
});
   
/*
* Layers
* *****************************************************************************
*/
var blayers = false;
$("#box-layers h3").click(function () {
    if(!blayers) {
        $("#box-layers").animate({width: "315px"}, 200);
        $("#box-layers > div").delay(180).slideToggle(150);
        $("#box-layers h3").css("border-radius","0 4px 0 0");
    } else {
        $("#box-layers > div").slideToggle(150);
        $("#box-layers").delay(180).animate({width: "35px"}, 200);
        $("#box-layers h3").css("border-radius","0 4px 4px 0");
    }
    blayers = !blayers;
});

// Change layer
$("#box-layers button").click(function () {
    layers.change($(this).attr('id'));
});

layers.change = function(id) {
    var name = $("#box-layers button[id="+id+"]").attr('name');

    //layer
    if(id.indexOf("layer") !== -1) {
        map.layer = id.substring(6, 8);
        layers.container.clearLayers();
        layers.container.addLayer(eval("layers."+name));
        if(name === "bing")
            layers.container.addLayer(layers.names);

    //overlay
    } else {
        var b = eval("map."+name);
        b ? layers.container_.removeLayer(eval("layers."+name)) : layers.container_.addLayer(eval("layers."+name));
        eval("map."+name+" = !b");
    }
};

/*
* Edit
* ******************************************************************************
*/
var bedit = false;
$("#box-edit h3").click(function () {
    if(!bedit) {
        $("#box-edit div").show().animate({width: "150px"}, 200);
        $("#box-edit h3").css("border-radius","0");
    } else {
        $("#box-edit div").animate({width: "0px"}, 200).hide(1);
        $("#box-edit h3").css("border-radius","0 4px 0 0");
    }
    bedit = !bedit;
});

/*
* Bugs
* ******************************************************************************
*/
var bbugs = false;  
layers.osb = new L.OpenStreetBugs({
    dblClick: false, 
    iconOpen:"http://osmapa.pl/bugs/img/open_bug_marker.png", 
    iconClosed:"http://osmapa.pl/bugs/img/closed_bug_marker.png", 
    iconActive:"http://osmapa.pl/bugs/img/active_bug_marker.png", 
    editArea:0.001
});

$("#box-bugs h3").click(function () {
    if(!bbugs) {
        $("#box-bugs div").show().animate({width: "150px"}, 200);
        $("#box-bugs h3").css("border-radius","0");
        map.hash.changeHash("b","t");
        map.addLayer(layers.osb);
    } else {
        $("#box-bugs div").animate({width: "0px"}, 200).hide(1);
        $("#box-bugs h3").css("border-radius","0 0 4px 0");
        map.hash.changeHash("b",null);
        map.removeLayer(layers.osb);
    }
    bbugs = !bbugs;
});
