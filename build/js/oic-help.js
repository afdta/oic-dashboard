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
            title: "A typology of Older Industrial Cities",
            text: ["This typology incorporates change in seven growth, prosperity, and inclusion indicators: GDP (gross value added), jobs, jobs at young firms (those less than five years old), GDP per job, per-capita household income, prime-age employment-to-population ratio, and median household income. For a given OIC, its performance on each of these indicators from 2000 to 2016 is scored relative to a group of 360 urban counties. These scores are combined to produce an overall performance index (for full methodological details, please see the full report). The four OIC types are derived from this index.",
            "<strong>Strong</strong> OICs rank among the top half of all urban counties on the performance index. While most of these 16 counties are not growing particularly rapidly, they tend to achieve high marks on prosperity and inclusion, suggesting that the economic well-being of their existing residents is improving over time. Most of these counties cluster along the eastern seaboard, including those in New York City (Brooklyn and Queens), and within the orbit of Boston (Bristol, Essex, Norfolk, and Worcester counties) and Philadelphia (including the city itself, and the counties surrounding Bethlehem, Pa. and Trenton, N.J.). Buffalo, St. Louis, and Waterloo, Iowa are strong performers in the interior.",
            "<strong>Emerging</strong> OICs include a regionally diverse group of 24 counties that, while also growing relatively slowly, manage average marks among all urban counties on prosperity and inclusion. Many of these also locate near the east coast in southern New England, upstate New York, New Jersey, and eastern Pennsylvania. Among emerging OICs, Louisville, Milwaukee, St. Paul, and Cincinnati in the Midwest, and Birmingham in the South, are all bouncing back strongly from a difficult 2000s decade.",
            "<strong>Stabilizing</strong> OICs generally rank among the bottom third of all counties on measures of growth, prosperity, and inclusion. Among the 16 are a number of small-to-midsized markets in Ohio, Indiana, and Michigan (along with a couple large ones such as Cleveland and Indianapolis) negatively affected by the manufacturing downturn of the 2000s that are beginning to regain their footing, yet still struggling to ensure wider prosperity. Compared to 2000, nearly all of these counties today have fewer jobs, lower incomes, and lower rates of employment, though most remain within shouting distance of those previous peaks.",
            "<strong>Vulnerable</strong> OICs, 14 in all, rank among the bottom 5 percent of all urban counties on the performance index, and in the bottom quartile in each of the index’s three dimensions (growth, prosperity, inclusion). Detroit (Wayne County) is the only large older industrial county on this list; the rest include smaller cities in Georgia, Illinois, and Indiana. Some of these places, including Albany, Detroit, Flint, Kokomo, and Muncie, are bouncing back this decade. Median household income in Dougherty County, Georgia (around Albany), for instance, is up 19 percent since 2010, and the employment rate in Wayne County, Mich. (around Detroit) has risen 7 percentage points. But given how devastating the 2000s were for nearly all of these counties, they overall remain considerably smaller and poorer than they were at the turn of the century."]

        },
        geography: {
            title: "Notes on data and geography",
            text: []
        },
        performance: {
            title: "Performance indicators",
            text: ['We assess the performance of local and regional economies based on a more expansive definition than typical headline metrics such as population, job growth, or the unemployment rate. We adapt the definition from a framework developed for <a href="https://www.brookings.edu/research/metro-monitor-2018/" target="_blank">Brookings’s Metro Monitor</a>. While headline statistics measure outcomes that certainly matter, they constitute only part of what true economic development should seek to achieve: putting local economies on a higher trajectory of long-run growth, by improving the productivity of individuals and firms in order to raise local standards of living (prosperity) for all people (inclusion).',
                'We use a series of indicators to examine outcomes over time in each of these three areas—growth, prosperity, and inclusion—for the 70 older industrial counties:',
                '<strong>Growth</strong>',
                '<ul><li>GDP (gross value added)</li><li>Jobs</li><li>Jobs at young firms (those less than five years old)</li></ul>',
                '<em>Sources: Moody\'s Analytics (jobs and GDP) and U.S. Census Bureau’s Longitudinal Employer Household Dynamics program (jobs at young firms)</em>',
                '<strong>Prosperity</strong>',
                '<ul><li>GDP per job</li><li>Per-capita household income</li></ul>',
                '<em>Sources: Moody\'s Analytics, the American Community Survey, and Census 2000</em>',                
                '<strong>Inclusion</strong>',
                '<ul><li>Prime-age employment-to-population ratio</li><li>Median household income</li></ul>', 
                '<em>Sources: The American Community Survey and Census 2000</em>'
            ]
        },
        assets: {
            title: "Assets and challenges",
            text: ["Older industrial cities are not economies unto themselves. They function amid wider regional, national, and global dynamics that shape opportunities for places through major economic and social forces. Chief among these forces are technological change, urbanization, and demographic transformation. The fortunes of older industrial cities in coming years will depend greatly on how well their companies, institutions, and residents recognize and navigate those forces.",
                '<strong>Technological change</strong>',
                '<ul><li>NSF and NIH funding per capita</li><li>Jobs in advanced industries</li></ul>',
                '<em>Sources: USAspending.gov and Brookings analysis of data from Moody\'s Analytics</em>',
                '<strong>Urbanization</strong>',
                '<ul><li>Share of jobs in dense clusters</li><li>Housing units permitted</li></ul>',
                '<em>Sources: LEHD LODES and Census Building Permits Survey</em>',                
                '<strong>Demographic transformation</strong>',
                '<ul><li>Share of population that is foreign born</li><li>Difference between white and non-white bachelor’s attainment rate</li></ul>', 
                '<em>Sources: The American Community Survey</em>'
            ]
        }
    }










    function fill_help(attr){
        
        var title = opanel_content.selectAll("p.help-title").data([attr]);
        title.exit().remove();
        title.enter().append("p").classed("help-title",true).merge(title)
            .text(function(d){return info[attr].title})
            .style("font-size","1.25rem").style("font-weight","bold")
            .style("margin","0rem 0rem 1rem 0rem")
            ;

        var text = opanel_content.selectAll("p.help-content").data(info[attr].text);
        text.exit().remove();
        text.enter().append("p").classed("help-content",true).merge(text)
            .html(function(d){return d})
            .style("font-style","normal").style("margin","0rem 0rem 1rem 0rem")
            ;
    }



 
}