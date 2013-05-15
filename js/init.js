var map = {};

var layers = {};
layers.container = new L.LayerGroup();
layers.container_ = new L.LayerGroup();

layers.search = new L.LayerGroup();
layers.attrib = ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

layers.osmapa = new L.tileLayer(
    'http://{s}.osm.trail.pl/osmapa.pl/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18 }
); 
layers.foursq = new L.tileLayer(
    'http://a.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 17 }
);
layers.osm = new L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18 }
); 
layers.hikebike = new L.tileLayer(
    'http://{s}.osm.trail.pl/hikebike/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18 }
); 
layers.mapsurfer = new L.tileLayer(
    'http://129.206.74.245:8001/tms_r.ashx?x={x}&y={y}&z={z}',
    { attribution: layers.attrib, maxZoom: 18 }
);  
layers.mapsurferbw = new L.tileLayer(
    'http://129.206.74.245:8008/tms_rg.ashx?x={x}&y={y}&z={z}',
    { attribution: layers.attrib, maxZoom: 18 }
);   
layers.mapquest = new L.tileLayer(
    'http://otile2.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18 }
);
layers.skobbler = new L.tileLayer(
        'http://tiles2.skobbler.net/osm_tiles2/{z}/{x}/{y}.png',
        { attribution: layers.attrib, maxZoom: 18 }
);
layers.bing = new L.BingLayer("Aof80DCiA7y03b6b3qi28v438KSMhXU5fmUL6K9op7N4U2wmW82qbRDHWUxyfpD8",
    { maxZoom: 18, opacity:1 });

layers.shadow = new L.tileLayer(
    'http://tiles2.openpistemap.org/landshaded/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.7, zIndex: 2 }
); 
layers.names = new L.tileLayer(
    'http://129.206.74.245:8003/tms_h.ashx?x={x}&y={y}&z={z}',
    { attribution: layers.attrib, maxZoom: 18, opacity:1, zIndex: 3 }
); 
layers.transport = new L.tileLayer(
    'http://pt.openmap.lt/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8, zIndex: 2 }
);
layers.paths = new L.tileLayer(
    'http://osm.trail.pl/szlaki/{z}/{x}/{y}.png',
    { attribution: layers.attrib, maxZoom: 18, opacity:0.8, zIndex: 2 }
);

$(document).ready(function() {
 
    map = L.map('map', {
        center: new L.LatLng(52.2484, 20.9928),
        zoom: 13,
        layers: [layers.container_, layers.container, layers.search],
        minZoom: 3
    });
    L.control.scale().addTo(map);
    //L.control.geoloc().addTo(map);
    //L.control.fullscreen().addTo(map);
    map.attributionControl.setPrefix('');
    
    // layers
    map.layer = undefined;
    $("#box-layers button[name=foursq]").click();
    map.hash = new L.Hash(map);
    
    map.on('moveend',function() {
        //if(map.layer == 1)
        //    api.query();
    });
    
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
        if(name == "bing")
            layers.container.addLayer(layers.names);

    //overlay
    } else {
        var b = eval("map."+name);
        b ? layers.container_.removeLayer(eval("layers."+name)) : layers.container_.addLayer(eval("layers."+name));
        eval("map."+name+" = !b");
    }
}

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
