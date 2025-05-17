// Master file aggregating all spreadsheet data
import { data as PARData } from './PAR';
import { data as SyntaxData } from './Syntax';
import { data as logData } from './log';
import { data as Frontend_allg_OLDData } from './Frontend_allg_OLD';
import { data as Frontend_R_ume_OLDData } from './Frontend_R_ume_OLD';
import { data as IN_buildData } from './IN_build';
import { data as IN_roomsData } from './IN_rooms';
import { data as clc_loadData } from './clc_load';
import { data as clc_powerData } from './clc_power';
import { data as clc_validData } from './clc_valid';
import { data as clc_buildData } from './clc_build';
import { data as TXT_roomsData } from './TXT_rooms';
import { data as TXT_buildData } from './TXT_build';
import { data as OUT_roomsData } from './OUT_rooms';
import { data as OUT_buildData } from './OUT_build';
import { data as clc_flatData } from './clc_flat';
import { data as res_flatData } from './res_flat';
import { data as Umrechnungshilfe_705520Data } from './Umrechnungshilfe_705520';
import { data as clc_colData } from './clc_col';
import { data as res_colData } from './res_col';
import { data as clc_tubeData } from './clc_tube';
import { data as res_tubeData } from './res_tube';
import { data as U_GEG_A_7Data } from './U_GEG_A.7';
import { data as DatenData } from './Daten';
import { data as Data_radiatorData } from './Data_radiator';
import { data as U_Werte_IWUData } from './U_Werte_IWU';
import { data as Normau_entemperatur_12831Data } from './Normau_entemperatur_12831';
import { data as Tabelle2Data } from './Tabelle2';
import { data as WindregionenData } from './Windregionen';
import { data as LuftwechselrateData } from './Luftwechselrate';
import { data as Tabelle1Data } from './Tabelle1';
import { data as AusgabetexteData } from './Ausgabetexte';
import { data as AnmerkungenData } from './Anmerkungen';
import { namedExpressions } from './namedExpressions';
import { explicitNamedRanges } from './explicitNamedRanges';
import { databaseRanges } from './databaseRanges';

export const sheetsData = {
  "PAR": PARData,
  "Syntax": SyntaxData,
  "log": logData,
  "Frontend_allg_OLD": Frontend_allg_OLDData,
  "Frontend_Räume_OLD": Frontend_R_ume_OLDData,
  "IN_build": IN_buildData,
  "IN_rooms": IN_roomsData,
  "clc_load": clc_loadData,
  "clc_power": clc_powerData,
  "clc_valid": clc_validData,
  "clc_build": clc_buildData,
  "TXT_rooms": TXT_roomsData,
  "TXT_build": TXT_buildData,
  "OUT_rooms": OUT_roomsData,
  "OUT_build": OUT_buildData,
  "clc_flat": clc_flatData,
  "res_flat": res_flatData,
  "Umrechnungshilfe_705520": Umrechnungshilfe_705520Data,
  "clc_col": clc_colData,
  "res_col": res_colData,
  "clc_tube": clc_tubeData,
  "res_tube": res_tubeData,
  "U_GEG_A.7": U_GEG_A_7Data,
  "Daten": DatenData,
  "Data_radiator": Data_radiatorData,
  "U_Werte_IWU": U_Werte_IWUData,
  "Normaußentemperatur_12831": Normau_entemperatur_12831Data,
  "Tabelle2": Tabelle2Data,
  "Windregionen": WindregionenData,
  "Luftwechselrate": LuftwechselrateData,
  "Tabelle1": Tabelle1Data,
  "Ausgabetexte": AusgabetexteData,
  "Anmerkungen": AnmerkungenData,
} as const;

export {
  namedExpressions,
  explicitNamedRanges,
  databaseRanges,
};
