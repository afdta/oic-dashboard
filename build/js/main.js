import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import oic_profile from './oic-profile.js';


//main function
function main(){


  //local
  dir.local("./");
  dir.add("assets", "assets");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("assets", "oi-cities/assets");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("metro-interactive"));


  //browser degradation
  if(compat.browser()){
    //run app...
  
    d3.json(dir.url("assets", "oic.json"), function(error, data){
      if(error){
        compat.alert(document.getElementById("oic-dashboard"));
      } else{
        oic_profile(data);
        
      }
    });

  };

} //close main()


document.addEventListener("DOMContentLoaded", main);
