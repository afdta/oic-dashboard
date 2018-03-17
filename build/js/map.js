//to do
//1 - specify id to layer features/points methods so you can specify a key function
//    also necessary to eventually bind to data!
//2 - add voronoi option to points layers
//3 - scales
//4 - legends
//5 - titles?

//browser requirements: indexOf, map, filter, svg methods (Promises? - not yet)

export default function map(container){
    
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
    map.bbox = [[-180, -90], [180, 90]];

    //map parameters
    var par = {
        proj:d3.geoAlbersUsa(), 
        aspect:0.66, 
        scalar:1, 
        responsive: true
    };

    //a composite geo with all features concatenated into a feature collection
    var composite_geo = null;

    // ===================== map layers ==================================================== //

    //stack of layer objects in the layers array
    //layer objects look like {name:"layer name", method1:fn, method2:fn, ...}
    var layers = [];

    function find_layer(name){
        var l = null;
        var i = -1;
        while(++i < layers.length){
            if(layers[i].name == name){
                l = layers[i];
                break;
            }
        }
        return l;
    }

    //return bounding box of a single layer's features as 
    //bbox structure described here: https://github.com/d3/d3-geo#geoBounds
    //[[min lon, min lat], [max lon, max lat]]
    function layer_bbox(features){
        try{
            if(features==null){
                throw new Error("You must pass a valid features array");
            }
            //embed features in a feature collection
            var asFC = {
                "type": "FeatureCollection",
                "features": features
            }
            var bbox = d3.geoBounds(asFC);
        }
        catch(e){
            var bbox = map.bbox;
        }
        finally{
            return bbox;
        }
    }

    //calculate and set bbox of map, incorporating all layers
    function map_bbox(){
        try{
            if(layers.length > 0){
                var min_lon = [];
                var min_lat = [];
                var max_lon = [];
                var max_lat = [];
                layers.forEach(function(l){
                    min_lon.push(l.bbox[0][0]);
                    min_lat.push(l.bbox[0][1]);
                    max_lon.push(l.bbox[1][0]);
                    max_lat.push(l.bbox[1][1]);
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
            map.bbox = bbox;
        }
    }

    //concatenate all features into a single geojson feature collection
    function composite_geojson(){
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

    map.composite = function(){
        return composite_geo;
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
            var data;
            var onePolygon = false; //draw features individually, not as one polygon
            var aes = {};

            //layer object
            var layer = {};

            //push layer on to layers stack
            layers.push(layer);

            layer.name = arguments.length > 0 ? name : null;

            //default is existing map bbox
            layer.bbox = map.bbox;

            //layer methods
            //get selection -- importantly, selection isn't available until a draw is done
            //redraw map upon each layer added? -- need to specify projection to layer?
            layer.selection = function(){
                return selection;
            }

            layer.features = function(f, proj, asOnePolygon){
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
            
                this.bbox = layer_bbox(features);
                
                //set composite map bbox and geojson object -- do before any drawing
                map_bbox();
                composite_geojson();

                if(arguments.length > 2 && !!asOnePolygon){
                    onePolygon = true;
                }

                //redraw all layers "d", "cx", and "cy" attributes to accommodate any resizing introduced by this layer
                //and to populate the selection for immediate styling after registering features -- avoids having to call
                //map.draw() directly when implementing a map
                map.resize(proj);

                return this;
            }

            //create geojson features from an array of lon-lat data data objects: [{lon:x, lat:y, other:z, ...}, ...]
            layer.points = function(p, lonlat_accessor, proj){
                if(arguments.length==0){
                    return points;
                }
                else if(p instanceof Array){

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
                    this.features(f, proj);
                }
                else{
                    throw new Error("Argument must be an array");
                }

                return this;
            }

            layer.remove = function(){
                try{
                    var index = layers.indexOf(this);
                    if(index > -1){
                        //remove from layers array
                        layers.splice(index, 1);
                    }
                }
                catch(e){
                    //
                }

                try{
                    //remove the main grouping
                    g.remove();
                    selection = null;
                }
                catch(e){
                    //selection undefined, no-op
                }

                //set composite map bbox and geojson object -- do before any drawing
                map_bbox();
                composite_geojson();

                //redraw "d", "cx", and "cy" attributes of all map layers
                map.resize();

                return this;
            }

            //register key functions
            layer.key = function(geoid, datid){

                return this;
            }

            layer.attr = function(){

                return this;
            }

            layer.style = function(){

                return this;
            }

            layer.aes = function(){

                return this;
            }

            layer.data = function(){

                return this;
            }


            //to do -- change mark (path vs circle) depending on feature type
            //support layers of mixed feature type: e.g. polygons and points in a FeatureCollection
            layer.draw = function(resizeOnly){
                if(features != null){
                    //check feature type, then render circle or paths accordingly
                    console.log("FEATURES:")
                    console.log(features);
                    console.log("++++++++++")
                    var isPoint = features[0].geometry.type == "Point";

                    if(isPoint){
                        var update = g.selectAll("circle").data(features);
                        update.exit().remove();

                        selection = update.enter().append("circle").merge(update)
                                        .attr("cx", function(d){return par.proj(d.geometry.coordinates)[0]})
                                        .attr("cy", function(d){return par.proj(d.geometry.coordinates)[1]})
                    }
                    else{
                        //if drawing one polygon, embed features in a single FeatureCollection
                        var f = onePolygon ? [{"type":"FeatureCollection", "features":features}] : features;

                        //for now, just poly
                        var path = d3.geoPath(par.proj);

                        var update = g.selectAll("path").data(f);
                            update.exit().remove();

                        //always update "d", "cx", and "cy" (i.e. positional) attributes where appropriate
                        selection = update.enter().append("path").merge(update).attr("d", path);                        
                    }

                    //update aesthetics if not resizeOnly
                    if(resizeOnly==null || !resizeOnly){
                        //selection.attr("stroke","#0033cc")
                        //         .attr("fill","#0099ff")
                        //         .attr("fill-opacity","0.25");
                    }     
                }
                else{
                    //console.log("NO FEATURES");
                }
            }

            return layer;
        }
    } //end map.layer()

    // ================= end map layers ==================================================== //


    // ========================== core map functions and methods =========================== //
    

    map.get_aspect = function(){
        return par.aspect;
    }

    //update projection, size of map, size of map container. accounts for zoom scalar
    //calling with no arguments updates existing projection based on container size and returns updated projection
    //calling with a projection sets the new projection and updates it according to map container size. returns map object.
    //projection can be set or retrieved before any features are added to map. in this case, the projection is not updated.
    map.projection = function(proj){

        //if no proj is passed, update existing map projection, otherwise establish proj as map projection
        if(proj==null){proj = par.proj;}
        else{par.proj = proj}

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

            //final adjustment to proj to fit final dimensions of scaled map with 5px pad
            //proj.fitExtent([[5,5], [mwidth-5, mheight-5]], composite_geo);
            //to do: points at edge of composite geo will get cut off because bounds above will go through
            //center of circles 
            proj.fitExtent([[0,0], [mwidth, mheight]], composite_geo); 
        }
        else{
            console.log("null composite");
        }

        //return updated proj if no args, otherwise map object
        if(arguments.length == 0){
            return proj;
        }
        else{
            return this;
        } 
    }

    map.draw = function(proj){



        //update or assign new projection
        //if proj is undefined, update existing map projection to accommodate any changes to viewport dimensions
        //or the addition/subtraction of map layers
        this.projection(proj);

                //for testing -- add a bounding box layer (first time this is called) and 
                //refresh with current bounding box each time draw is subsequently called
                if(composite_geo != null){
                    map.layer("bbox").features(composite_geo); //composite_geo is a FeatureCollectiom
                }

        layers.forEach(function(d){
            d.draw();
        });

                //for testing
                var group_bbox = dom.g.node().getBBox();
                var group_aspect = group_bbox.height/group_bbox.width;
                console.log("(Draw) Pre-aspect: " + par.aspect + " | " + "Rendered-aspect: " + group_aspect);

        return this;
    }

    //layer resizing merely redraw "d", "cx", and "cy" attributes
    map.resize = function(proj){
        this.projection(proj);
        layers.forEach(function(d){
            d.draw(true);
        });

                //for testing
                var group_bbox = dom.g.node().getBBox();
                var group_aspect = group_bbox.height/group_bbox.width;
                console.log("(Resize) Pre-aspect: " + par.aspect + " | " + "Rendered-aspect: " + group_aspect);

        return this;
    }

    return map;
}