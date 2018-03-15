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



    //add in the map.layer method that adds new layers
    //returns a layer object with various methods described below
    //if a layer with name already exists in map, return the layer object
    map.layer = function(name){
        if(arguments.length > 0 && find_layer(name) !== null){
            return find_layer(name);
        }
        else{
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
            //get selection
            layer.selection = function(){
                return selection;
            }

            layer.features = function(f, asOnePolygon){
                if(arguments.length==0){
                    return features;
                }
                else if(f.hasOwnProperty("type") && f.type=="FeatureCollection"){
                    features = f.features;
                }
                else if(f instanceof Array){
                    features = f;
                }
                else{
                    throw new Error("Argument must be a FeatureCollection or an array of D3-supported geojson feature objects");
                }
            
                this.bbox = layer_bbox(features);
                map_bbox();

                if(arguments.length > 1 && !!asOnePolygon){
                    onePolygon = true;
                }

                return this;
            }

            //create geojson features from an array of lon-lat data data objects: [{lon:x, lat:y, other:z, ...}, ...]
            layer.points = function(p, lon_name, lat_name){
                if(arguments.length==0){
                    return points;
                }
                else if(p instanceof Array){
                    var lon = arguments.length > 1 ? lon_name : "lon";
                    var lat = arguments.length > 2 ? lat_name : "lat";

                    features = p.map(function(d,i){
                        return {
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [d[lon], d[lat]]
                                },
                                "properties": d
                        }   
                    });
                }
                else{
                    throw new Error("Argument must be an array");
                }

                this.bbox = layer_bbox(features);
                map_bbox();
                return this;
            }

            //register key functions
            layer.key = function(geoid, datid){

                return this;
            }

            layer.aes = function(){

                return this;
            }

            layer.data = function(){

                return this;
            }

            layer.remove = function(){
                try{
                    var index = layers.indexOf(this);
                    if(index > -1){
                        layers.splice(index, 1);
                    }
                }
                catch(e){
                    //
                }

                try{
                    g.remove();
                }
                catch(e){
                    //selection undefined, no-op
                }

                map_bbox();
                return this;
            }

            //to do -- change mark (path vs circle) depending on feature type
            layer.draw = function(){
                if(features != null){
                    //check feature type, then render circle or paths accordingly

                    //if drawing one polygon, embed features in a single FeatureCollection
                    var f = onePolygon ? [{"type":"FeatureCollection", "features":features}] : features;

                    //for now, just poly
                    var path = d3.geoPath(par.proj);

                    var update = g.selectAll("path").data(f);
                        update.exit().remove();

                    selection = update.enter().append("path").merge(update).attr("d", path)
                        .attr("stroke","blue").attr("fill","none");
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
    
    //create a geojson feature out of map bbox
    function dummy_geojson(){

        //map.bbox = [[left, bottom], [right, top]]
        var left = map.bbox[0][0]; 
        var right = map.bbox[1][0]; 

        var top = map.bbox[1][1]; 
        var bottom = map.bbox[0][1];

        var p0 = [left, top];
        var p1 = [right, top];
        var p2 = [right, bottom];
        var p3 = [left, bottom];

        var geometry = {
           "type": "Polygon",
           "coordinates": [
               [ p0, p1, p2, p3, p0 ]
           ]
        }

        var feature = {
            "type": "Feature",
            "geometry": geometry
        }

        return feature;

    }

    map.get_aspect = function(){
        return par.aspect;
    }

    //update projection
    //calling with no arguments updates existing projection based on container size and returns updated projection
    //calling with a projection sets the new projection and updates it according to map container size. returns map object.
    map.projection = function(proj){
        
        if(arguments.length==0){proj = par.proj;}
        else{par.proj = proj}

        //width of container
        var bbox = dom.outer_wrap.node().getBoundingClientRect();
        var cwidth = bbox.right - bbox.left;

        var bboxgeo = dummy_geojson(); //bounding box as geojson polygon

        //establish aspect ratio
        //to do: fitExtent mutates projection? if so, just operate on proj
        var proj2 = proj.fitExtent([[5,5], [cwidth-5, cwidth-5]], bboxgeo); //adjust proj to fit bboxgeo in a square box defined by width of container (with 5px pad)
        var bounds = d3.geoPath(proj2).bounds(bboxgeo); //planar bounds of bbox

        var bboxHeight = bounds[1][1]-bounds[0][1];
        var bboxWidth = bounds[1][0]-bounds[0][0];

        //track the aspect ratio of the map
        par.aspect = Math.abs(bboxHeight/bboxWidth); //max lat becomes min due to svg coords

        console.log("BBOX coords: " + JSON.stringify(this.bbox));
        console.log("BBOX planar:" + JSON.stringify(bounds));
        console.log(bboxgeo);
        console.log("Aspect ratio: " + par.aspect);

        //width of map
        var mwidth = cwidth*par.scalar;
        var mheight = mwidth*par.aspect;

        //set width of container (will clip map when scalar > 1)
        dom.wrap.style("width",cwidth+"px").style("height",(cwidth*par.aspect)+"px");

        //final adjustment to proj to fit final dimensions
        par.proj = proj2.fitExtent([[5,5], [mwidth-5, mheight-5]], bboxgeo);

        //return
        if(arguments.length == 0){
            return par.proj;
        }
        else{
            return this;
        }

    }

    //for testing -- add a bounding box layer
    //map.layer("bbox").features([dummy_geojson()]);

    map.draw = function(){
        //updated projection
        this.projection();

        //update features in bbox layer -- delete this for production -- to do
        //map.layer("bbox").features([dummy_geojson()]);

        layers.forEach(function(d){
            d.draw();
        });

        return this;
    }


    




    return map;
}