var layers = {};

layers.container = new L.LayerGroup();  //main layer
layers.container_ = new L.LayerGroup(); //overlay

layers.search = new L.LayerGroup();
layers.attrib = ' &copy; autorzy <a href="http://openstreetmap.org">OpenStreetMap</a>';

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
    'http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png',
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