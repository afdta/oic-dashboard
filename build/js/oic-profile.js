import degradation from "../../../js-modules/degradation.js";
import dimensions from "../../../js-modules/dimensions.js";
import format from "../../../js-modules/formats.js";
import select_menu from "../../../js-modules/select-menu.js";
import dir from "../../../js-modules/rackspace.js";

import palette from "./palette.js";
import oic_menu from "./oic-menu.js";

export default function oic_profile(store){
    //console.log(store)

    var dash_wrap = d3.select("#oic-dashboard");
    //d3.select(dash_wrap.node().parentNode).style("background-color","#162231");

    var pal = palette();

    ///////////////
    // OPT PANEL //
    ///////////////
    var opt = {};
    opt.wrap = d3.select("#dashboard-menu");
    opt.select_menu = d3.select("#oic-select")
                        .style("float","right")
                        .style("margin","0rem 0rem")
                        .style("display","inline-block")
                        .style("vertical-align","bottom")
                        .style("line-height","2.5rem"); 


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

    var select = select_menu(opt.select_menu.node()).optgroups(optnest).style("background","#ffffff")
        .style("border","1px solid #ffffff");

    select.on("change", function(){
        update(this.value);
    });

    d3.select("#geography-note").classed("oic-help",true).attr("data-help","geography")
        .append("span").classed("oic-help-icon",true).text("?");

    //oic_menu(opt.button, store.id, update);


    ///////////////
    //  PANEL 1  //
    ///////////////
    var p1 = {};
    p1.wrap = d3.select("#dash-panel-1")
                .style("padding-left","0px")

    p1.content1 = p1.wrap.append("div").style("padding","0px")
                .style("border-radius","0px 15px 0px 0px")
                .style("overflow","hidden")
                .style("position","relative");

    p1.header = p1.content1.append("div").append("div")
        .classed("dashboard-panel-image dashboard-panel-title", true)
        .style("position","relative").style("overflow","hidden");
        ;

    opt.type = p1.content1.append("div")
                .style("padding","5px 1rem")
                .style("border-radius","0px")
                ;
    opt.typep = opt.type.append("p").style("margin","0px").style("font-size","15px")
            .style("line-height","1em").style("font-weight","bold")
            .style("text-align","right")

    opt.typep.append("span").classed("oic-type oic-help",true).attr("data-help","typology");
    opt.typep.append("span").classed("oic-help-icon",true).text("?");

    p1.content = p1.content1.append("div").style("padding-left","1rem")
                            .style("background-color","#eeeeee")
                            .style("border","1px solid #d0d0d0")
                            .style("padding-top","1px")
                            .style("border-width","0px 1px 1px 0px")
                            .style("border-radius","0px 0px 15px 0px")
    
    //p1.header.append("p").html('Title for <span class="oic-name">___</span> here?');
    
    //breaks: [min, kalamazoo), [kalamazoo, springfield ma), [springfield, quincy), [quincy, max] 
    //scores
    //var scores = [];
    //for(var stco in store.data){
    //    if(store.data.hasOwnProperty(stco)){
    //        scores.push({stcofips:store.data[stco].stcofips, 
    //                     score:store.data[stco].score_0016});
    //    }
    //}

    var continuum_color = {"Vulnerable":"#CD3D4B", "Stabilizing":"#FFCF00", "Emerging":"#324661", "Strong":"#578F82"}
    var continuum_threshold = d3.scaleThreshold().domain([-0.905, -0.528, 0]).range(["Vulnerable","Stabilizing","Emerging","Strong"]);
    //var continuum_linear = d3.scaleLinear().domain([-1.5603, 2.1612]).range([0,100]);
    
    /*var continuum = d3.select("#dashboard-typology");
        continuum.select("p").style("float","left").style("min-width","250px")
            .style("margin-left","1rem").style("font-size","15px");

    var hashes = continuum.append("svg").attr("width","70%").attr("height","25px").style("float","left")
                .selectAll("line").data(scores).enter().append("line").attr("y1",30).attr("y2",10).attr("stroke-width","1")
                .attr("stroke", function(d){return d.score==-null ? "#cccccc" : col_continuum[continuum_threshold(d.score)]})
                .attr("x1", function(d){return d.score==-null ? "0%" : continuum_linear(d.score)+"%"})
                .attr("x2", function(d){return d.score==-null ? "0%" : continuum_linear(d.score)+"%"})
                ;
    */

        


    //continuum.append("p").html('<span class="oic-name">___</span> is a(n) strong | xyz OIC')

    p1.content.append("p").html('What makes <span class="oic-name">___</span> an OIC?')
        .style("font-weight","bold").style("font-size","1rem")
        .style("margin-top","1.25rem").style("font-style","italic");
   
    var criteria = p1.content.append("div");


    //p1.header.append("div").append("div").append("p").html('What makes <span class="oic-name">___</span> an OIC?');
    
    ///////////////
    //  PANEL 2  //
    ///////////////
    var p2 = {};
    p2.wrap = d3.select("#dash-panel-2");
    p2.header = p2.wrap.append("div").classed("dashboard-panel-title", true);
    p2.header.append("p").html('Economic performance indicators').classed("oic-help",true).attr("data-help","performance")
                .append("span").classed("oic-help-icon",true).style("font-size","1rem").text("?");

    p2.legend = p2.header.append("div");
    
    ///////////////
    //  PANEL 3  //
    ///////////////
    var p3 = {};
    p3.wrap = d3.select("#dash-panel-3");
    p3.header = p3.wrap.append("div").classed("dashboard-panel-title", true);
    p3.header.append("p").html('Assets and challenges').classed("oic-help",true).attr("data-help","assets")
                .append("span").classed("oic-help-icon",true).style("font-size","1rem").text("?");

    p3.legend = p3.header.append("div");


    function get_ind(ind, dict){
        var r = {title:"Title", value:null, format:"N/A", sig:1};

        if(ind == "job"){
            r.title = "Percent change in jobs";
            r.value = (dict.RET_2016/dict.RET_2000)-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "gmp"){
            r.title = "Percent change in real gross metropolitan product (GMP)";
            r.value = (dict.rgdp_2016/dict.rgdp_2000)-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "pro"){
            r.title = "Percent change in real GMP per job";
            r.value = ((dict.rgdp_2016/dict.RET_2016)/(dict.rgdp_2000/dict.RET_2000))-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "pci"){
            r.title = "Percent change in real per capita income";
            r.value = (dict.incpercap_ch0016/dict.incpercap_00);
            r.format = format.pct1(r.value);
        }
        else if(ind == "med"){
            r.title = "Percent change in real median household income";
            r.value = dict.medinc_ch_0016/dict.medinc00;
            r.sig = dict.medinc_sigch_0016;
            r.format = format.pct1(r.value);
        }
        else if(ind == "ert"){
            r.title = "Change in the employment-to-population ratio (25–64 year-olds)";
            r.value = dict.epop_ch_0016;
            r.sig = dict.epop_sigch_0016;
            r.format = format.shch1(r.value);
        }
        else if(ind == "nsf"){
            r.title = "NSF/NIH funding per capita ($ths) [DUMMY DATA]";
            r.value = Math.random()*1000;
            r.format = format.num1(r.value);
        }
        else if(ind == "aij"){
            r.title = "Percent change in advanced industries jobs, <span>2010–16</span>";
            r.value = (dict.ai_jobs_2016 / dict.ai_jobs_2010) - 1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "clu"){
            r.title = "Share of jobs in dense clusters, 2015";
            r.value = dict.hub_share_15;
            r.format = format.sh1(r.value);
        }
        else if(ind == "pmt"){
            r.title = "Percent change in housing units permitted, <span>2010–16</span>";
            r.value = (dict.units_16 / dict.units_10) - 1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "for"){
            r.title = "Change in share foreign born, <span>2010–16</span>";
            r.value = dict.fb_share_ch_1016;
            r.sig = dict.fb_share_sigch_1016;
            r.format = format.shch1(r.value);
        }
        else if(ind == "edu"){
            r.title = "Difference b/w white and non-white bachelor’s attainment rate, 2016";
            r.value = dict.nhw_baplus_rate - dict.nonwhite_baplus_rate;
            r.sig = 0;
            r.format = format.shch1(r.value);
        }

        return r;
    }

    function legend(oic, d3container){
        var cols = pal.categories;
        var dat = [
            {label: store.id[oic].city, col:cols.oic },
            {label: "All OICs", col:cols.alloic },
            {label: "Urban industrial counties", col:cols.urbani },
            {label: "Urban counties", col:cols.urban }
        ]
        
        var u = d3container.classed("c-fix",true).style("margin","0rem 0rem 1rem 0rem")
                        .selectAll("div.legend-entry").data(dat);
        u.exit().remove();

        var e = u.enter().append("div").classed("legend-entry", true)
                .style("float","left").style("margin","8px 12px 0px 0px").style("line-height","1em")
                ;
        e.append("div").style("width","10px").style("height","10px").style("display","inline-block")
            .style("vertical-align","middle").style("margin-right","4px");
        e.append("p").style("margin","0px").style("line-height","1em").style("font-size","15px")
            .style("vertical-align","middle").style("display","inline-block");

        var a = e.merge(u);

        a.select("div").style("background-color", function(d){return d.col});   
        a.select("p").text(function(d){return d.label});             
    }

    function bar_chart(el, type, oic, ind, sigvar){
        var wrap = d3.select(el);
        var dim = dimensions(el);
        var pad = [20, 
                   type != "bar" ? 21 : 15, 
                   20, 
                   type != "bar" ? 21 : 15];

        var bar_height = 12;
        var bar_pad = 5;

        //chart (svg) dimensions
        var width = (dim.width < 120 ? 120 : dim.width) - 20; //account for tile padding, not available for plotting
        var height = pad[0] + pad[2] + (bar_height*4) + (bar_pad*3);

        var dat = {};
        //oic, oic avg, all urban industrial, all urban -- need to get latter 3 data points
        var oic_individual = store.data[oic];
        var oic_avg = store.data["00003"];
        var urban_industrial = store.data["00002"];
        var urban_all = store.data["00001"];

        var val = get_ind(ind, oic_individual);
        var val1 = get_ind(ind, oic_avg);
        var val2 = get_ind(ind, urban_industrial);
        var val3 = get_ind(ind, urban_all);
        
        dat.points = [val, 
                      val1,
                      val2,
                      val3];

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

        var svg = wrap.selectAll("svg").data([0]);
        
        var barsu = svg.enter().append("svg").merge(svg).attr("height",height+"px").attr("width","100%").style("overflow","visible")
                        .selectAll("g").data(dat.points);

        var barse = barsu.enter().append("g");
            barse.append("rect");
            barse.append("circle");
            barse.append("text").style("font-size","12px").style("fill","#555555");

        var bars = barse.merge(barsu);

        bars.attr("transform", function(d,i){return "translate(0," + (i*(bar_height+bar_pad) + pad[0]) + ")"})

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
            .style("height", type!="bar" ? "2px" : bar_height+"px")
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

        bars.select("text")
           .style("opacity","0")
           .attr("y", type != "bar" ? "12" : "9")
           .text(function(d){return d.format})
           .attr("text-anchor", function(d){return d.value >= 0 ? "start" : "end"})
           .transition()
           .duration(700)
           .attr("x", function(d){return type != "bar" ? 
                                    (d.value >= 0 ? xscale(d.value) + 8 : xscale(d.value) - 8) : 
                                    (d.value >= 0 ? xscale(d.value) + 6 : xscale(d.value) - 6) })
           .on("end", function(){
            d3.select(this).style("opacity","1");
           })
           ;

    }

    
    var current_oic = null;

    function update(code){
        
        if(arguments.length==0 && current_oic===null){
            return null;
        }
        else if(arguments.length==0){
            code = current_oic;
        }
        else{
            current_oic = code;
        }

        dash_wrap.selectAll(".oic-name").text(store.id[code].city);
        dash_wrap.selectAll(".county-name").text(store.id[code].county + ", " + store.id[code].state);

        p1.header.style("background-image", 'url("' + dir.url("img", store.id[code].filename) + '")');

        var oictype = continuum_threshold(store.data[code].score_0016);
        var oictypecol = continuum_color[oictype];

        opt.type.style("background-color", oictypecol)
        opt.type.select("span.oic-type")
                .text("OIC type: " + oictype)
                .style("color",oictype=="Stabilizing" ? "#333333" : "#ffffff")
                ;

        legend(code, p2.legend);
        legend(code, p3.legend);

        //panel 1
        /*var p1sections = p1.wrap.selectAll("div.dashboard-panel-section").data([["aa","aa","aa"]]);
        p1sections.exit().remove();
        p1.sections = p1sections.enter().append("div").classed("dashboard-panel-section c-fix",true).merge(p1sections);

        var p1tiles = p1.sections.selectAll("div.dashboard-tile").data(function(d){return d});
        p1tiles.exit().remove();
        var p1tiles_enter = p1tiles.enter().append("div").classed("dashboard-tile",true);
        p1.tiles = p1tiles_enter.merge(p1tiles);*/

        //panel 2
        var p2sections = p2.wrap.selectAll("div.dashboard-panel-section")
            .data([{ind:["job","gmp"], title:"Growth, 2000–16"}, 
                   {ind:["pro", "pci"], title:"Prosperity, 2000–16"}, 
                   {ind:["med","ert"], title:"Inclusion, 2000–16"}]);
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
            bar_chart(this, "dot", code, d)
        });

        //set tile header heights
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


        //what makes xxx an OIC
        var oic_data = store.data[code];

        var criteria_boxes = criteria.selectAll("div.criterion").data([
            {
                title: "<span>1</span>Major urban center",
                subtitle: "Largest city population in county",
                value: "<span>" + format.num0(oic_data.largest_city_pop) + "</span>",
                caption: ""
            },
            {
                title: "<span>2</span>Manufacturing heritage",
                subtitle: "Share of jobs in manufacturing, 1970",
                value: "<span>" + format.sh1(oic_data.mf_jobs_1970/oic_data.RET_1970) + "</span>",
                caption: "By 2016 this had fallen to " + format.sh1(oic_data.mf_jobs_2016/oic_data.RET_2016)
            },
            {
                title: "<span>3</span>Slow job growth",
                subtitle: "",
                value: "<span>" + format.sh1(oic_data.percent_job_deficit*-1) + "</span>",
                caption: "fewer jobs in 2016 than expected, based on 1970 industrial structure"
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

    }

    update("01073");
    select.node().value = "01073";

    window.addEventListener("resize", function(){update();})

}
