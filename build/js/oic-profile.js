import degradation from "../../../js-modules/degradation.js";
import dimensions from "../../../js-modules/dimensions.js";
import format from "../../../js-modules/formats.js";

import palette from "./palette.js";
import oic_menu from "./oic-menu.js";

export default function oic_profile(store){
    console.log(store)

    var dash_wrap = d3.select("#oic-dashboard");
    //d3.select(dash_wrap.node().parentNode).style("background-color","#162231");

    var pal = palette();

    ///////////////
    // OPT PANEL //
    ///////////////
    var opt = {};
    opt.wrap = d3.select("#dashboard-menu");
    opt.button = opt.wrap.append("div").classed("dashboard-options-button", true);
    opt.button.append("p").text("Select an OIC");
    oic_menu(opt.button, store.id, update);


    ///////////////
    //  PANEL 1  //
    ///////////////
    var p1 = {};
    p1.wrap = d3.select("#dash-panel-1");
    p1.header = p1.wrap.append("div")//.style("padding","10px 0px 0px 10px").style("border","1px solid #aaaaaa")
                                    //.style("border-width","1px 0px 0px 1px")
                        .append("div").classed("dashboard-panel-image dashboard-panel-title", true);
    p1.header.style("background-image", 'url("https://source.unsplash.com/ukvgqriuOgo")');
    
    p1.wrap.append("p").html('<span class="oic-name">___</span> is a(n) strong | xyz OIC')
    p1.wrap.append("img").attr("src","./assets/typology.png").style("display","block").style("width","100%").style("max-width","400px");


    p1.wrap.append("p").html('What makes <span class="oic-name">___</span> an OIC?').style("font-weight","bold");
    p1.wrap.append("img").attr("src","./assets/basics.png").style("display","block").style("width","80%").style("max-width","400px");


    //p1.header.append("div").append("div").append("p").html('What makes <span class="oic-name">___</span> an OIC?');
    
    ///////////////
    //  PANEL 2  //
    ///////////////
    var p2 = {};
    p2.wrap = d3.select("#dash-panel-2");
    p2.header = p2.wrap.append("div").classed("dashboard-panel-title", true);
    //p2.header.append("div").append("div").append("p").html('Economic performance indicators for <span class="oic-name">___</span>');
    p2.header.append("p").html('Economic performance indicators for <span class="oic-name">___</span>');

    p2.header.append("img").attr("src","./assets/legend.png").style("display","block").style("width","80%").style("max-width","300px")
        .style("margin-bottom","10px");


    
    ///////////////
    //  PANEL 3  //
    ///////////////
    var p3 = {};
    p3.wrap = d3.select("#dash-panel-3");
    p3.header = p3.wrap.append("div").classed("dashboard-panel-title", true);
    //p3.header.append("div").append("div").append("p").html('Assets and challenges for <span class="oic-name">___</span>');
    p3.header.append("p").html('Assets and challenges for <span class="oic-name">___</span>');

    p3.header.append("img").attr("src","./assets/legend.png").style("display","block").style("width","80%").style("max-width","300px")
        .style("margin-bottom","10px");


    function get_ind(ind, dict){
        var r = {title:"Title", value:null, format:"N/A", sig:1};
        
        if(ind == "job"){
            r.title = "Change in jobs, 2000–16";
            r.value = (dict.RET_2016/dict.RET_2000)-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "gmp"){
            r.title = "Change in real gross metropolitan product (GMP), <span>2000–16</span>";
            r.value = (dict.rgdp_2016/dict.rgdp_2000)-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "pro"){
            r.title = "Change in real GMP per job, <span>2000–16</span>";
            r.value = ((dict.rgdp_2016/dict.RET_2016)/(dict.rgdp_2000/dict.RET_2000))-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "pci"){
            r.title = "Change in (real?) per capita income, <span>2000–16</span>";
            r.value = (dict.incpercap16/dict.incpercap00)-1;
            r.format = format.pct1(r.value);
        }
        else if(ind == "med"){
            r.title = "Change in (real?) median household income, <span>2000–16</span>";
            r.value = dict.medinc_ch_0016;
            r.sig = dict.medinc_sigch_0016;
            r.format = format.pct1(r.value);
        }
        else if(ind == "ert"){
            r.title = "Change in the employment rate for 25–64 year-olds (CHECK VAR NAME), <span>2000–16</span>";
            r.value = dict.epop_ch_0016
            r.sig = dict.epop_sigch_0016;
            r.format = format.shch1(r.value);
        }
        else if(ind == "nsf"){
            r.title = "NSF/NIH funding per capita (NEED TO GET FROM CECILE)";
            r.value = Math.random()*1000;
            r.format = format.shch1(r.value);
        }
        else if(ind == "aij"){
            r.title = "Number of jobs in advanced industries, 2016";
            r.value = dict.ai_jobs_2016;
            r.format = format.num0(r.value);
        }
        else if(ind == "clu"){
            r.title = "Share of jobs in urban clusters, 2015";
            r.value = dict.hub_share_15;
            r.format = format.sh1(r.value);
        }
        else if(ind == "pmt"){
            r.title = "Number of housing units permitted in 2016";
            r.value = dict.units_16;
            r.format = format.num0(r.value);
        }
        else if(ind == "for"){
            r.title = "Change in share foreign born, <span>2010–16</span>";
            r.value = dict.fb_share_ch_1016;
            r.sig = dict.fb_share_sigch_1016;
            r.format = format.shch1(r.value);
        }
        else if(ind == "edu"){
            r.title = "Difference b/n white and non-white BA+ attainment rate, 2016 (ADD SIG)";
            r.value = dict.nhw_baplus - dict.nonwhite_baplus;
            r.sig = 0;
            r.format = format.pct1(r.value);
        }

        return r;
    }

    function bar_chart(el, type, oic, ind, sigvar){
        var wrap = d3.select(el);
        var dim = dimensions(el);
        var pad = [10, 10, 30, 10];

        var bar_height = 12;
        var bar_pad = 5;

        //chart (svg) dimensions
        var width = (dim.width < 200 ? 200 : dim.width) - 20; //account for tile padding
        var height = pad[0] + pad[2] + (bar_height*4) + (bar_pad*3);

        var dat = {};
        //oic, oic avg, all urban industrial, all urban -- need to get latter 3 data points
        var oic = store.data[oic];
        var val = get_ind(ind, oic);
        
        dat.points = [val.value, 
                      val.value + (val.value*Math.random()),
                      val.value + (val.value*Math.random()),
                      val.value + (val.value*Math.random())]

        var extent = d3.extent(dat.points);
        if(extent[0] > 0){extent[0] = 0} //if min greater than 0
        if(extent[1] < 0){extent[1] = 0} //if max less than 0

        var xscale = d3.scaleLinear().domain(extent).range([0,width-40]);

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

        var bars = barse.merge(barsu);

        bars.attr("transform", function(d,i){return "translate(0," + (i*(bar_height+bar_pad)) + ")"})

        function filler(d,i){
            var cols = pal.categories;
            return i==0 ? cols.oic :
                          i==1 ? cols.alloic :
                                i==2 ? cols.urban :
                                    cols.urbani;
        }

        bars.select("circle").attr("cy", "8px").attr("r","6")
            .style("visibility", type!="bar" ? "visible" : "hidden")
            .attr("cx", function(d){return xscale(d)})
            .attr("fill", filler);

        bars.select("rect").attr("x", function(d){
                                return d >= 0 ? xscale(0) : xscale(d);
                           })
                           .attr("width", function(d){
                                return d >= 0 ? xscale(d) - xscale(0) : xscale(0) - xscale(d);
                           })
            .style("height", type!="bar" ? "2px" : bar_height+"px")
            .attr("y", type != "bar" ? "7px" : "0px")
            .attr("fill", filler);

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
        dash_wrap.selectAll(".county-name").text(store.id[code].county + ", " + store.id[code].stabbr);

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
            .data([{ind:["job","gmp"], title:"Growth"}, 
                   {ind:["pro", "pci"], title:"Prosperity"}, 
                   {ind:["med","ert"], title:"Inclusion"}]);
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
        var hhh = (hh+15)+"px";
        tile_headers.style("height", hhh).style("line-height", hhh);
    }

    update("01073");

    window.addEventListener("resize", function(){update();})

}
