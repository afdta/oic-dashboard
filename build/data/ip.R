library("tidyverse")
library("readxl")
library("jsonlite")

setwd("~/Projects/Brookings/older-industrial-cities/build/data/")

load("OIC_DATA_FOR_INTERACTIVE.Rdata")

cities <- read_excel("OIC List.xlsx") %>% 
            select(stcofips, cbsa, county=`County Name`, metro=`Metro Name`, 
                   stabbr=State, city=`Largest City`, pop=`2016 Population`)

ubox <- function(e){
  cat(nrow(e))
  return(unbox(e))
}

d <- lapply(split(oicdata, oicdata$stcofips), ubox)

i <- lapply(split(cities, cities$stcofips), ubox)

dat <- list(id=i, data=d)

writeLines(toJSON(dat, na="null", digits=5), "~/Projects/Brookings/older-industrial-cities/assets/oic.json")
