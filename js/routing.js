var routing = {};

$(document).ready(function() {
    routing.route = new L.LayerGroup().addTo(map);
    routing.routeBuff = new L.LayerGroup().addTo(map);
    
    routing.points = new L.LayerGroup().addTo(map);
    
    //context menu
    $("#map").contextmenu({
        width: 150,
        items: [
            { text: "Start", icon: "img/route.png", alias: "1-1", action: routing.setStartPoint },
            { text: "Koniec", icon: "img/route.png", alias: "1-2", action: routing.setEndPoint },
            { type: "splitLine" },
            { text: "Wyśrodkuj tutaj", icon: "img/pin.png", alias: "2-1", action: map.move }
            /*{ text: "Szablony dla Wikipedii", icon: "img/route.png", alias: "2-2", action:  }*/
        ]
    });
});

routing.icon = L.icon({
    iconUrl: 'js/leaflet/images/marker-routing.png',
    shadowUrl: 'js/leaflet/images/marker-shadow.png',
    iconSize: [31, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -41]
});

routing.setStartPoint = function() {
    if(routing.startPoint !== undefined)
        routing.points.removeLayer(routing.startPoint);
    routing.startPoint = L.marker(map._lastClick, {draggable:true, icon: routing.icon})
        .on('dragend', function() {
            routing.script("road");
        })
        .on('drag', function() {
            routing.script("road_drag");
        })
        .bindPopup('<div class="popup-body"><h1>Początek trasy</h1><div>Lorem ipsum</div></div>')
        .addTo(routing.points);
        
    routing.script("road");
};

routing.setEndPoint = function() {
    if(routing.endPoint !== undefined)
        routing.points.removeLayer(routing.endPoint);
    
    routing.endPoint = L.marker(map._lastClick, {draggable:true, icon: routing.icon})
        .on('dragend', function() {
            routing.script("road");
        })
        .on('drag', function() {
            routing.script("road_drag");
        })
        .bindPopup('<div class="popup-body"><h1>Koniec trasy</h1><div>Lorem ipsum</div></div>')
        .addTo(routing.points);

    routing.script("road");
};

routing.script = function(f) {
    if(routing.startPoint !== undefined && routing.endPoint !== undefined) {
        var link = "http://router.project-osrm.org/viaroute?jsonp=routing."+f+"&instructions=true"+
            "&loc="+routing.startPoint.getLatLng().lat+","+routing.startPoint.getLatLng().lng+
            "&loc="+routing.endPoint.getLatLng().lat+","+routing.endPoint.getLatLng().lng;

        var script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'jsonp_'+f;
            script.src = link;
        document.head.appendChild(script);

        var jsonp = document.getElementById('jsonp_'+f);
        if(jsonp)
            jsonp.parentNode.removeChild(jsonp);
    }
};

routing.road = function(data) {
    routing.route.clearLayers();
    routing.routeBuff.clearLayers();
    var route = L.Polyline.fromEncoded(data.route_geometry);
    routing.route.addLayer(route);
    //map.fitBounds(route.getBounds());
};

routing.road_drag = function(data) {
    routing.routeBuff.clearLayers();
    var route = L.Polyline.fromEncoded(data.route_geometry);
    routing.routeBuff.addLayer(route);
};