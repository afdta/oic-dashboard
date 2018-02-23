library("tidyverse")
library("readxl")

setwd("~/Projects/Brookings/older-industrial-cities/build/data/")

load("OIC_DATA_FOR_INTERACTIVE.Rdata")

cities <- read_excel("OIC List.xlsx") %>% 
            select(stcofips, cbsa, county=`County Name`, metro=`Metro Name`, 
                   stabbr=State, city=`Largest City`, pop=`2016 Population`)

