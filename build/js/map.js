//to do
//1 - specify id to layer features/points methods so you can specify a key function
//    also necessary to eventually bind to data!
//2 - add voronoi option to points layers
//3 - scales
//4 - legends
//5 - titles?

//Notes -- keep a tight coupling of layer addition/subtraction, projection mutation, and drawing

//browser requirements: indexOf, map, filter, svg methods (Promises? - not yet)

/////////////// LAYER DRAW - PROJ UPDATE CONTINGENCIES /////////////////////////////////////////////
// layer.draw() is called directly by...        par.proj up to date?
// ...map.draw()                                yes - map_projection() called prior to layer.draw()
// ...map.resize()                              yes - "
// ...itself (by user)                          yes - three methods add/remove features to map:
//                                                    1. features(), 2. points(), and 3. remove().
//                                                    And each calls map.resize() after updating
//                                                    composite geo. So, proj is always up-to-date
//                                                    with existing map features. Setting new projection
//                                                    subsequently calls map.resize() to keep all existing
//                                                    layers up to date with par.proj.


/////////////// UNIT TESTS /////////////////////////////////////////////////////////////////////////
// 1) Add 3 layers, testing bbox and composite geo each time (draw them with opacity) and look
// at layers list. Verify removal also updates and that no trace remains of layer within map
//
// 2) Validate layer bounding boxes against known geo bounds after initializing, then updating features
// 3) Validate geo merging in three cases: user provided 1) function, 2) string, or 3) no key
// 4) Validate attr and style functions -- all cases
// 5) Validate data bind and handling of dupes and missings. missing should always be null, never undefined
//    Special cases: update features after binding data, update data after drawing features once

export default function map(container, map_proj){
    
    // ================================= dom structure ===================================== //
    
    //throw an error if no map container is specified
    if(arguments.length==0){
        throw new Error("You must specify a dom node as map container");
    }

    var dom = {};
    dom.root = container;

    //DO NOT set dimensions on outer_wrap. poll it for available map dimensions 
    dom.outer_wrap = d3.select(dom.root).append("div").style("width","100%").style("min-height","150px")
                                        .style("min-width","280px").style("padding","0px").style("margin","0px")
                                        .style("border","none").style("position","relative");

    //container of canvas, svg, and tooltip. DO set the dimensions on wrap programatically
    dom.wrap = dom.outer_wrap.append("div").style("width","100%").style("height","100%")
                                    .style("min-height","150px").style("padding","0px").style("margin","0px")
                                    .style("position","relative").style("overflow","hidden")
                                    .style("z-index","2");

    //canvas and svg are set to 100% width of parent, dom.wrap
    dom.canvas = dom.wrap.append("canvas").style("width","100%").style("height","100%").style("position","absolute").style("z-index","2").style("top","0px").style("left","0px");
    dom.svg = dom.wrap.append("svg").attr("width","100%").attr("height","100%").style("position","relative").style("z-index","3");
      dom.gmain = dom.svg.append("g"); //umbrella grouping, used for panning
        dom.g0 = dom.gmain.append("g"); //used for any background features
        dom.g = dom.gmain.append("g"); //main feature group
        dom.g2 = dom.gmain.append("g"); //annotation group, used for highlighting
    
    //tooltip is a sibling to dom.wrap that contains the svg/canvas
    dom.tooltip = {};
    dom.tooltip.wrap = dom.outer_wrap.append("div").style("position","absolute").style("visibility","hidden")
                                 .style("opacity","0").style("pointer-events","none").style("z-index","4")
                                 .style("min-height","5em");
    dom.tooltip.pad = 20;
    dom.tooltip.content = dom.tooltip.wrap.append("div").style("margin","0px "+dom.tooltip.pad+"px")
                                    .style("background-color","#ffffff").style("padding","10px 15px")
                                    .style("position","relative").style("border","1px solid #333333")
                                    .style("border-radius","5px").style("min-height","50px")
                                    .style("box-shadow", "4px 4px 10px 0px rgba(0,0,0,0.25)")
                                    ;  

    //tooltip test area used to calculate width of tooltip content
    dom.tooltip.test = dom.outer_wrap.append("div").style("width","100%").style("height","100%")
                                 .style("position","absolute").style("z-index","0")
                                 .style("visibility","hidden").append("div").style("display","inline-block");

    //arrow indicators pointing to geo
    dom.tooltip.arrowleft = dom.tooltip.wrap.append("svg").attr("width",(dom.tooltip.pad+2)+"px").attr("height","100%")
                       .style("position","absolute").style("left","0px").style("top","15px").style("z-index",20);
                       
    dom.tooltip.arrowleft.append("path").attr("d", "M"+dom.tooltip.pad+",0 l-15,10 l15,10 z").attr("fill","#ffffff")
                       .attr("stroke","#333333").style("pointer-events","none");
    dom.tooltip.arrowleft.append("path").attr("d", "M"+(dom.tooltip.pad+2)+",0 l-15,10 l15,10 z").attr("fill","#ffffff")
                       .attr("stroke","none").style("pointer-events","none");           

    dom.tooltip.arrowright = dom.tooltip.wrap.append("svg").attr("width",(dom.tooltip.pad+2)+"px").attr("height","100%")
                       .style("position","absolute").style("right","0px").style("top","15px").style("z-index",20);
    dom.tooltip.arrowright.append("path").attr("d", "M2,0 l15,10 l-15,10 z").attr("fill","#ffffff")
                       .attr("stroke","#333333").style("pointer-events","none");
    dom.tooltip.arrowright.append("path").attr("d", "M0,0 l15,10 l-15,10 z").attr("fill","#ffffff")
                       .attr("stroke","none").style("pointer-events","none");

    //zoom button
    dom.zoom = {};
    dom.zoom.button = dom.outer_wrap.append("div").style("position","absolute").style("top","60%").style("right","10px")
                                    .style("width","60px").style("height","40px").style("z-index","10")
                                    .style("cursor","pointer").style("padding","5px 7px").style("border","0px solid #dddddd")
                                    .style("border-radius","15px").style("z-index","10");

    dom.zoom.svg = dom.zoom.button.append("svg").attr("width","40px").attr("height","30px").attr("viewBox","0 0 40 30");
    
    dom.zoom.in = dom.zoom.svg.append("g").attr("transform","translate(0,-1050)").attr("stroke","#444444")
                                        .attr("stroke-linecap","round").attr("fill","none");   

    dom.zoom.in.append("path").attr("stroke-width","4").attr("d", "m23.282 1070.1 7.3299 7.3299m-6.0819-15.665c-0.000012 4.979-4.0363 9.0152-9.0152 9.0152-4.979 0-9.0152-4.0362-9.0152-9.0152 0.0000119-4.979 4.0363-9.0152 9.0152-9.0152 4.979 0 9.0152 4.0362 9.0152 9.0152z");
    dom.zoom.in.append("path").attr("stroke-width","2").attr("d", "m10.856 1061.7h9.0873m-4.5437-4.5436v9.0873");

    dom.zoom.out = dom.zoom.svg.append("g").attr("transform","translate(0,-1050)").attr("stroke","#444444")
                                        .attr("stroke-linecap","round").attr("fill","none").style("visibility","hidden");   

    dom.zoom.out.append("path").attr("stroke-width","4").attr("d", "m23.282 1070.1 7.3299 7.3299m-6.0819-15.665c-0.000012 4.979-4.0363 9.0152-9.0152 9.0152-4.979 0-9.0152-4.0362-9.0152-9.0152 0.0000119-4.979 4.0363-9.0152 9.0152-9.0152 4.979 0 9.0152 4.0362 9.0152 9.0152z");
    dom.zoom.out.append("path").attr("stroke-width","2").attr("d", "m10.856 1061.7h9.0873");

    // ================================= end dom structure ================================= //
    

    var map = {}; //map object returned to user

    //initial map bounding box: [[min lon, min lat], [max lon, max lat]] covers entire earth
    var map_bbox = [[-180, -90], [180, 90]];

    //map parameters
    var par = {
        proj: arguments.length > 1 ? map_proj : d3.geoAlbersUsa(), 
        aspect:0.66, 
        scalar:1, 
        responsive: true,
        zoomlevels: 1
    };

    //a composite geo with all features concatenated into a feature collection
    var composite_geo = null;

    // ===================== map layers ==================================================== //

    //stack of layer objects in the layers array
    var layers = [];

    function find_layer(name){
        var l = null;
        var i = -1;
        while(++i < layers.length){
            if(layers[i].name() == name){
                l = layers[i];
                break;
            }
        }
        return l;
    }

    //return bounding box of a single layer's features as 
    //bbox structure described here: https://github.com/d3/d3-geo#geoBounds
    //[[min lon, min lat], [max lon, max lat]]
    function get_layer_bbox(layer){

        var features = layer.features();

        try{
            if(features==null){
                throw new Error("BBox is undefined without features");
            }
            //embed features in a feature collection
            var asFC = {
                "type": "FeatureCollection",
                "features": features
            }
            var bbox = d3.geoBounds(asFC);
        }
        catch(e){
            var bbox = map_bbox;
        }
        finally{
            return bbox;
        }
    }

    //calculate and set bbox of map, incorporating all layers
    function set_map_bbox(){
        try{
            if(layers.length > 0){
                var min_lon = [];
                var min_lat = [];
                var max_lon = [];
                var max_lat = [];
                layers.forEach(function(l, i){
                    var l_bbox = l.bbox();
                    min_lon.push(l_bbox[0][0]);
                    min_lat.push(l_bbox[0][1]);
                    max_lon.push(l_bbox[1][0]);
                    max_lat.push(l_bbox[1][1]);

                    //console.log("LAYER " + i +  " BBOX")
                    //console.log(JSON.stringify(l_bbox));
                });

                var mins = [d3.min(min_lon), d3.min(min_lat)];
                var maxs = [d3.max(max_lon), d3.max(max_lat)];

                var bbox = [mins, maxs];
            }
            else{
                throw new Error("No layers available to compute map bbox");
            }           
        }
        catch(e){
            //console.log(e);
            //if error or no data, revert back to full globe bounding box
            var bbox = [[-180, -90], [180, 90]];
        }
        finally{
            //console.log("COMPOSITE MAP BBOX")
            //console.log(JSON.stringify(bbox));
            map_bbox = bbox;
        }
    }

    //concatenate all features into a single geojson feature collection
    function set_composite_geojson(){
        var all_features = [];
        layers.forEach(function(l){
            var f = l.features();
            if(f != null){
                f.forEach(function(feature){
                    all_features.push(feature);
                })
            }
        });

        if(all_features.length > 0){
            var comp =  {
                "type": "FeatureCollection",
                "features": all_features
            }
        }
        else{
            comp = null;
        }

        composite_geo = comp;
    }

    //getters for composite geojson and map bbox
    map.composite = function(){
        return composite_geo;
    }

    map.bbox = function(){
        return map_bbox;
    }



    //add in the map.layer method that adds new layers
    //returns a layer object with various methods described below
    //if a layer with name already exists in map, return the layer object
    map.layer = function(name){
        if(arguments.length > 0 && find_layer(name) !== null){
            //return existing layer
            return find_layer(name);
        }
        else{
            //create new layer
            var g = dom.g.append("g");
            var selection;
            var features; //as in "features" array of FeatureCollection: each feature object type is any geo type accepted by D3
            var points; //x-y data passed into layer.points
            var layer_bbox = map_bbox; //default is existing map bbox
            var layer_data = null; //data store for layer
            var onePath = false; //draw features individually, not as one path
            var geokey = null;
            var layer_name = arguments.length > 0 ? name : null; //fallback name is null
            var aes = {};

            //layer object
            var layer = {};

            //push layer on to layers stack
            layers.push(layer);

            g.attr("data-name", layer_name);
            
            //layer methods
            //get selection -- importantly, selection isn't available until a draw is done
            //redraw map upon each layer added? -- need to specify projection to layer?
            layer.selection = function(){
                return selection;
            }

            //getter for layer name
            layer.name = function(){
                return layer_name;  
            }

            //getter for layer bbox
            layer.bbox = function(){
                return layer_bbox;
            }            

            //need to specify a geo key function (geokey) that will used to (1) retrieve data from a lookup table
            //and (2) be used as a key function when regenerating a layer's selection
            //make sure to check for duplicates in layer features based on the key function
            layer.features = function(f, key, asOnePath){
                if(arguments.length==0){
                    return features;
                }
                else if(f.hasOwnProperty("type") && f.type=="FeatureCollection" && f.features.length > 0){
                    features = f.features;
                }
                else if(f instanceof Array && f.length > 0){
                    features = f;
                }
                else{
                    throw new Error("Argument must be a FeatureCollection or an array of D3-supported geojson feature objects");
                }
            
                layer_bbox = get_layer_bbox(this);
                
                //set composite map bbox and geojson object -- do before any drawing
                set_map_bbox();
                set_composite_geojson();

                //set geo key function prior to drawing in map.resize()
                if(typeof key == "function"){
                    geokey = key;
                }
                else if(typeof key == "string"){
                    geokey = function(feature){
                        return feature.properties[key];
                    }
                }
                else{
                    geokey = null;
                }

                if(!!asOnePath){
                    onePath = true;
                }

                //redraw all layers "d", "cx", and "cy" attributes to accommodate any resizing introduced by this layer
                //and to populate the selection for immediate styling after registering features -- avoids having to call
                //map.draw() directly when implementing a map
                map.resize();

                //duplicate geo features?
                if(geokey != null){
                    var counts = d3.nest().key(geokey).rollup(function(d){
                        return d.length;
                    }).entries(features);

                    counts.forEach(function(d){
                        if(d.value > 1){
                            console.warn("Duplicate feature warning: " + d.value + " features with id value of " + d.key);
                        }
                    });
                }

                return this;
            }

            //create geojson features from an array of lon-lat data data objects: [{lon:x, lat:y, other:z, ...}, ...]
            //also need geo key function here. user should have the option to include all data in p
            layer.points = function(p, key, lonlat_accessor){
                if(arguments.length==0){
                    return points;
                }
                else if(p instanceof Array){

                    points = p; //set globally

                    var ll = (typeof lonlat_accessor == "function") ? lonlat_accessor : function(d){return [d.lon, d.lat]}

                    var f = p.map(function(d,i){
                        return {
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": ll(d)
                                },
                                "properties": d
                        }   
                    });

                    //now that data is standardized, pass off to layer.features()
                    this.features(f, key);
                }
                else{
                    throw new Error("Argument must be an array");
                }

                return this;
            }

            layer.remove = function(){
                //remove this layer from map layers array
                var index = layers.indexOf(this);
                if(index > -1){
                    layers.splice(index, 1);
                }

                //remove the main grouping from DOM and set variables back to null
                g.remove();
                selection = null;
                features = null;
                geokey = null;
                layer_data = null;
                points = null;

                //set composite map bbox and geojson object -- do before any drawing
                set_map_bbox();
                set_composite_geojson();

                //redraw "d", "cx", and "cy" attributes of all map layers
                map.resize();

                return this;
            }

            var layer_attrs = {};
            var layer_styles = {};

            //register attributes/styles
            //value can be a string, a number, or a function
            //if value is a function, it behaves as you'd expect with D3, being passed feature data, and index as first two args
            //here, it also receives a third arg which corresponds to the bound data value (by layer.data()), if applicable (otherwise null)
            layer.attr = function(attr, value){
                if(arguments.length==1){
                    return layer_attrs[attr];
                }
                else if(typeof value == "string" || typeof value == "number" || value === null){
                    layer_attrs[attr] = value;

                    if(selection != null){selection.attr(attr, value);} //null removes the attr
                }
                else if(typeof value == "function"){
                    
                    //function which is actually called on selection (e.g. selection.attr(attr, attr_fn))
                    //it wraps the value fn, passing a third parameter for a bound data object (bound by layer.data() -- null if not bound)
                    var attr_fn = function(feature, index){
                        var that = this; //feature node
                        var obs = null;

                        if(typeof geokey == "function" && layer_data != null){
                            obs = layer_data.lookup(geokey(feature)); //lookup returns null if nothing found
                        }

                        //while index may not be that useful, it is valuable to maintain similarity to the D3 API
                        return value.call(that, feature, index, obs);
                    }

                    layer_attrs[attr] = attr_fn;

                    if(selection == null){
                        console.warn("You're setting an attribute before features have been added. Make sure to call map.draw()")
                    }
                    else{
                        selection.attr(attr, attr_fn);
                    }
                }
                else{
                    //no-op
                }

                return this;
            }

            layer.style = function(style, value){



                    //make sure to include this warning
                    //if(selection == null){
                     //   console.warn("You're setting a style before features have been added. Make sure to call map.draw()")
                    //}
                    //else{
                     //   selection.style(attr, style_fn);
                    //}


                return this;
            }

            //fn arg analagous to value as function arg in layer.attr -- important to note that this does not return
            //a new map layer (should it?). it returns the underlying (filtered) selection
            layer.filter = function(fn){
                if(selection != null){
                    var filter_fn = function(feature, index){
                        var that = this; //feature node
                        var obs = null;

                        if(typeof geokey == "function" && layer_data != null){
                            obs = layer_data.lookup(geokey(feature)); //lookup returns null if nothing found
                        }
                        return fn.call(that, feature, index, obs);
                    }
                    return selection.filter(filter_fn);
                }
                else{
                    return null;
                }
            }

                //use case -- 
                layer.scales = {};

                layer.scales.radius = function(variable, max_radius){
                    //look at distriubtion, build scale

                    //generate sensible ticks for legend

                    //register with layer.attr()?
                    //should the scale update automatically with new data bind -- not in v1. 
                    //same issue with auto projections -- keep it simple for now

                    //what to return? something like:
                    return {
                        // scale: value to radius
                        // ticks: [array of values/labels for legend]
                        // methods to mutate scale (e.g. reverse, max/min)
                    }
                }

                layer.scales.gradient = function(variable, start, end){
                    //start could be a pre-defined

                }

                layer.scales.quantile = function(variable, cols){

                }

                layer.scales.categorical = function(variable, cols){
                    //have one default set

                }

            //register data in the form: [{idvar: "id", val:1, ...}, {}, {}, ... {}]
            //must include key function that uniquely identifies each geo -- used to merge using geokey above
            //note that dupes are removed.
            //this doesn't actually bind data as we should strive to keep geojson data bound and not mutate it.
            //also, not binding allows missing data values without removing those features from map
            layer.data = function(data, key){
                if(arguments.length==0){
                    return layer_data;
                }
                else if(data===null){
                    layer_data = null;
                }
                else if(arguments.length < 2){
                    throw new Error("You must specify a key function to merge data");
                }
                else if(data instanceof Array){
                    layer_data = build_layer_data(data, key);
                }
                else{
                    throw new Error("Data must be an array of objects or null")
                }

                return this;
            }

            //layer_data is either null or equal to the result of below
            function build_layer_data(data, key){
                //de-duped array of data
                var de_duped = [];

                var lookup = {};

                //keep track of dupes
                var dupes = []; 

                //de-duped data -- keep only first obs encountered for a geo
                data.forEach(function(d,i){

                    var id = key(d);

                    if(lookup.hasOwnProperty(id)){
                        //lookup already has data for geography -- observation is a duplicate
                        dupes.push(d);
                    }
                    else{
                        lookup[id] = d;
                        de_duped.push(d);
                    }
                });

                if(dupes.length > 0){
                    console.warn(dupes.length + " duplicate records found in data.");
                }

                return {
                    lookup: function(idvalue){return lookup.hasOwnProperty(idvalue) ? lookup[idvalue] : null},
                    data: de_duped,
                    dupes: dupes
                }
            }

            //known issue: this may fail with mixed feature arrays, especially if points come before polygons in array
            //to do: support mixed feature type layers -- would need to evaluate on feature-by-feature basis
            //consider filtering into arrays of feature by type?
            layer.draw = function(resizeOnly){
                if(features != null){

                    //check feature type, then render circle or paths accordingly
                    var isPoint = features[0].geometry.type == "Point";
                    var mark = isPoint ? "circle" : "path";
                    var update; //update selection

                    //if drawing one polygon, embed features in a single FeatureCollection
                    var f = onePath ? [{"type":"FeatureCollection", "features":features}] : features;

                    if(geokey == null || onePath){
                        update = g.selectAll(mark+".feature").data(f); //no key function in these cases
                    }
                    else{
                        update = g.selectAll(mark+".feature").data(f, geokey);
                    }

                    //finalize current selection
                    update.exit().remove();
                    selection = update.enter().append(mark).classed("feature", true).merge(update);

                    //always update cx and cy OR d
                    if(isPoint){
                        selection.attr("cx", function(d){
                                    try{
                                        var x = par.proj(d.geometry.coordinates)[0];
                                    }
                                    catch(e){
                                        console.warn("Point cannot be projected");
                                        var x = 0;
                                    }
                                    return x;
                                })
                                .attr("cy", function(d){
                                    try{
                                        var y = par.proj(d.geometry.coordinates)[1];
                                    }
                                    catch(e){
                                        console.warn("Point cannot be projected");
                                        var y = 0;
                                    }
                                    return y;
                                });
                    }
                    else{
                        var path = d3.geoPath(par.proj);

                        selection.attr("d", path);                        
                    }

                    //update aesthetics and styles if not resizeOnly
                    if(resizeOnly==null || !resizeOnly){
                        for(var attr in layer_attrs){
                            if(layer_attrs.hasOwnProperty(attr)){
                                selection.attr(attr, layer_attrs[attr]);
                            }
                        }

                        for(var style in layer_styles){
                            if(layer_styles.hasOwnProperty(style)){
                                selection.style(style, layer_styles[style]);
                            }
                        }                        
                    }     
                }
                else{
                    //console.log("NO FEATURES");
                }

                return this;
            }

            return layer;
        }
    } //end map.layer()

    map.layers = function(){
        return layers;
    }

    // ================= end map layers ==================================================== //


    // ========================== core map functions and methods =========================== //
    

    map.get_aspect = function(){
        return par.aspect;
    }

    //update projection/size of map and size of map container. accounts for zoom scalar
    //projection scale and translate are updated to fit all map features in the map container
    //if there aren't any features on the map yet, this is a no-op.
    //the map projection, stored in par.proj is updated in two places: 
    //(1) in arg to map initialization, and (2) using the map.projection() method
    function map_projection(){

        //mutate par.proj via local proj variable
        var proj = par.proj;

        //if any geo features are available, scale and translate the projection
        if(composite_geo != null){
            //width of container
            var cbox = dom.outer_wrap.node().getBoundingClientRect();
            var cwidth = cbox.right - cbox.left;

            //adjust projection scale and translate to fit a square defined by container width
            proj.fitExtent([[0,0], [cwidth, cwidth]], composite_geo)

            //create a geo path generator
            var path = d3.geoPath(proj); 

            //construct a planar bounding box around composite geo
            var bounds = path.bounds(composite_geo);

            //derive aspect ratio from the bounding box
            par.aspect = Math.abs(bounds[1][1]-bounds[0][1]) / (bounds[1][0]-bounds[0][0]);

            //width of map
            var mwidth = cwidth*par.scalar;
            var mheight = mwidth*par.aspect;

            //set width of wrap to match container (will clip map when scalar > 1)
            dom.wrap.style("width",cwidth+"px").style("height",(cwidth*par.aspect)+"px");

            //final adjustment to proj to fit final dimensions of scaled map
            //to do: points/circles at edge of composite geo will get cut off because bounds above will go through
            //center of circles 
            proj.fitExtent([[0,0], [mwidth, mheight]], composite_geo); 
            //to do--consider padding by size of largest radius
        }
        else{
            //null composite, no-op
        }
    }

    map.draw = function(){

        //update existing projection
        map_projection();

        layers.forEach(function(d){
            d.draw();
        });

        return this;
    }

    //layer resizing merely redraw "d", "cx", and "cy" attributes
    map.resize = function(){
        
        //update existing projection
        map_projection();

        layers.forEach(function(d){
            d.draw(true); //true implies resize only
        });

        return this;
    }

    //public projection method gets/sets the map projection. when setting a new
    //projection, the map is redrawn using map.resize();
    // review this
    map.projection = function(proj){
        if(arguments.length==0 || proj == null){
            return par.proj;
        }
        else{
            //set new projection directly -- avoid calling duplicate map_projection 
            //because it is called by resize() immediately after
            par.proj = proj;
            //resize all layers with updated projection  
            this.resize();

            return this;
        }
    }

    map.albers = function(){
        //create and apply localized albers projection
        var bbox = map_bbox;

        var top = bbox[1][1];
        var bottom = bbox[0][1];
        var left = bbox[0][0];
        var right = bbox[1][0];

        var lat_delta = top - bottom; //max lat - min lat

        var parallel1 = top - (lat_delta/4); //higher (1/4 lower than top)
        var parallel0 = bottom + (lat_delta/4); //lower

        var rotateX = left + ((right - left)/2);
        var centerY = bottom + (lat_delta/2);

        var albers = d3.geoAlbers().rotate([-rotateX,0]).center([0,centerY]).parallels([parallel0, parallel1]);        

        this.projection(albers);

        return this;
    }

    //resize
    var window_resize_timer;
    window.addEventListener("resize", function(){
        clearTimeout(window_resize_timer);
        if(par.responsive){
            window_resize_timer = setTimeout(function(){
                map.resize();
            }, 150);
        }
    })


    //private bar chart component to be used by layer objects above
    function bar_chart(){

    }

    return map;
}