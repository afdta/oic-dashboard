export default function oic_menu(button, options, callback){
    var pn =  button.node().parentNode;  

    var opt = [];
    for(var o in options){
        if(options.hasOwnProperty(o)){
            opt.push(options[o])
        }
    }

    var opanel = d3.select(pn).append("div")
        .style("position","fixed")
        .style("margin","0px")
        .style("width","100vw")
        .style("height","100vh")
        .style("background-color", "rgba(240,240,240,0.95)")
        .style("display","none")
        .style("opacity","0")
        .style("z-index","1000")
        .style("left","0px")
        .style("top","0px")
        .style("overflow","auto")
        ;

    var opanel_inner = opanel.append("div")
            .style("max-width","1400px")
            .style("margin","5% auto")
            .style("padding","1rem")
            .classed("c-fix",true)
            ;
    opanel_inner.append("p").style("text-align","right").text("- close -")
        .style("margin","1rem 2rem").style("cursor","pointer");

    var options = opanel_inner.selectAll("div").data(opt);
    var optionse = options.enter().append("div").classed("dashboard-options-button",true);
        optionse.append("p").style("background-color","#ffffff");
    optionse.merge(options).sort(function(a,b){
        var s = 1;
        if(a.city==b.city){
            s = 0;
        }
        else if(a.city < b.city){
            s = -1;
        }
        return s;
    })
    .on("click", function(d){
        callback.call(d, d.stcofips);
    }).style("float","left").style("margin","5px")
    .select("p").text(function(d){return d.city});

    //show panel
    button.on("click", function(){
        d3.event.stopPropagation();
        opanel.interrupt().style("display","block")
            .transition().style("opacity","1")
            .on("end", function(){
                d3.select("body").classed("disable-scroll",true);
            });
    });

    //hide panel
    d3.select(pn.parentNode).on("click", function(){
        d3.select("body").classed("disable-scroll",false);
        opanel.interrupt().transition().duration(400).style("opacity","0")
            .on("end", function(){
                opanel.style("display","none")
            });
    })

    function scroll(){

    }

    window.addEventListener("scroll", scroll); 
}