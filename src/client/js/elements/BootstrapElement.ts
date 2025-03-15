import { CSSResultGroup } from "lit";
import Element from "./Element";

const globalSheetNames = [/bootstrap.min.css/];

const globalStyle = Array.from(document.styleSheets)
  .filter((sheet) =>
    globalSheetNames.some((allowedSheetName) =>
      allowedSheetName.test(sheet.href)
    )
  )
  .map((sheet) => {
    const cssSheet = new CSSStyleSheet();
    cssSheet.replaceSync(
      Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("\n")
    );
    return cssSheet;
  });

export default class BootstrapElement extends Element {
  static styles: CSSResultGroup = [globalStyle];
}
