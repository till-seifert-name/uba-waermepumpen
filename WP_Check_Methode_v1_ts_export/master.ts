// Master file aggregating all spreadsheet data
import { data as PARData } from './PAR';
// (excluded by blacklist) import { data as SyntaxData } from './Syntax';
import { data as IN_buildData } from './IN_build';
import { data as IN_roomsData } from './IN_rooms';
import { data as clc_loadData } from './clc_load';
import { data as clc_powerData } from './clc_power';
import { data as clc_buildData } from './clc_build';
import { data as TXT_roomsData } from './TXT_rooms';
import { data as TXT_buildData } from './TXT_build';
import { data as OUT_roomsData } from './OUT_rooms';
import { data as OUT_buildData } from './OUT_build';
import { data as U_GEG_A_7Data } from './U_GEG_A.7';
import { data as DatenData } from './Daten';
import { data as Data_radiatorData } from './Data_radiator';
import { data as U_Werte_IWUData } from './U_Werte_IWU';
import { data as Normau_entemperatur_12831Data } from './Normau_entemperatur_12831';
import { namedExpressions } from './namedExpressions';
import { explicitNamedRanges } from './explicitNamedRanges';
import { databaseRanges } from './databaseRanges';

export const sheetsData = {
  "PAR": PARData,
// (excluded by blacklist)   "Syntax": SyntaxData,
  "IN_build": IN_buildData,
  "IN_rooms": IN_roomsData,
  "clc_load": clc_loadData,
  "clc_power": clc_powerData,
  "clc_build": clc_buildData,
  "TXT_rooms": TXT_roomsData,
  "TXT_build": TXT_buildData,
  "OUT_rooms": OUT_roomsData,
  "OUT_build": OUT_buildData,
  "U_GEG_A.7": U_GEG_A_7Data,
  "Daten": DatenData,
  "Data_radiator": Data_radiatorData,
  "U_Werte_IWU": U_Werte_IWUData,
  "Normaußentemperatur_12831": Normau_entemperatur_12831Data,
} as const;

export {
  namedExpressions,
  explicitNamedRanges,
  databaseRanges,
};
