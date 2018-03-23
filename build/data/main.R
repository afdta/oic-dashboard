library("tidyverse")
library("readxl")
library("jsonlite")

oicdata <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/data/OIC_INTERACTIVE_DATA.xlsx", na=c("","NA","N/A"))

source("/home/alec/Projects/Brookings/older-industrial-cities/build/img/process_images.R")

ubox <- function(e){
  cat(nrow(e))
  return(unbox(e))
}

d <- lapply(split(oicdata, oicdata$stcofips), ubox)

i <- lapply(split(id, id$stcofips), ubox)

dat <- list(id=i, data=d)

writeLines(toJSON(dat, na="null", digits=5), "~/Projects/Brookings/older-industrial-cities/assets/oic.json")


