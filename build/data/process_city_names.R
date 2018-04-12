cities <- read_excel("/home/alec/Projects/Brookings/older-industrial-cities/build/data/OIC List.xlsx") %>% 
  select(stcofips, cbsa, county1=`County Name`, metro=`Metro Name`, 
         stabbr=State, city2=`Largest City`, pop=`2016 Population`)
cities$county <- sub(", VA", "", cities$county1)

cities$city1 <- sub("\\s*city|/.*$", "", cities$city2)
city1 <- cities$city1

cities$city <- case_when(
  city1=="New York" & cities$county=="Kings County" ~ "Brooklyn",
  city1=="New York" & cities$county=="Queens County" ~ "Queens",
  TRUE ~ city1
)

rm(city1)

cat("City/county names that were altered: \n")
print(filter(cities, (city != city1) | (county != county1) ))
