/**
 * 8 calculation methods for parity testing.
 * Tehran/Jafari excluded per D-P3-19.
 */

import { AsrConvention, HighLatitudeRule, ShafaqMode } from "../../types/index.js";
import type { GetTimesParams } from "../../types/index.js";

type MethodParams = Omit<GetTimesParams, "date" | "lat" | "lng" | "tz">;

export interface Method {
  id: string;
  label: string;
  params: MethodParams;
}

export const METHODS: Method[] = [
  {
    id: "MWL",
    label: "Muslim World League (Dynamic)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.none,
      shafaqMode: ShafaqMode.general,
    },
  },
  {
    id: "ISNA",
    label: "ISNA North America (Dynamic, angle-based HL)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.angleBased,
      shafaqMode: ShafaqMode.general,
    },
  },
  {
    id: "EGYPT",
    label: "Egyptian General Authority (Dynamic, Ahmer shafaq)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.none,
      shafaqMode: ShafaqMode.ahmer,
    },
  },
  {
    id: "MAKKAH",
    label: "Umm al-Qura Makkah (Dynamic, Abyad shafaq)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.none,
      shafaqMode: ShafaqMode.abyad,
    },
  },
  {
    id: "KARACHI",
    label: "University of Islamic Sciences, Karachi (Dynamic, One-Seventh HL)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.oneSeventh,
      shafaqMode: ShafaqMode.general,
    },
  },
  {
    id: "UOIF",
    label: "UOIF France (Dynamic, Middle-of-Night HL)",
    params: {
      asrConvention: AsrConvention.shafii,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.middleOfNight,
      shafaqMode: ShafaqMode.general,
    },
  },
  {
    id: "HANAFI_DYNAMIC",
    label: "Hanafi Asr + Dynamic Angles",
    params: {
      asrConvention: AsrConvention.hanafi,
      hanafiAngles: false,
      highLatitudeRule: HighLatitudeRule.angleBased,
      shafaqMode: ShafaqMode.general,
    },
  },
  {
    id: "HANAFI_FIXED",
    label: "Hanafi Asr + Fixed 18°/17° Angles",
    params: {
      asrConvention: AsrConvention.hanafi,
      hanafiAngles: true,
      highLatitudeRule: HighLatitudeRule.angleBased,
      shafaqMode: ShafaqMode.general,
    },
  },
];
