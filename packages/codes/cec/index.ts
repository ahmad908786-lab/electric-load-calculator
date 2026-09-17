import type { CalculatorDef } from "../../calc-core/types";
import { voltageDropCalc } from "./calculators/voltage-drop";
import { cableSizeCalc } from "./calculators/cable-size";
import { dwellingLoadCalc } from "./calculators/dwelling-load";
import { generalLoadCalc } from "./calculators/general-load";
import { kvaToAmpCalc, kwToAmpCalc, ampacityLookupCalc, breakerSizeCalc } from "./calculators/conversions";
import { motorFlaCalc } from "./calculators/motor";
import { transformerSizingCalc, fuseSizeCalc } from "./calculators/transformer";
import { powerFactorCalc, capacitorBankCalc, threePhaseCalc, singlePhaseCalc, faultCurrentCalc, shortCircuitCalc } from "./calculators/power";
import { batterySizeCalc } from "./calculators/battery";
import { conduitFillCalc } from "./calculators/conduit";
import { arcFlashCalc } from "./calculators/arc-flash";
import { buriedCableCalc, generalSizingCalc } from "./calculators/extra";

/** All implemented CEC calculators. */
export const CEC_CALCULATORS: CalculatorDef[] = [
  // Load
  dwellingLoadCalc,
  generalLoadCalc,
  motorFlaCalc,
  // Sizing
  cableSizeCalc,
  buriedCableCalc,
  ampacityLookupCalc,
  generalSizingCalc,
  breakerSizeCalc,
  fuseSizeCalc,
  transformerSizingCalc,
  capacitorBankCalc,
  batterySizeCalc,
  conduitFillCalc,
  // Power
  voltageDropCalc,
  faultCurrentCalc,
  shortCircuitCalc,
  powerFactorCalc,
  arcFlashCalc,
  // Conversion
  kvaToAmpCalc,
  kwToAmpCalc,
  threePhaseCalc,
  singlePhaseCalc,
];
