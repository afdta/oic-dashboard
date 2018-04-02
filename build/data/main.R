library("tidyverse")
library("readxl")
library("jsonlite")

oicdata1 <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/data/OIC_INTERACTIVE_DATA.xlsx", na=c("","NA","N/A"))
nsfnih <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/data/NSF_NIH_education_grants.xlsx", na=c("","NA","N/A")) %>% select(stcofips, nsfnihpc=percapita)
bagap <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/data/ed_attainment_gap_by_race_2016.xlsx", na=c("","NA","N/A")) %>% select(stcofips, ba_gap=`Difference in BA attainment`, ba_gap_sig=`Significant?`)

#LEFT OFF HERE -- START HERE MONDAY
oicdata <- left_join(oicdata1, nsfnih) %>% inner_join(bagap) %>% 
  select(stcofips, RET_2016, RET_2000, RET_1970, rgdp_2016, rgdp_2000, incpercap_ch0016, incpercap_00, incpercap_sigch0016, 
         medinc_ch_0016, medinc00, medinc_sigch_0016, epop_ch_0016, epop_sigch_0016, nsfnihpc, ai_jobs_2016, ai_jobs_2010,
         hub_share_15, units_16, units_10, fb_share_ch_1016, fb_share_sigch_1016, ba_gap, ba_gap_sig,
         largest_city_pop, mf_jobs_2016, mf_jobs_1970, percent_job_deficit, score_0016)

source("/home/alec/Projects/Brookings/older-industrial-cities/build/img/process_images.R")

ubox <- function(e){
  cat(nrow(e))
  return(unbox(e))
}

d <- lapply(split(oicdata, oicdata$stcofips), ubox)

i <- lapply(split(id, id$stcofips), ubox)

dat <- list(id=i, data=d)

writeLines(toJSON(dat, na="null", digits=5), "~/Projects/Brookings/older-industrial-cities/assets/oic.json")


