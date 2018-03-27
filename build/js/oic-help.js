//pn: parent node

export default function oic_help(pn){
    
    var wrap = d3.select(pn); 

    var opanel = d3.select(pn).append("div")
        .style("position","fixed")
        .style("margin","0px")
        .style("width","100vw")
        .style("height","100vh")
        .style("background-color", "rgba(240,240,240,1)")
        .style("display","none")
        .style("opacity","0")
        .style("z-index","1000")
        .style("left","0px")
        .style("top","0px")
        .style("overflow","auto")
        ;

    var opanel_buttons = opanel.append("div")
        .style("max-width","900px")
        .style("margin","5% auto 0px auto")
        .style("padding","1rem")
        .classed("c-fix",true)
        ;

    var opanel_content = opanel.append("div")
        .style("max-width","900px")
        .style("margin","0% auto")
        .style("padding","0rem 1rem")
        .classed("c-fix",true)
        ;  

    opanel_buttons.append("p").style("text-align","right").text("- close -")
        .style("margin","0rem 0rem").style("cursor","pointer");

    //show panel
    wrap.selectAll(".oic-help").on("click", function(){
        d3.event.stopPropagation();
        opanel.interrupt().style("display","block")
            .transition().style("opacity","1")
            .on("end", function(){
                d3.select("body").classed("disable-scroll",true);
            });
        try{
            fill_help(this.dataset.help);
        }
        catch(e){

        }
            
    });

    //hide panel
    wrap.on("click", function(){
        d3.select("body").classed("disable-scroll",false);
        opanel.interrupt().transition().duration(400).style("opacity","0")
            .on("end", function(){
                opanel.style("display","none")
            });
    })

    var info = {
        typology: {
            title: "A typology for Older Industrial Cities",
            text: []
        },
        geography: {
            title: "Notes on data and geography",
            text: []
        },
        performance: {
            title: "Performance indicators",
            text: []
        },
        assets: {
            title: "Assets and challenges",
            text: []
        }
    }

    var dummy_text = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non nunc eget sapien suscipit scelerisque quis non ante. Phasellus vitae lectus ac ipsum gravida tincidunt. Vivamus iaculis eleifend risus quis molestie. Etiam euismod et urna id luctus. Pellentesque libero risus, sagittis eu neque ac, elementum varius turpis. Suspendisse convallis sapien ac fermentum dapibus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam erat volutpat. Nam blandit nisi vitae faucibus tempus.",
    "Donec fringilla ut nibh ac pulvinar. Aenean efficitur malesuada magna, quis pulvinar ex mollis faucibus. In nec tincidunt turpis, ut tempus eros. Sed consequat mi eu pulvinar consectetur. Proin quis purus lacus. Nulla aliquet sem id risus lacinia, laoreet faucibus leo elementum. Nam pulvinar, justo sed mattis pellentesque, velit est interdum nibh, quis vehicula risus felis sit amet nibh. Integer malesuada risus sed dignissim efficitur.",
    "Sed laoreet ex in velit rutrum, et aliquam eros cursus. Duis eleifend ex a est bibendum egestas. Integer et aliquam nunc, vel aliquam urna. Aenean nunc leo, iaculis in velit id, commodo porttitor erat. Pellentesque ac lacus ac diam sodales ullamcorper. Suspendisse dictum ipsum et facilisis placerat. Maecenas eget urna nec dolor aliquam hendrerit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam id interdum est. Vestibulum maximus turpis eget elit hendrerit, id convallis quam interdum. Praesent eu dui eget tellus consequat convallis sit amet eget lorem. Curabitur pharetra mi dictum leo lacinia, quis iaculis massa ultrices."
    ]

    function fill_help(attr){
        
        var title = opanel_content.selectAll("p.help-title").data([attr]);
        title.enter().append("p").classed("help-title",true).merge(title)
            .text(function(d){return info[attr].title})
            .style("font-size","1.25rem").style("font-weight","bold")
            .style("margin","0rem 0rem 1rem 0rem")
            ;

        var text = opanel_content.selectAll("p.help-content").data(dummy_text);
        text.enter().append("p").classed("help-content",true).merge(text)
            .text(function(d){return d})
            .style("font-style","italic").style("margin","0rem 0rem 1rem 0rem")
            ;
    }



 
}