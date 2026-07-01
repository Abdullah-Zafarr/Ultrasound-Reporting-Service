import {
  generateReport,
  generateThyroidReport,
  validateExamWorksheet,
} from "../src/lib/report-engine";
import { defaultThyroid, type ThyroidData, type WorksheetData } from "../src/lib/sonoflow-types";

function maybe(value: string): string {
  return Math.random() < 0.2 ? "" : value;
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomNum(min: number, max: number, decimals = 1): string {
  const factor = Math.pow(10, decimals);
  const value = Math.round((min + Math.random() * (max - min)) * factor) / factor;
  return String(value);
}

function makeAbdomen(): WorksheetData {
  return {
    liver: {
      size: maybe(randomNum(10, 22, 1)),
      echotexture: pick(["Homogeneous", "Diffusely echogenic (fatty infiltration)", "Coarse"] as const),
      surface: pick(["Smooth", "Nodular"] as const),
      focalLesions: pick(["None", "Cyst", "Solid Mass"] as const),
    },
    gallbladder: {
      wallThickness: maybe(randomNum(1, 8, 1)),
      content: pick(["Clear", "Sludge", "Gallstones"] as const),
      murphysSign: pick(["Negative", "Positive"] as const),
    },
    biliary: {
      cbd: maybe(randomNum(2, 14, 1)),
      intrahepatic: pick(["Normal", "Dilated"] as const),
    },
    kidneys: {
      rightLength: maybe(randomNum(7, 15, 1)),
      leftLength: maybe(randomNum(7, 15, 1)),
      corticalEchogenicity: pick(["Normal", "Increased"] as const),
      hydronephrosis: pick(["None", "Mild", "Moderate", "Severe"] as const),
      stones: pick(["None", "Right", "Left", "Bilateral"] as const),
    },
    spleen: {
      size: maybe(randomNum(8, 20, 1)),
      echotexture: pick(["Normal", "Heterogeneous"] as const),
    },
    pancreas: {
      visualized: pick(["Fully visualized", "Partially visualized", "Obscured by bowel gas"] as const),
      echotexture: pick(["Normal", "Hypoechoic", "Hyperechoic", "Heterogeneous"] as const),
      ductMm: maybe(randomNum(1, 8, 1)),
    },
    vessels: {
      portalVeinMm: maybe(randomNum(6, 18, 1)),
      aortaState: pick(["Normal", "Ectatic", "Aneurysmal"] as const),
      aortaMaxApCm: maybe(randomNum(1.3, 5.0, 1)),
      ivcState: pick(["Normal", "Dilated"] as const),
    },
    ascites: {
      volume: pick(["None", "Mild", "Moderate", "Large"] as const),
    },
  };
}

function makeThyroid(): ThyroidData {
  const thyroid: ThyroidData = {
    ...defaultThyroid,
    rightLobe: {
      length: maybe(randomNum(2.0, 7.0, 1)),
      width: maybe(randomNum(1.0, 3.5, 1)),
      depth: maybe(randomNum(1.0, 3.5, 1)),
    },
    leftLobe: {
      length: maybe(randomNum(2.0, 7.0, 1)),
      width: maybe(randomNum(1.0, 3.5, 1)),
      depth: maybe(randomNum(1.0, 3.5, 1)),
    },
    isthmus: maybe(randomNum(1.0, 8.0, 1)),
    parenchyma: pick(["Homogeneous", "Mildly heterogeneous", "Markedly heterogeneous"] as const),
    vascularity: pick(["Normal", "Increased"] as const),
    cervicalNodes: pick(["None suspicious", "Suspicious right", "Suspicious left", "Suspicious bilateral"] as const),
    nodules: [],
  };

  const nCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < nCount; i++) {
    thyroid.nodules.push({
      id: `n-${i}`,
      location: pick(["Right", "Left", "Isthmus"] as const),
      size: randomNum(0.2, 4.2, 1),
      composition: pick(["Solid", "Cystic", "Mixed"] as const),
      echogenicity: pick(["Anechoic", "Hyperechoic/Isoechoic", "Hypoechoic", "Very hypoechoic"] as const),
      shape: pick(["Wider-than-tall", "Taller-than-wide"] as const),
      margin: pick(["Smooth", "Ill-defined", "Lobulated/Irregular", "Extrathyroidal extension"] as const),
      echogenicFoci: pick([
        "None",
        "Comet-tail artifacts",
        "Macrocalcifications",
        "Peripheral rim calcifications",
        "Punctate echogenic foci",
      ] as const),
      tirads: pick(["TR1", "TR2", "TR3", "TR4", "TR5"] as const),
    });
  }
  return thyroid;
}

function includesAny(lines: string[], token: string): boolean {
  return lines.some((line) => line.includes(token));
}

function runAbdomenAssertions(data: WorksheetData): string[] {
  const report = generateReport(data);
  const failures: string[] = [];
  const cbd = Number(data.biliary.cbd);
  if (data.biliary.cbd && Number.isFinite(cbd) && cbd > 6 && !includesAny(report.impression, "Common bile duct dilation")) {
    failures.push(`CBD>6 missing impression (cbd=${data.biliary.cbd})`);
  }
  const wall = Number(data.gallbladder.wallThickness);
  if (
    data.gallbladder.wallThickness &&
    Number.isFinite(wall) &&
    wall > 3 &&
    !includesAny(report.impression, "Gallbladder wall thickening")
  ) {
    failures.push(`GB wall >3 missing impression (wall=${data.gallbladder.wallThickness})`);
  }
  if (data.ascites.volume !== "None" && !includesAny(report.impression, "ascites")) {
    failures.push(`Ascites missing impression (${data.ascites.volume})`);
  }
  if (data.kidneys.hydronephrosis !== "None" && !includesAny(report.impression, "hydronephrosis")) {
    failures.push(`Hydronephrosis missing impression (${data.kidneys.hydronephrosis})`);
  }
  if (data.kidneys.stones !== "None" && !includesAny(report.impression, "nephrolithiasis")) {
    failures.push(`Nephrolithiasis missing impression (${data.kidneys.stones})`);
  }
  if (data.liver.surface === "Nodular" && !includesAny(report.impression, "Nodular liver contour")) {
    failures.push("Nodular liver contour missing impression");
  }
  return failures;
}

function runThyroidAssertions(data: ThyroidData): string[] {
  const report = generateThyroidReport(data);
  const failures: string[] = [];

  data.nodules.forEach((nodule, index) => {
    const size = Number(nodule.size);
    const rec = (report.recommendations ?? []).find(
      (line) =>
        line.includes(`TI-RADS ${nodule.tirads}`) &&
        line.includes(`, ${nodule.size || "unspecified"} cm):`) &&
        line.includes(`Nodule (${nodule.location},`),
    );
    if (!rec) {
      failures.push(`Missing recommendation for nodule ${index + 1}`);
      return;
    }
    if (nodule.tirads === "TR4" && Number.isFinite(size) && size >= 1.5 && !rec.includes("Recommend FNA")) {
      failures.push(`TR4 >=1.5 should recommend FNA (size=${nodule.size})`);
    }
    if (nodule.tirads === "TR5" && Number.isFinite(size) && size >= 1.0 && !rec.includes("Recommend FNA")) {
      failures.push(`TR5 >=1.0 should recommend FNA (size=${nodule.size})`);
    }
    if (nodule.tirads === "TR3" && Number.isFinite(size) && size >= 2.5 && !rec.includes("Recommend FNA")) {
      failures.push(`TR3 >=2.5 should recommend FNA (size=${nodule.size})`);
    }
  });
  return failures;
}

function main() {
  const abdomenRuns = 2500;
  const thyroidRuns = 2500;
  const failures: string[] = [];

  for (let i = 0; i < abdomenRuns; i++) {
    const sample = makeAbdomen();
    failures.push(...runAbdomenAssertions(sample).map((f) => `ABD#${i + 1}: ${f}`));
    failures.push(
      ...validateExamWorksheet("Abdomen", sample)
        .filter((issue) => issue.level === "error")
        .map((issue) => `ABD#${i + 1} validation error: ${issue.message}`),
    );
  }
  for (let i = 0; i < thyroidRuns; i++) {
    const sample = makeThyroid();
    failures.push(...runThyroidAssertions(sample).map((f) => `THY#${i + 1}: ${f}`));
    failures.push(
      ...validateExamWorksheet("Thyroid", sample)
        .filter((issue) => issue.level === "error")
        .map((issue) => `THY#${i + 1} validation error: ${issue.message}`),
    );
  }

  console.log(`Abdomen randomized cases: ${abdomenRuns}`);
  console.log(`Thyroid randomized cases: ${thyroidRuns}`);
  console.log(`Total failures: ${failures.length}`);
  if (failures.length > 0) {
    console.log("Sample failures:");
    failures.slice(0, 25).forEach((f) => console.log(`- ${f}`));
    process.exit(1);
  }
  console.log("All randomized rule-consistency checks passed.");
}

main();
