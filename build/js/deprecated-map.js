//deprecated functions from map.js

    //using a dummy geoJSON object derived from spherical bounding boxes
    //doesn't give as accurate a result as composite FeatureCollections
    //when the goal is deriving aspect ratio and setting projection scales 
    //and translates

    //create a geojson feature from a spherical bounding box, bb
    //bb -- geo (lon/lat) bounding box: [[left, bottom], [right, top]]
    function dummy_geojson(bb){

        var left = bb[0][0]; 
        var right = bb[1][0]; 

        var top = bb[1][1]; 
        var bottom = bb[0][1];

        //console.log(left + " | " + top + " | " + right + " | " + bottom);

        //follow constant latitude/longitude, rather than great circle arcs 
        //(great circle arcs are the default if you were to just include the four corners)
        var x = d3.interpolateNumber(left, right);
        var y = d3.interpolateNumber(top, bottom);

        //interpolators
        var fsteps = d3.range(0.05, 1.05, 0.05);
        var bsteps = d3.range(0.95, -0.05, -0.05);

        var t = fsteps.map(function(d){return [x(d), top]});
        var r = fsteps.map(function(d){return [right, y(d)]});
        var b = bsteps.map(function(d){return [x(d), bottom]});
        var l = bsteps.map(function(d){return [left, y(d)]});

        var geometry = {
           "type": "Polygon",
           "coordinates": [
               [ [left, top]].concat(t, r, b, l, [[left, top]])
           ]
        }

        var feature = {
            "type": "Feature",
            "geometry": geometry
        }

        return feature;
    }

    //a dummy geojson object meant to approximate a bounding box
    //generated in map.projection()
    var bboxgeo;

    //unused aspect ratio function
    function calculate_map_aspect(proj){

        //step 1 -- union of bounding boxes
        var path = d3.geoPath(proj);
        
        var left = [];
        var right = [];
        var top = [];
        var bottom = [];

        //loop through layers and push bounding box values onto arrays above
        layers.forEach(function(l){
            var features = l.features();
            if(features != null){
                var fc = {"type":"FeatureCollection", "features":features}
                var bounds = path.bounds(fc);
                //[[x0, y0], [x1, y1]] --> [left, top], [right, bottom]
                left.push(bounds[0][0]);
                right.push(bounds[1][0]);
                top.push(bounds[0][1]);
                bottom.push(bounds[1][1]);
            }
        });

        //derive aspect ratios and retrieve a geo bbox
        if(left.length && right.length && top.length && bottom.length){
            var union = [[d3.min(left), d3.min(top)], [d3.max(right), d3.max(bottom)]];
            var aspect = Math.abs((union[1][1] - union[0][1]) / (union[1][0] - union[0][0]));
        }
        else{
            //default
            var aspect = 0.75;
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