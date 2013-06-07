(function(window) {
    var HAS_HASHCHANGE = (function() {
        var doc_mode = window.documentMode;
        return ('onhashchange' in window) &&
            (doc_mode === undefined || doc_mode > 7);
    })();
    
    L.Hash = function(map) {
        this.onHashChange = L.Util.bind(this.onHashChange, this);
    
        if (map) {
            this.init(map);
        }
    };
    
    L.Hash.prototype = {
        map: null,
        lastHash: null,
    
        parseHash: function(hash) {
            //hash = hash.replace(/\?/g, "#");
            if(hash.indexOf('#') === 0) hash = hash.substr(1);  
            if(hash.indexOf('?') === 0) hash = hash.substr(1);
            
            var args = hash.split("&");
            if (args.length >= 3) {
                for(var i in args) {
                    if(args[i].search("lat=") !== -1)   var lat = parseFloat(args[i].substring(4,args[i].length));
                    if(args[i].search("lon=") !== -1)   var lon = parseFloat(args[i].substring(4,args[i].length));
                    if(args[i].search("z=") !== -1)     var zoom = parseInt(args[i].substring(2,args[i].length));
                    if(args[i].search("zoom=") !== -1)  var zoom = parseInt(args[i].substring(5,args[i].length));
                    
                    if(args[i].search("m=") !== -1 && args[i].search("zoom=") === -1) {
                        var id = args[i].substring(2,args[i].length);
                        layers.change("layer-"+id); 
                    }
                    
                    if(args[i].search("b=") !== -1) {
                        map.bugid = args[i].substring(2,args[i].length);
                        if(!bbugs)
                            $("#box-bugs h3").click();
                    }
                }
                
                /*
                var zoom = parseInt(args[0], 10),
                    lat = parseFloat(args[1].substring(4,args[1].length)),
                    lon = parseFloat(args[2]);
                */
                if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
                    return false;
                } else {
                    return {
                        center: new L.LatLng(lat, lon),
                        zoom: zoom
                    };
                }
            } else {
                return false;
            }
        },
        _change: function(source, param, text) {
            var r = new RegExp(param+"=[a-z0-9\.\-]*");
            
            var hash;
            if(text === null) {
                hash = source.replace('&'+param,param).replace(r,'');
            } else
                hash = (source.search(param+"=") !== -1) ? 
                    source.replace(r, param+"=" + text) : 
                    source.concat("&"+param+"=" + text);
            //console.log(param + ": "+hash);
            return hash;
        },
        formatHash: function() {
            var center = map.getCenter(),
                zoom = map.getZoom(),
                precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
             
            if(this.lastHash !== null) {
                var ret = this.lastHash;
                ret = this._change(ret, "lat", center.lat.toFixed(precision));
                ret = this._change(ret, "lon", center.lng.toFixed(precision));
                ret = this._change(ret, "z", zoom);
                ret = this._change(ret, "m", map.layer);
                
                ret = this._change(ret, "zoom", null);
                ret = this._change(ret, "map", null);
                ret = this._change(ret, "o", null);
                return ret;
                
//                var r_lat = new RegExp("lat=[0-9\.]*");
//                var r_lon = new RegExp("lon=[0-9\.]*");
//                var r_z = new RegExp("z=[0-9]*");
//                var r_m = new RegExp("m=[a-z]*");
//                return this.lastHash.replace(r_lat, "lat=" + center.lat.toFixed(precision))
//                                    .replace(r_lon, "lon=" + center.lng.toFixed(precision))
//                                    .replace(r_z, "z=" + zoom)
//                                    .replace(r_m, "m=" + map.layer);
            } 
            else {
                var str = "http://" + location.host + location.pathname + "#lat=" + center.lat.toFixed(precision) + "&lon=" + center.lng.toFixed(precision) + "&z=" + zoom + "&m=" + map.layer;
                this.lastHash = str;
                location.replace(str);
                return str;
            }
        },
        changeHash: function(param, text) {
            if(this.lastHash === undefined)
                this.onMapMove(map);

            var hash = this.lastHash;
            hash = this._change(hash, param, text);
            
            if (this.lastHash !== hash) {
                location.replace(hash);
                this.lastHash = hash;
            }
        },
        init: function(map) {
            this.map = map;
            
            this.map.on("moveend", this.onMapMove, this);
            
            var that = this;
            $("#box-layers button").click(function () {
                that.map.fire("moveend");
            });
                        
            // reset the hash
            this.lastHash = null;
            this.onHashChange();
    
            if (!this.isListening) {
                this.startListening();
            }
        },
    
        remove: function() {
            this.map = null;
            if (this.isListening) {
                this.stopListening();
            }
        },
        
        onMapMove: function(map) {
            // bail if we're moving the map (updating from a hash),
            // or if the map has no zoom set
            
            if (this.movingMap || this.map.getZoom() === 0)
                return false;
            if (location.hash.length>0)
                this.lastHash = location.hash;
            
            var hash = this.formatHash(this.map);
            if (this.lastHash !== hash) {
                location.replace(hash);
                this.lastHash = hash;
            }
        },
    
        movingMap: false,
        update: function() {
            var hash = location.hash;
            if(location.hash.length===0) hash = location.search;
            if (hash === this.lastHash) {
                // console.info("(no change)");
                return;
            }
            var parsed = this.parseHash(hash);
            if (parsed) {
                // console.log("parsed:", parsed.zoom, parsed.center.toString());
                this.movingMap = true;
                
                this.map.setView(parsed.center, parsed.zoom);
                
                this.movingMap = false;
            } else {
                // console.warn("parse error; resetting:", this.map.getCenter(), this.map.getZoom());
                this.onMapMove(this.map);
            }
        },
        // defer hash change updates every 100ms
        changeDefer: 100,
        changeTimeout: null,
        onHashChange: function() {
            // throttle calls to update() so that they only happen every
            // `changeDefer` ms
            if (!this.changeTimeout) {
                var that = this;
                this.changeTimeout = setTimeout(function() {
                    that.update();
                    that.changeTimeout = null;
                }, this.changeDefer);
            }
        },
    
        isListening: false,
        hashChangeInterval: null,
        startListening: function() {
            if (HAS_HASHCHANGE) {
                L.DomEvent.addListener(window, "hashchange", this.onHashChange);
            } else {
                clearInterval(this.hashChangeInterval);
                this.hashChangeInterval = setInterval(this.onHashChange, 50);
            }
            this.isListening = true;
        },
    
        stopListening: function() {
            if (HAS_HASHCHANGE) {
                L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
            } else {
                clearInterval(this.hashChangeInterval);
            }
            this.isListening = false;
        }
    };
})(window);