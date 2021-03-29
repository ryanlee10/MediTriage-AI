library(readr)
options(scipen = 50)
SCM1_VISIT <- read_delim("SCM/SCM1_VISIt.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM2_BASICOBSERVATION <- read_delim("SCM/SCM2_BASICOBSERVATION.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM3_DOCUMENT <- read_delim("SCM/SCM3_DOCUMENT.csv", ";", escape_double = FALSE, trim_ws = TRUE)

SCM4_HEALTHISSUEDECLARATION <- read_delim("SCM/SCM4_HEALTHISSUEDECLARATION.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM4_HEALTHISSUEDECLARATION = SCM4_HEALTHISSUEDECLARATION[!is.na(as.numeric(SCM4_HEALTHISSUEDECLARATION$HOMECARE_ID)), ]

SCM5_MEDICATIONEXTENSION <- read_delim("SCM/SCM5_MEDICATIONEXTENSION.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM6_ORDER <- read_delim("SCM/SCM6_ORDER.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM7_ORDERTASKOCCURRENCE <- read_delim("SCM/SCM7_ORDERTASKOCCURRENCE.csv", ";", escape_double = FALSE, trim_ws = TRUE)

SCM8_ORDERUSERDATA <- read_delim("SCM/SCM8_ORDERUSERDATA.csv", ";", escape_double = FALSE, trim_ws = TRUE)
SCM8_ORDERUSERDATA = SCM8_ORDERUSERDATA[!is.na(as.numeric(SCM8_ORDERUSERDATA$HOMECARE_ID)), ]

SCM9_DOCDATA <- read_delim("SCM/SCM9_DOCDATA.csv", "|", escape_double = FALSE, trim_ws = TRUE, n_max = 1000000, )
SCM9_DOCDATA = data.table::fread(file = "SCM/SCM9_DOCDATA.csv", sep = ";")

SCM10_Notes <- read_delim("SCM/SCM10_Notes.csv", "|", escape_double = FALSE, trim_ws = TRUE)
SCM11_DIText <- read_delim("SCM/SCM11_DIText.csv", "|", escape_double = FALSE, trim_ws = TRUE)

SCM1_rawIDList = unique(SCM1_VISIT$HOMECARE_ID)
SCM2_rawIDList = unique(SCM2_BASICOBSERVATION$HOMECARE_ID)
SCM3_rawIDList = unique(SCM3_DOCUMENT$HOMECARE_ID)

SCM4_rawIDList = unique(SCM4_HEALTHISSUEDECLARATION$HOMECARE_ID)
SCM4_rawIDList = as.numeric(as.character(unlist(SCM4_rawIDList[])))

SCM5_rawIDList = unique(SCM5_MEDICATIONEXTENSION$HOMECARE_ID)
SCM6_rawIDList = unique(SCM6_ORDER$HOMECARE_ID)
SCM7_rawIDList = unique(SCM7_ORDERTASKOCCURRENCE$HOMECARE_ID)

SCM8_rawIDList = unique(SCM8_ORDERUSERDATA$HOMECARE_ID)
SCM8_rawIDList = as.numeric(as.character(unlist(SCM8_rawIDList[])))

uniqueIDList = sort(union(x = SCM4_rawIDList, SCM1_rawIDList))

df = SCM10_Notes

require(magrittr) # needed for %<>%
df %<>% mutate(HOMECARE_ID = base::ifelse(HOMECARE_ID %in% uniqueIDList, match(HOMECARE_ID, uniqueIDList),0))

write.csv(x = df, file = "SCM/SCM8_ORDERUSERDATA_UNIDENTIFIED.csv", row.names = FALSE)

























