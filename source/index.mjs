import * as FS from "node:fs/promises";
import * as FSE from "fs-extra";
import Puppeteer from "puppeteer";
import Yaml from "yaml";
import Liquid from "liquidjs";
import Express from "express";
import { DateTime } from "luxon";

// Constants
const PORT = 3000;

// Read input invoice and add default values
const defaultsData = await FS.readFile("./source/defaults.yaml", "utf8");
const invoiceData = await FS.readFile("./invoice.yaml", "utf8");
const defaultsConfig = Yaml.parse(defaultsData);
const invoiceConfig = Yaml.parse(invoiceData);
const invoice = {
  faktura: { ...defaultsConfig.faktura, ...invoiceConfig.faktura },
  rader: Object.values({ ...defaultsConfig.rader, ...invoiceConfig.rader }),
  fluff: { ...defaultsConfig.fluff, ...invoiceConfig.fluff },
  berakning: { ...defaultsConfig.berakning, ...invoiceConfig.berakning },
  avsandare: { ...defaultsConfig.avsandare, ...invoiceConfig.avsandare },
};

// Create a number formatter.
const { format } = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: invoice.berakning.valuta,
});

// Add invoice calculations
let invoiceSum = 0;
for (const row of invoice.rader) {
  const sum = row.antal * row.kostnad;
  invoiceSum += sum;
  row.summa = format(sum);
  row.kostnad = format(row.kostnad);
}

const moms = invoiceSum * invoice.berakning.momssats;
const expiration = DateTime.fromFormat(
  invoice.faktura.faktureringsdatum,
  "yyyy-MM-dd"
).plus({ days: invoice.faktura.dagarattbetala });
const kalkyl = {
  drojesmalsranta: `${invoice.berakning.drojesmalsranta * 100}%`,
  momssats: `${invoice.berakning.momssats * 100}%`,
  summa: format(invoiceSum),
  moms: format(moms),
  slutsumma: format(invoiceSum + moms),
  forfallodatum: expiration.toFormat("yyyy-MM-dd"),
};

// Output the invoice as html to the render folder
const engine = new Liquid.Liquid();
const tpl = await engine.parseFile("./source/invoice.liquid");

const output = await engine.render(tpl, { ...invoice, kalkyl });
await FS.writeFile("./render/index.html", output);

// Output the invoice as yaml to the history folder
FSE.ensureDir("history");
let i = 1;
while (i < 100) {
  const path = `./history/${invoice.faktura.nr}-${i}.yaml`;
  console.log(path);
  if (!(await FSE.exists(path))) {
    await FS.writeFile(path, Yaml.stringify(invoice));
    break;
  }
  i++;
}

// Serve the render result
const server = new Express();
server.use(Express.static("render"));
const listener = server.listen(PORT);

// Use Puppeteer to save the rendering as a pdf file
const browser = await Puppeteer.launch({
  args: ["--no-sandbox"],
  headless: "new",
});
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/index.html`, {
  waitUntil: "networkidle0",
});
await page.pdf({
  format: "A4",
  printBackground: true,
  path: `Faktura ${invoice.faktura.nr}.pdf`,
});
await browser.close();
listener.close();
