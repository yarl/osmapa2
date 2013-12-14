var routing = {};

/*
 * Open/close panel
 */
var brouting = false;
$(".navbar #nav").click(function () {
    if(!brouting) routing.showPanel();
    else routing.hidePanel();
});

routing.showPanel = function() {
    if(bsearch) {
        $("#tool-search").fadeOut('quick');
        $(".navbar #search").removeClass('active');
        bsearch = false;
        $("#tool-nav").delay(150);
    }
    $(".navbar #nav").addClass('active');
    $("#tool-nav").fadeIn('quick');
    brouting = true;
};

routing.hidePanel = function() {
    $(".navbar #nav").removeClass('active');
    $("#tool-nav").fadeOut('quick');
    brouting = false;
};


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

$('#nav-search').click(function(){
  routing.script("road_search");
});

$('#nav-clear').click(function(){
  routing.clear();
});

routing.reverseGeocodePoint = function(point) {
    var coords;
    if(point === "start") {
        coords = routing.startPoint.getLatLng();
        $('#nav-start').val(coords.lat+","+coords.lng); 
    } else if(point === "end") {
        coords = routing.endPoint.getLatLng();
        $('#nav-end').val(coords.lat+","+coords.lng); 
    };
    
    $.ajax({
        type: "GET",
        dataType : 'text',
        crossDomain: true,
        url: "http://nominatim.openstreetmap.org/reverse",
        data: "format=xml&lat="+coords.lat+"&lon="+coords.lng,
        error:function(xhr, status, errorThrown) {
            alert("Błąd: " + errorThrown);
	},
        success: function(output) {
            var text = $(output).find("result").text();
            routing.showPanel();
            if(point === "start") {
               $('#nav-start').val(text); 
               routing.startPoint.setPopupContent('<div class="popup-body"><h1>Początek trasy</h1><div>'+text+'</div></div>');
            } 
            else if(point === "end") {
                $('#nav-end').val(text);
                routing.endPoint.setPopupContent('<div class="popup-body"><h1>Koniec trasy</h1><div>'+text+'</div></div>');
            }  
        }
    });
};

var hackCounter = 0;
routing.setStartPoint = function(latlng) {
    if(routing.startPoint !== undefined)
        routing.points.removeLayer(routing.startPoint);
    routing.startPoint = L.marker(latlng instanceof L.LatLng ? latlng : map._lastClick, {draggable:true, icon: routing.icon})
        .on('dragend', function() {
            routing.script("road");
            routing.reverseGeocodePoint("start");
        })
        .on('drag', function() {
          hackCounter++;
          if(hackCounter === 20) { routing.script("road_drag"); hackCounter = 0; }
        })
        .bindPopup('<div class="popup-body"><h1>Początek trasy</h1><div></div></div>')
        .addTo(routing.points);
        
    routing.script("road");
    routing.reverseGeocodePoint("start");
};

routing.setEndPoint = function(latlng) {
    if(routing.endPoint !== undefined)
        routing.points.removeLayer(routing.endPoint);
    
    routing.endPoint = L.marker(latlng instanceof L.LatLng ? latlng : map._lastClick, {draggable:true, icon: routing.icon})
        .on('dragend', function() {
            routing.script("road");
            routing.reverseGeocodePoint("end");
        })
        .on('drag', function() {
          hackCounter++;
          if(hackCounter === 20) { routing.script("road_drag"); hackCounter = 0; }
        })
        .bindPopup('<div class="popup-body"><h1>Koniec trasy</h1><div></div></div>')
        .addTo(routing.points);

    routing.script("road");
    routing.reverseGeocodePoint("end");
};

routing.script = function(f) {
    routing.showPanel();
    if(f === "road_search") {
      if($('#nav-start').val() !== "" && $('#nav-end').val() !== "") {
        console.log('szukamy');
        routing.text2coord('start', $('#nav-start').val());
        routing.text2coord('end', $('#nav-end').val());
      };
      return;
    }

    if(routing.startPoint !== undefined && routing.endPoint !== undefined) {
        var link = "http://router.project-osrm.org/viaroute?jsonp=routing."+f+"&instructions=true"+
            "&loc="+routing.startPoint.getLatLng().lat+","+routing.startPoint.getLatLng().lng+
            "&loc="+routing.endPoint.getLatLng().lat+","+routing.endPoint.getLatLng().lng;
        //console.log(link);

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

routing.text2coord = function(type, text) {
  $.ajax({
    type: "GET",
    dataType : 'text',
    crossDomain: true,
    url: "http://nominatim.openstreetmap.org/search",
    data: "q="+text+"&format=xml&addressdetails=1&polygon=0",
    error:function(xhr, status, errorThrown) {
            alert("Błąd: " + errorThrown);
    },
    success: function(output) {
      $(output).find('place').each(function() {
        var obj = {};
          obj.coord = new L.LatLng($(this).attr("lat"), $(this).attr("lon"));
          obj.name = $(this).attr("display_name");
          obj.id = $(this).attr("place_id");

          if(type === "start")  routing.setStartPoint(obj.coord);
          if(type === "end")    routing.setEndPoint(obj.coord);
        return false;
      });
        console.log('brak?');
        return;
    }
  });
};

routing.road = function(data) {
    routing.route.clearLayers();
    routing.routeBuff.clearLayers();
    var route = L.polyline(routing.decode(data.route_geometry, 6));
    routing.route.addLayer(route);
    
    $("#tool-nav").css("bottom", "10px");
    $('#nav-results').html(routing.instructions(data.route_instructions));
    $("#tool-nav .tool-results-container").fadeIn('quick');
    //map.fitBounds(route.getBounds());
};

routing.clear = function() {
    $("#tool-nav .tool-results-container").fadeOut('quick');
    $("#tool-nav").css("bottom", "auto");
    map.removeLayer(routing.startPoint);
    map.removeLayer(routing.endPoint);
    $('#nav-start').val('');
    $('#nav-end').val('');
    routing.route.clearLayers();
};


/**
 * @param {type} data encoded data
 */
routing.road_drag = function(data) {
    routing.routeBuff.clearLayers();
    var route = L.polyline(routing.decode(data.route_geometry, 6));
    routing.routeBuff.addLayer(route);
};

routing.instructions = function(data) {
  var text = '<table>';
  
  //https://github.com/DennisOSRM/Project-OSRM-Web/blob/master/WebContent/localization/OSRM.Locale.pl.js
  var texts = {
    "0":"Nieznana instrukcja na %DIRECTION",
    "1":"Kontynuuj[ drogą <b>%s</b>]",
    "2":"Skręć lekko w prawo[ na drogę <b>%s</b>]",
    "3":"Skręć w prawo[ na drogę <b>%s</b>]",
    "4":"Skręć ostro w prawo[ na drogę <b>%s</b>]",
    "5":"Zawróć[ na drogę <b>%s</b>]",
    "6":"Skręć ostro w lewo[ na drogę <b>%s</b>]",
    "7":"Skręć w lewo[ na drogę <b>%s</b>]",
    "8":"Skręć lekko w lewo[ na drogę <b>%s</b>]",
    "10":"Podążaj na %DIRECTION[ drogą <b>%s</b>]",
    "11-1":"Wjedź na rondo, zjedź pierwszym zjazdem[ na drogę <b>%s</b>]",
    "11-2":"Wjedź na rondo, zjedź drugim zjazdem[ na drogę <b>%s</b>]",
    "11-3":"Wjedź na rondo, zjedź trzecim zjazdem[ na drogę <b>%s</b>]",
    "11-4":"Wjedź na rondo, zjedź czwartym zjazdem[ na drogę <b>%s</b>]",
    "11-5":"Wjedź na rondo, zjedź piątym zjazdem[ na drogę <b>%s</b>]",
    "11-6":"Wjedź na rondo, zjedź szóstym zjazdem[ na drogę <b>%s</b>]",
    "11-7":"Wjedź na rondo, zjedź siódmym zjazdem[ na drogę <b>%s</b>]",
    "11-8":"Wjedź na rondo, zjedź ósmym zjazdem[ na drogę <b>%s</b>]",
    "11-9":"Wjedź na rondo, zjedź dziewiątym zjazdem[ na drogę <b>%s</b>]",
    "11-x":"Wjedź na rondo, zjedź wybranym przez siebie zjazdem [ na drogę <b>%s</b>]",
    "15":"Cel został osiągnięty",
    "N": "północ",
    "E": "wschód",
    "S": "południe",
    "W": "zachód",
    "NE": "północny wschód",
    "SE": "południowy wschód",
    "SW": "południowy zachód",
    "NW": "połnocny zachód",
  };
  
  
  for(var i in data) {
    text += '<tr>';
    var item = data[i];
    var instruction = texts[item[0]];
    
    instruction = instruction.replace('%DIRECTION', texts[item[6]]);
    instruction = item[1] === "" ?
      instruction.replace('[ na drogę <b>%s</b>]', '') :
      instruction.replace('[ na drogę <b>%s</b>]', ' na drogę <strong>' + item[1] + '</strong>');
      
    instruction = item[1] === "" ?
      instruction.replace('[ drogą <b>%s</b>]', '') :
      instruction.replace('[ drogą <b>%s</b>]', ' drogą <strong>' + item[1] + '</strong>');
    
    text += '<td>'+instruction+'</td>';
    
    if(item[7] !== 0)
      text += '<td>'+item[7]+' m</td>';
    text += '</tr>';
  };
  text += '<table>';
  
  return text;
};

routing.decode = function(encoded, precision) {
  precision = Math.pow(10, -precision);
  var len = encoded.length, index=0, lat=0, lng = 0, array = [];
  while (index < len) {
          var b, shift = 0, result = 0;
          do {
                  b = encoded.charCodeAt(index++) - 63;
                  result |= (b & 0x1f) << shift;
                  shift += 5;
          } while (b >= 0x20);
          var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
          lat += dlat;
          shift = 0;
          result = 0;
          do {
                  b = encoded.charCodeAt(index++) - 63;
                  result |= (b & 0x1f) << shift;
                  shift += 5;
          } while (b >= 0x20);
          var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
          lng += dlng;
          //array.push( {lat: lat * precision, lng: lng * precision} );
          array.push( [lat * precision, lng * precision] );
  }
  return array;
};