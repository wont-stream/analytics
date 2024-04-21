import vendorFragments from "../../fixtures/regexes/vendorfragments.json";
import { userAgentParser } from "../../utils/user-agent";
export default class VendorFragmentParser {
  constructor() {
    this.parse = (userAgent) => {
      for (const [brand, vendorFragment] of Object.entries(vendorFragments)) {
        for (const regex of vendorFragment) {
          const match = userAgentParser(regex, userAgent);
          if (!match) continue;
          return brand;
        }
      }
      return "";
    };
  }
}
