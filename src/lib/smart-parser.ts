import type { WorksheetData } from "./sonoflow-types";

export interface ParseResult {
  data: WorksheetData;
  matches: string[];
}

export function parseDictation(text: string, current: WorksheetData): ParseResult {
  const t = text.toLowerCase();
  const next: WorksheetData = {
    liver: { ...current.liver },
    gallbladder: { ...current.gallbladder },
    biliary: { ...current.biliary },
    kidneys: { ...current.kidneys },
    spleen: { ...current.spleen },
    pancreas: { ...current.pancreas },
    vessels: { ...current.vessels },
    ascites: { ...current.ascites },
  };
  const matches: string[] = [];
  const cbdMatch = t.match(/\bcbd\b[^\d]{0,12}(\d+(\.\d+)?)\s*mm/);
  const spleenMatch = t.match(/\bspleen\b[^\d]{0,16}(\d+(\.\d+)?)\s*cm/);
  const liverMatch = t.match(/\bliver\b[^\d]{0,16}(\d+(\.\d+)?)\s*cm/);
  const rightKidneyMatch = t.match(/right kidney[^\d]{0,16}(\d+(\.\d+)?)\s*cm/);
  const leftKidneyMatch = t.match(/left kidney[^\d]{0,16}(\d+(\.\d+)?)\s*cm/);

  if (t.includes("fatty liver") || t.includes("steatosis")) {
    next.liver.echotexture = "Diffusely echogenic (fatty infiltration)";
    matches.push("Liver: fatty infiltration");
  }
  if (t.includes("gallstones") || t.includes("cholelithiasis")) {
    next.gallbladder.content = "Gallstones";
    matches.push("Gallbladder: gallstones");
  }
  if (t.includes("dilated cbd") || t.includes("cbd dilated") || t.includes("common bile duct dilated")) {
    next.biliary.intrahepatic = "Dilated";
    if (cbdMatch?.[1]) {
      next.biliary.cbd = cbdMatch[1];
      matches.push(`Biliary: dilated CBD (${cbdMatch[1]} mm)`);
    } else {
      matches.push("Biliary: dilated CBD");
    }
  }
  if (t.includes("mild hydronephrosis right")) {
    next.kidneys.hydronephrosis = "Mild";
    matches.push("Kidney: mild right hydronephrosis");
  }
  if (t.includes("splenomegaly")) {
    if (spleenMatch?.[1]) {
      next.spleen.size = spleenMatch[1];
      matches.push(`Spleen: splenomegaly (${spleenMatch[1]} cm)`);
    } else {
      matches.push("Spleen: splenomegaly");
    }
  }
  if (t.includes("ascites")) {
    next.ascites.volume = "Mild";
    matches.push("Ascites: mild");
  }
  if (t.includes("renal stone") || t.includes("nephrolithiasis")) {
    next.kidneys.stones = "Right";
    matches.push("Kidneys: right renal stone");
  }
  if (liverMatch?.[1]) {
    next.liver.size = liverMatch[1];
    matches.push(`Liver size: ${liverMatch[1]} cm`);
  }
  if (rightKidneyMatch?.[1]) {
    next.kidneys.rightLength = rightKidneyMatch[1];
    matches.push(`Right kidney length: ${rightKidneyMatch[1]} cm`);
  }
  if (leftKidneyMatch?.[1]) {
    next.kidneys.leftLength = leftKidneyMatch[1];
    matches.push(`Left kidney length: ${leftKidneyMatch[1]} cm`);
  }
  if (spleenMatch?.[1] && !t.includes("splenomegaly")) {
    next.spleen.size = spleenMatch[1];
    matches.push(`Spleen size: ${spleenMatch[1]} cm`);
  }
  if (cbdMatch?.[1] && !t.includes("dilated cbd") && !t.includes("cbd dilated")) {
    next.biliary.cbd = cbdMatch[1];
    matches.push(`CBD: ${cbdMatch[1]} mm`);
  }

  return { data: next, matches };
}
