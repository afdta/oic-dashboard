//to do: validate OIC and other var names (code) are used in proper scope
//to do: wrap update() in try catch. if error display warning, prompt to reload

import degradation from "../../../js-modules/degradation.js";
import dimensions from "../../../js-modules/dimensions.js";
import format from "../../../js-modules/formats.js";
import select_menu from "../../../js-modules/select-menu.js";
import dir from "../../../js-modules/rackspace.js";
import history from "../../../js-modules/history.js";

import palette from "./palette.js";
import oic_help from "./oic-help.js";

export default function oic_profile(store){
    //console.log(store)

    var dash_wrap = d3.select("#oic-dashboard");
    //d3.select(dash_wrap.node().parentNode).style("background-color","#162231");

    var is_mobile = false;

    var pal = palette();

    ////////////////
    // MENU PANEL //
    ////////////////
    var opt = {};
    opt.select_menu = d3.select("#oic-select");


    var opt_data = [];
    for(var o in store.id){
        if(store.id.hasOwnProperty(o)){
            opt_data.push(store.id[o])
        }
    }

    var states = [{"STATE":"01","STUSAB":"AL","STATE_NAME":"Alabama","STATENS":"01779775"},{"STATE":"02","STUSAB":"AK","STATE_NAME":"Alaska","STATENS":"01785533"},{"STATE":"04","STUSAB":"AZ","STATE_NAME":"Arizona","STATENS":"01779777"},{"STATE":"05","STUSAB":"AR","STATE_NAME":"Arkansas","STATENS":"00068085"},{"STATE":"06","STUSAB":"CA","STATE_NAME":"California","STATENS":"01779778"},{"STATE":"08","STUSAB":"CO","STATE_NAME":"Colorado","STATENS":"01779779"},{"STATE":"09","STUSAB":"CT","STATE_NAME":"Connecticut","STATENS":"01779780"},{"STATE":"10","STUSAB":"DE","STATE_NAME":"Delaware","STATENS":"01779781"},{"STATE":"11","STUSAB":"DC","STATE_NAME":"District of Columbia","STATENS":"01702382"},{"STATE":"12","STUSAB":"FL","STATE_NAME":"Florida","STATENS":"00294478"},{"STATE":"13","STUSAB":"GA","STATE_NAME":"Georgia","STATENS":"01705317"},{"STATE":"15","STUSAB":"HI","STATE_NAME":"Hawaii","STATENS":"01779782"},{"STATE":"16","STUSAB":"ID","STATE_NAME":"Idaho","STATENS":"01779783"},{"STATE":"17","STUSAB":"IL","STATE_NAME":"Illinois","STATENS":"01779784"},{"STATE":"18","STUSAB":"IN","STATE_NAME":"Indiana","STATENS":"00448508"},{"STATE":"19","STUSAB":"IA","STATE_NAME":"Iowa","STATENS":"01779785"},{"STATE":"20","STUSAB":"KS","STATE_NAME":"Kansas","STATENS":"00481813"},{"STATE":"21","STUSAB":"KY","STATE_NAME":"Kentucky","STATENS":"01779786"},{"STATE":"22","STUSAB":"LA","STATE_NAME":"Louisiana","STATENS":"01629543"},{"STATE":"23","STUSAB":"ME","STATE_NAME":"Maine","STATENS":"01779787"},{"STATE":"24","STUSAB":"MD","STATE_NAME":"Maryland","STATENS":"01714934"},{"STATE":"25","STUSAB":"MA","STATE_NAME":"Massachusetts","STATENS":"00606926"},{"STATE":"26","STUSAB":"MI","STATE_NAME":"Michigan","STATENS":"01779789"},{"STATE":"27","STUSAB":"MN","STATE_NAME":"Minnesota","STATENS":"00662849"},{"STATE":"28","STUSAB":"MS","STATE_NAME":"Mississippi","STATENS":"01779790"},{"STATE":"29","STUSAB":"MO","STATE_NAME":"Missouri","STATENS":"01779791"},{"STATE":"30","STUSAB":"MT","STATE_NAME":"Montana","STATENS":"00767982"},{"STATE":"31","STUSAB":"NE","STATE_NAME":"Nebraska","STATENS":"01779792"},{"STATE":"32","STUSAB":"NV","STATE_NAME":"Nevada","STATENS":"01779793"},{"STATE":"33","STUSAB":"NH","STATE_NAME":"New Hampshire","STATENS":"01779794"},{"STATE":"34","STUSAB":"NJ","STATE_NAME":"New Jersey","STATENS":"01779795"},{"STATE":"35","STUSAB":"NM","STATE_NAME":"New Mexico","STATENS":"00897535"},{"STATE":"36","STUSAB":"NY","STATE_NAME":"New York","STATENS":"01779796"},{"STATE":"37","STUSAB":"NC","STATE_NAME":"North Carolina","STATENS":"01027616"},{"STATE":"38","STUSAB":"ND","STATE_NAME":"North Dakota","STATENS":"01779797"},{"STATE":"39","STUSAB":"OH","STATE_NAME":"Ohio","STATENS":"01085497"},{"STATE":"40","STUSAB":"OK","STATE_NAME":"Oklahoma","STATENS":"01102857"},{"STATE":"41","STUSAB":"OR","STATE_NAME":"Oregon","STATENS":"01155107"},{"STATE":"42","STUSAB":"PA","STATE_NAME":"Pennsylvania","STATENS":"01779798"},{"STATE":"44","STUSAB":"RI","STATE_NAME":"Rhode Island","STATENS":"01219835"},{"STATE":"45","STUSAB":"SC","STATE_NAME":"South Carolina","STATENS":"01779799"},{"STATE":"46","STUSAB":"SD","STATE_NAME":"South Dakota","STATENS":"01785534"},{"STATE":"47","STUSAB":"TN","STATE_NAME":"Tennessee","STATENS":"01325873"},{"STATE":"48","STUSAB":"TX","STATE_NAME":"Texas","STATENS":"01779801"},{"STATE":"49","STUSAB":"UT","STATE_NAME":"Utah","STATENS":"01455989"},{"STATE":"50","STUSAB":"VT","STATE_NAME":"Vermont","STATENS":"01779802"},{"STATE":"51","STUSAB":"VA","STATE_NAME":"Virginia","STATENS":"01779803"},{"STATE":"53","STUSAB":"WA","STATE_NAME":"Washington","STATENS":"01779804"},{"STATE":"54","STUSAB":"WV","STATE_NAME":"West Virginia","STATENS":"01779805"},{"STATE":"55","STUSAB":"WI","STATE_NAME":"Wisconsin","STATENS":"01779806"},{"STATE":"56","STUSAB":"WY","STATE_NAME":"Wyoming","STATENS":"01779807"},{"STATE":"60","STUSAB":"AS","STATE_NAME":"American Samoa","STATENS":"01802701"},{"STATE":"66","STUSAB":"GU","STATE_NAME":"Guam","STATENS":"01802705"},{"STATE":"69","STUSAB":"MP","STATE_NAME":"Northern Mariana Islands","STATENS":"01779809"},{"STATE":"72","STUSAB":"PR","STATE_NAME":"Puerto Rico","STATENS":"01779808"},{"STATE":"74","STUSAB":"UM","STATE_NAME":"U.S. Minor Outlying Islands","STATENS":"01878752"},{"STATE":"78","STUSAB":"VI","STATE_NAME":"U.S. Virgin Islands","STATENS":"01802710"}];
    var st2state = {};
    states.forEach(function(s){
        st2state[s.STUSAB] = s.STATE_NAME;
    });

    var optnest = d3.nest().key(function(d){return st2state[d.state]})
                           .sortKeys(d3.ascending)
                           .rollup(function(a){
                                var m = a.map(function(d){return {value:d.stcofips, text:d.city}})
                                m.sort(function(a,b){return a.text < b.text ? -1 : (a.text == b.text ? 0 : 1)});
                                return m;
                           })
                           .entries(opt_data);


    opt.type = d3.select("#oic-type")
                .classed("c-fix", true)
                .select("div").classed("oic-help c-fix",true)
                .attr("data-help", "typology")
                ;

    //opt.type.append("p").text("OIC type").append("span")
    //.classed("oic-help-icon",true).text("?").style("margin","0px 3px");
   
    opt.typep = opt.type.selectAll("p.oic-type")
                .data(["Vulnerable", "Stabilizing", "Emerging", "Strong"])
                .enter().append("p").style("white-space","nowrap")
                .html(function(d){
                    return d;
                });

    var geo_note = d3.select("#geography-note").append("p");

    //oic_menu(opt.button, store.id, update);


    ///////////////
    //  PANEL 1  //
    ///////////////
    var p1 = {};
    p1.wrap = d3.select("#dash-panel-1").classed("c-fix",true);

    p1.header = p1.wrap.append("div").classed("dashboard-panel-image",true);
    
    p1.image_source = p1.header.append("div").style("position","absolute")
            .style("top","100%").style("left","0px").style("width","100%")
            .style("height","12px").style("overflow","visible").append("p")
            .style("float","right").style("color","#444444").style("margin","1px 5px 0px 5px")
            .style("font-size","11px").style("line-height","1.2em")
            ;    

    p1.content = p1.wrap.append("div").classed("panel1-content c-fix",true);

    var continuum_threshold = d3.scaleThreshold().domain([-0.905, -0.528, 0]).range(["Vulnerable","Stabilizing","Emerging","Strong"]);



    p1.content.append("p").html('What makes <span class="oic-name">___</span> <span class="county-name-parenthetical">(___)</span> an older industrial city?')
        .style("font-weight","bold").style("font-size","1rem")
        .style("margin","1.75rem 1rem 0rem 1rem").style("font-style","italic");
   
    p1.criteria = p1.content.append("div");

    ///////////////
    // LEGEND    //
    ///////////////

    var legend_wrap = d3.select("#dash-legend").classed("c-fix",true)
                        .append("div").append("div");

    ///////////////
    //  PANEL 2  //
    ///////////////
    var p2 = {};
    p2.wrap = d3.select("#dash-panel-2");
    p2.header = p2.wrap.append("div").classed("dashboard-panel-title", true);
    p2.header.append("p").html('Economic performance indicators').classed("oic-help icon-top",true)
        .attr("data-help","performance");

    //p2.legend = p2.header.append("div");
    
    ///////////////
    //  PANEL 3  //
    ///////////////
    var p3 = {};
    p3.wrap = d3.select("#dash-panel-3");
    p3.header = p3.wrap.append("div").classed("dashboard-panel-title", true);
    p3.header.append("p").html('Assets and challenges').classed("oic-help icon-top",true)
        .attr("data-help","assets");

    //p3.legend = p3.header.append("div");


    function get_ind(ind, dict, geo_title){
        var r = {title:"Title", value:null, format:"N/A", sig:1, geo:geo_title};

        if(ind == "job"){
            r.title = "Percent change in jobs";
            r.value = (dict.RET_2016/dict.RET_2000)-1;
            r.format = format.fn(r.value, "pct1");
        }
        else if(ind == "gmp"){
            r.title = "Percent change in real gross metropolitan product (GMP)";
            r.value = (dict.rgdp_2016/dict.rgdp_2000)-1;
            r.format = format.fn(r.value, "pct1");
        }
        else if(ind == "pro"){
            r.title = "Percent change in real GMP per job";
            r.value = ((dict.rgdp_2016/dict.RET_2016)/(dict.rgdp_2000/dict.RET_2000))-1;
            r.format = format.fn(r.value, "pct1");
        }
        else if(ind == "pci"){
            r.sig = dict.incpercap_sigch0016;
            r.title = "Percent change in real per capita income" + (r.sig==1 || r.sig===null ? "" : "*");
            r.value = (dict.incpercap_ch0016/dict.incpercap_00);
            r.format = format.fn(r.value,"pct1") + (r.sig==1 || r.sig===null ? "" : "*");
        }
        else if(ind == "med"){
            r.sig = dict.medinc_sigch_0016;
            r.title = "Percent change in real median household income" + (r.sig==1 || r.sig===null ? "" : "*");
            r.value = dict.medinc_ch_0016/dict.medinc00;
            r.format = format.fn(r.value,"pct1") + (r.sig==1 || r.sig===null  ? "" : "*");
        }
        else if(ind == "ert"){
            r.sig = dict.epop_sigch_0016;
            r.title = "Change in the employment-to-population ratio (25–64 year-olds)" + (r.sig==1 || r.sig===null ? "" : "*");
            r.value = dict.epop_ch_0016;
            r.format = format.fn(r.value, "shch1") + (r.sig==1 || r.sig===null ? "" : "*");
        }
        else if(ind == "nsf"){
            r.title = "NSF/NIH funding per capita, 2016";
            r.value = dict.nsfnihpc;
            r.format = format.fn(r.value, "doll1");
        }
        else if(ind == "aij"){
            r.title = "Percent change in advanced industries jobs, <span>2010–16</span>";
            r.value = (dict.ai_jobs_2016 / dict.ai_jobs_2010) - 1;
            r.format = format.fn(r.value, "pct1");
        }
        else if(ind == "clu"){
            r.title = "Share of jobs in dense clusters, 2015";
            r.value = dict.hub_share_15;
            r.format = format.fn(r.value, "sh1");
        }
        else if(ind == "pmt"){
            r.title = "Percent change in housing units permitted, <span>2010–16</span>";
            r.value = (dict.units_16 / dict.units_10) - 1;
            r.format = format.fn(r.value, "pct1");
        }
        else if(ind == "for"){
            r.sig = dict.fb_share_sigch_1016;
            r.title = "Change in share foreign born, <span>2010–16</span>" + (r.sig==1 || r.sig===null ? "" : "*");
            r.value = dict.fb_share_ch_1016;
            r.format = format.fn(r.value, "shch1") + (r.sig==1 || r.sig===null ? "" : "*");
        }
        else if(ind == "edu"){
            r.sig = dict.ba_gap_sig;
            r.title = "Difference b/w white and non-white bachelor’s attainment rate, 2016" + (r.sig==1 || r.sig===null ? "" : "*");
            r.value = dict.ba_gap;
            r.format = format.fn(r.value, "shch1") + (r.sig==1 || r.sig===null ? "" : "*");
        }

        return r;
    }

    function legend(oic, d3container){
        var cols = pal.categories;
        var dat = [
            {label: store.id[oic].city, col:cols.oic },
            {label: "Older industrial counties", col:cols.alloic },
            {label: "Urban industrial counties", col:cols.urbani },
            {label: "Urban counties", col:cols.urban }
        ]
        
        var u = d3container.classed("c-fix",true).selectAll("div.legend-entry").data(dat);
        u.exit().remove();

        var e = u.enter().append("div").classed("legend-entry", true);
        e.append("div").style("width","1.25rem").style("height","16px").style("display","inline-block")
            .style("vertical-align","middle").style("margin-right","5px");
        e.append("p").style("margin","0px").style("line-height","1em").style("font-size","16px")
            .style("font-weight","bold")
            .style("vertical-align","middle").style("display","inline-block");

        var a = e.merge(u);

        a.select("div").style("background-color", function(d){return d.col});   
        a.select("p").text(function(d){return d.label});  

        //don't show legend if mobile
        //d3container.style("display", is_mobile ? "none" : "block");           
    }

    function bar_chart(el, type, oic, ind, sigvar){
        var wrap = d3.select(el);
        var dim = dimensions(el);
        var pad = [(is_mobile ? 10 : 20), (type != "bar" ? 21 : 15), 20, (type != "bar" ? 21 : 15)];

        var bar_height = 11;
        var bar_pad = is_mobile ? 19 : 4;

        //chart (svg) dimensions
        var width = (dim.width < 120 ? 120 : dim.width) - 20; //account for tile padding, not available for plotting
        var height = pad[0] + pad[2] + (bar_height*4) + (is_mobile ? bar_pad*4 : bar_pad*3);

        var dat = {};
        //oic, oic avg, all urban industrial, all urban -- need to get latter 3 data points
        var oic_individual = store.data[oic];
        var oic_avg = store.data["00003"];
        var urban_industrial = store.data["00002"];
        var urban_all = store.data["00001"];

        var val = get_ind(ind, oic_individual, store.id[oic].city);
        var val1 = get_ind(ind, oic_avg, "Older industrial counties");
        var val2 = get_ind(ind, urban_industrial, "Urban industrial counties");
        var val3 = get_ind(ind, urban_all, "Urban counties");
        
        dat.points = [val, val1, val2, val3];

        var extent = d3.extent(dat.points, function(d){return d.value});
        if(extent[0] > 0){extent[0] = 0} //if min greater than 0
        if(extent[1] < 0){extent[1] = 0} //if max less than 0

        //if needed add x pads here
        if(extent[0] < 0){pad[3] = pad[3]+40} 
        if(extent[1] > 0){pad[1] = pad[1]+40}       

        var xscale = d3.scaleLinear().domain(extent).range([pad[3], width-pad[1]]);

        //to do replace var with a variable label or title
        var title = wrap.selectAll("div.tile-header").data([val.title]);
        var title_e = title.enter().append("div").classed("tile-header",true);
            title_e.append("p");
        var title = title_e.merge(title).select("p").html(function(d){return d}).lower();

        var svgu = wrap.selectAll("svg").data([0]);
        var svge = svgu.enter().append("svg");
            svge.append("g").classed("grid-lines", true);
            svge.append("g").classed("bar-groups", true);

        var svg = svge.merge(svgu).attr("height",height+"px").attr("width","100%").style("overflow","visible");
        
        var barsu = svg.select("g.bar-groups").selectAll("g").data(dat.points);

        var barse = barsu.enter().append("g");
            barse.append("title");
            barse.append("rect");
            barse.append("circle");
            barse.append("text").classed("text-value",true).style("font-size","12px").style("fill","#555555");
            barse.append("text").classed("text-label",true).style("font-size","12px").style("fill","#555555")

        var bars = barse.merge(barsu);

        bars.attr("transform", function(d,i){
            return "translate(0," + ((is_mobile ? bar_pad : 0) + (i*(bar_height+bar_pad)) + pad[0]) + ")"
        })

        function filler(d,i){
            var cols = pal.categories;
            return i==0 ? cols.oic :
                          i==1 ? cols.alloic :
                                i==2 ? cols.urbani :
                                    cols.urban;
        }

        bars.select("circle").attr("cy", "8px").attr("r","6")
            .style("visibility", type!="bar" ? "visible" : "hidden")
            .attr("fill", filler)
            .transition()
            .duration(700)
            .attr("cx", function(d){return xscale(d.value)})
            ;

        bars.select("rect")
            .attr("height", type!="bar" ? "2px" : bar_height+"px")
            .attr("y", type != "bar" ? "7px" : "0px")
            .attr("fill", filler)
            .transition()
            .duration(700)
            .attr("x", function(d){
                return d.value >= 0 ? xscale(0) : xscale(d.value);
            })
            .attr("width", function(d){
                return d.value >= 0 ? xscale(d.value) - xscale(0) : xscale(0) - xscale(d.value);
            })
            ;

        bars.select("text.text-value")
           .attr("y", type != "bar" ? "12" : "9")
           .text(function(d){return d.format})
           .attr("text-anchor", function(d){return d.value >= 0 ? "start" : "end"})
           .transition()
           .duration(700)
           .attr("x", function(d){return type != "bar" ? 
                                    (d.value >= 0 ? xscale(d.value) + 8 : xscale(d.value) - 8) : 
                                    (d.value >= 0 ? xscale(d.value) + 2 : xscale(d.value) - 2) })
           ;

        //bar labels
        bars.select("text.text-label")
            .text(function(d){return d.geo})
            .attr("x", xscale(0))
            .attr("dx", function(d){return d.value < 0 ? "-2" : "2"})
            .attr("text-anchor", function(d){return d.value < 0 ? "end" : "start"})
            .attr("y", "-4")
            .style("visibility", is_mobile ? "visible" : "hidden")
            .each(function(d,i){
                try{
                    var bbox = this.getBBox();
                    if(bbox.x < 0){
                        d3.select(this).attr("x","5").attr("text-anchor","start");
                    }
                    else if((bbox.x + bbox.width) > width){
                        d3.select(this).attr("x",width-5).attr("text-anchor","end");
                    }
                }
                catch(e){

                }
            })
            ;

        bars.select("title").text(function(d, i){return d.geo});        

        //gridlines
        var grid_group = svg.select("g.grid-lines");
        
        var gridu = grid_group.selectAll("g").data(xscale.ticks(5));
            gridu.exit().remove();
        var gride = gridu.enter().append("g");
            gride.append("line");
            gride.append("text");
        var grids = gride.merge(gridu);

        grids.select("line").attr("x1", function(d){return xscale(d)})
                        .attr("x2", function(d){return xscale(d)})
                        .attr("y1", 10)
                        .attr("y2", height - 10)
                        .attr("stroke",function(d){
                            return d==0 ? "#cccccc" : "#dddddd";
                        })
                        .attr("stroke-dasharray",function(d){
                            return d==0 ? null : "2,2"; 
                        })
                        .style("shape-rendering","crispEdges")
                        ;
    }

    var current_oic = null;

    function update(code){
        //console.log("UPDATE " + code);
        if(arguments.length==0 && current_oic===null){
            return null;
        }
        else if(arguments.length==0){
            code = current_oic;
        }
        else{
            current_oic = code;
        }

        //set "mobile" (non-widescreen) status
        try{
            is_mobile = !window.matchMedia("(min-width: 1180px)").matches;
        }
        catch(e){
            is_mobile = false;
        }          

        //draw legends
        //legend(code, p2.legend);
        //legend(code, p3.legend);
        legend(code, legend_wrap);

        var oic_name = store.id[code].city;
        var county_name = store.id[code].county + ", " + store.id[code].state;
        var state_abbr = store.id[code].state;

        dash_wrap.selectAll(".oic-name").text(oic_name);
        dash_wrap.selectAll(".county-name").text(county_name);
        dash_wrap.selectAll(".county-name-parenthetical").text("(" + store.id[code].county + ")");
        dash_wrap.selectAll(".state-abbr").text(state_abbr);

        //update geograhy note
        if(oic_name==="Brooklyn" || oic_name==="Queens"){
            geo_note.text("Data presented here represent " + county_name + " which is geographically coterminous with the borough of " + oic_name + ".");
        }
        else if(oic_name in {"St. Louis":1, "Baltimore": 1}){
            geo_note.text("Data presented here represent " + oic_name + ", " + state_abbr + ". As an independent city, it is treated as a county equivalent.");
        }
        else{
            geo_note.text("Data presented here represent " + county_name + ". " + oic_name + " is the largest city in the county.");
        }

        ;

        p1.header.style("background-image", 'url("' + dir.url("img", store.id[code].filename) + '")');
        p1.image_source.text(store.id[code].source);

        var oictype = continuum_threshold(store.data[code].score_0016);

        opt.typep
        .style("background-color", function(d){
            return d==oictype ? pal.categories.oic : "transparent";
        })
        .style("color", function(d){
            return d==oictype ? "#333333" : "#ffffff";
        })
        ;

        //panel 2
        var p2sections = p2.wrap.selectAll("div.dashboard-panel-section")
            .data([{ind:["job","gmp"], title:"Growth, 2000–2016"}, 
                   {ind:["pro", "pci"], title:"Prosperity, 2000–2016"}, 
                   {ind:["med","ert"], title:"Inclusion, 2000–2016"}]);
        p2sections.exit().remove();
        
        var p2sectionse = p2sections.enter().append("div").classed("dashboard-panel-section c-fix",true);
        p2sectionse.append("p").classed("section-title", true).html(function(d){return d.title});

        p2.sections = p2sectionse.merge(p2sections);

        var p2tiles = p2.sections.selectAll("div.dashboard-tile").data(function(d){return d.ind});
        p2tiles.exit().remove();
        var p2tiles_enter = p2tiles.enter().append("div").classed("dashboard-tile",true);
        p2.tiles = p2tiles_enter.merge(p2tiles);

        //panel 3
        var p3sections = p3.wrap.selectAll("div.dashboard-panel-section")
            .data([{ind:["nsf","aij"], title:"Technological change"}, 
                   {ind:["clu", "pmt"], title:"Urbanization"}, 
                   {ind:["for","edu"], title:"Demographic transformation"}]);
        p3sections.exit().remove();

        var p3sectionse = p3sections.enter().append("div").classed("dashboard-panel-section c-fix",true);
        p3sectionse.append("p").classed("section-title", true).html(function(d){return d.title});

        p3.sections = p3sectionse.merge(p3sections);

        var p3tiles = p3.sections.selectAll("div.dashboard-tile").data(function(d){return d.ind});
        p3tiles.exit().remove();
        var p3tiles_enter = p3tiles.enter().append("div").classed("dashboard-tile",true);
        p3.tiles = p3tiles_enter.merge(p3tiles);

        //draw charts
        p2.tiles.each(function(d){
            bar_chart(this, "bar", code, d)
        });

        p3.tiles.each(function(d){
            bar_chart(this, "bar", code, d)
        });

        //set tile header heights allow for repaint
        setTimeout(function(){
            var tile_headers = dash_wrap.selectAll("div.tile-header");
            var hh = 25;
            tile_headers.each(function(){
                var thiz = d3.select(this);
                var box = thiz.select("p").node().getBoundingClientRect();
                var h = box.bottom - box.top;
                if(h > hh){
                    hh = h;
                }
            });
            var hhh = (hh+5)+"px";
            tile_headers.style("height", hhh).style("line-height", hhh);

            //set panel header heights
            var panel_headers = dash_wrap.selectAll("div.dashboard-panel-title");
            hh = 25; //reuse
            panel_headers.each(function(){
                var thiz = d3.select(this);
                var box = thiz.select("p").node().getBoundingClientRect();
                var h = box.bottom - box.top;
                if(h > hh){
                    hh = h;
                }
            });
            hhh = (hh+20)+"px";
            panel_headers.style("height", hhh);
        },0)


        //what makes xxx an OIC
        var oic_data = store.data[code];

        var criteria_boxes = p1.criteria.selectAll("div.criterion").data([
            {
                title: "<span>1</span>Presence of a major urban center",
                subtitle: "City population, 2016",
                value: "<span>" + format.num0(oic_data.largest_city_pop) + "</span>",
                caption: ""
            },
            {
                title: "<span>2</span>Industrial heritage",
                subtitle: "Share of county jobs in manufacturing, 1970",
                value: "<span>" + format.sh1(oic_data.mf_jobs_1970/oic_data.RET_1970) + "</span>",
                caption: "By 2016 this had fallen to " + format.sh1(oic_data.mf_jobs_2016/oic_data.RET_2016)
            },
            {
                title: "<span>3</span>Competitive challenge",
                subtitle: "Jobs deficit in 2016 based on 1970 industrial structure",
                value: "<span>" + format.sh1(oic_data.percent_job_deficit*-1) + "</span>",
                caption: ""
            }
        ]);

        criteria_boxes.exit().remove();

        var criteria_text = criteria_boxes.enter().append("div").classed("criterion", true).merge(criteria_boxes)
            .selectAll("p").data(function(d){return [d.title, d.subtitle, d.value, d.caption]});

        criteria_text.exit().remove();
        criteria_text.enter().append("p").merge(criteria_text).html(function(d){return d})
            .classed("criteria-title", function(d,i){return i==0})
            .classed("criteria-value", function(d,i){return i==2})
            ;

        var significance = p3.wrap.selectAll("p.significance-note")
                                  .data(["*Not statistically significant at the 90% confidence level"])
        significance.exit().remove();
        significance.enter().append("p").classed("significance-note",true).merge(significance)     
            .style("font-size","16px").style("color","#555555").style("float","right")
            .style("font-style","italic").style("margin","0px 10px").style("padding","5px 0px")
            .style("border-top","0px solid #d0d0d0")
            .text(function(d){return d});


    }

    var hist = history(); //wrapper of browser history api
 
    //initialization and user selection of an OIC -- push these onto browser history
    var select = select_menu(opt.select_menu.node()).promptOption("Select an OIC").optgroups(optnest);

    select.on("change", function(){
        var code = this.value;
        if(store.id.hasOwnProperty(code)){
            update(code);
            hist.push({code:code}, "#"+code);
        }
        else{
            //update with existing oic -- should never occur
            update();
        }
    });   

    //what to initialize with? a valid hash or Birmingham
    var onloadhash = hist.get_hash(); //initial location hash
    var validhash;

    var scrollIntoView = function(smooth){
        var behavior = arguments.length > 0 && !!smooth ? "smooth" : "instant";
        setTimeout(function(){
            dash_wrap.node().scrollIntoView({ behavior: behavior , block: 'start', inline: 'nearest'});
        }, 0);
    }

    if(store.id.hasOwnProperty(onloadhash)){
        validhash = onloadhash;
        
        //scroll to dashboard, this scroll pos should get recorded prior to replaceState() below
        //so user back navigation will keep dashboard at top
        try{
            //to do: figure out how to reliably scroll to dashboard in this case
            //window.location.hash = "oic-dashboard";
            
            if(document.readyState == "complete"){
                scrollIntoView();
            }
            else{
                document.addEventListener("readystatechange", function(event){
                    scrollIntoView(true);
                });                
            }
        }
        catch(e){
            //no-op, user will have to scroll
        }

    }
    else{
        validhash = "01073";
    }

    update(validhash);
    //select.node().value = validhash; //update select menu -- UPDATE -- Initial view should be of prompt
    hist.push({code:validhash}, "#"+validhash, true); //push this onto history, overwriting current page in history         


    //when changing between states of history see if valid oic is requested, if so, update profile
    //do not push this onto history. also updare selecr menu
    hist.pop(function(event_state){
        //console.log(this);
        console.log(event_state);
        try{
            if(event_state == null){throw new Error("null popstate");}
            var code = event_state.code;
            if(store.id.hasOwnProperty(code)){
                update(code);
                select.node().value = code;
            }
        }
        catch(e){
            console.log(e);
            update(); //update with existing OIC
        }
    });

    oic_help(dash_wrap.node());

    //on resize, update with current OIC
    window.addEventListener("resize", function(){update();})
}
