library(readxl)
library(dplyr)

source("/home/alec/Projects/Brookings/older-industrial-cities/build/data/process_city_names.R")

input_dir <- "/home/alec/Projects/Brookings/older-industrial-cities/build/img/city_photos_raw/"
output_dir <- "/home/alec/Projects/Brookings/older-industrial-cities/assets/city_photos/"

filesheet <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/img/Spreadsheet_OIC pictures_LZ with photo credit.xlsx", na=c("","N/A","NA")) %>% select(city1=City, state=State, source=Source)

filesheet$city <-  case_when(
  filesheet$city1 == "Louisville/Jefferson County" ~ "Louisville",
  filesheet$city1=="New York (Brooklyn)" ~ "Brooklyn",
  filesheet$city1=="New York (Queens)" ~ "Queens",
  TRUE ~ filesheet$city1
)

filter(filesheet, city!=city1) #recode

filesheet$filename <- paste0(2:(nrow(filesheet)+1), " - ", filesheet$city, ".jpg")

files <- list.files(input_dir)

filter(filesheet, !(filename %in% files))
sum(files %in% filesheet$filename)

xwalk <- filesheet %>% select(city, state, infile=filename, source)

id <- cities %>% select(stcofips, county, cbsa, city, state=stabbr) %>% inner_join(xwalk)

id$filename <- ifelse(id$city=="Springfield", paste(id$city,id$state), id$city)
filter(id, filename != city)
id$filename <- gsub("\\(|\\)","",id$filename)
id$filename <- paste0(gsub("\\s+","_",id$filename),".jpg")
sum(duplicated(id$filename))

convert <- function(input_file, output_file){

  fqinput <- shQuote(paste0(input_dir, input_file))
  fqoutput <- shQuote(paste0(output_dir, output_file))
  
  #resize image to at least 320px tall and at least 600px wide
  command <- paste("convert", fqinput , "-resize 600x320^ -quality 74", fqoutput)
  
  cat(command)
  cat("\n")
  
  system(command)
}

for(f in 1:nrow(id)){
  convert(id$infile[f], id$filename[f])
}

id <- id %>% select(-infile)

rm(cities, filesheet, xwalk, files, input_dir, output_dir)

#oicname <- gsub("^.[^A-Z]*|.jpg","", files)
