const http  = require('http');
const https = require('https');
const fs        = require('extra-fs');
const {sleep}   = require('extra-sleep');
const puppeteer = require('puppeteer');


/** Environment variables. */
const E = process.env;
/** Default options. */
const OPTIONS = {
  /** Path to Web browser executable. */
  devtoolsPath: E.DEVTOOLS_PATH || `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
  /** Path to Web browser user data directory. */
  devtoolsDataDir: E.DEVTOOLS_DATA_DIR || `C:\\Users\\${E.USERNAME}\\AppData\\Local\\Google\\Chrome\\User Data`,
  /** Input file path (with URLs). */
  input:  null,
  /** Output file path (to write titles of URLs). */
  output: null,
  /** Make URLs unique? */
  unique: false,
  /** Sort URLs? */
  sort:   false,
  /** Throttle requests (in milliseconds). */
  throttle: 2000,
  /** Show help message? */
  help:   false,
  /** Error message. */
  error:  null,
};




/**
 * Fetch titles of URLs in a text file.
 * @param {string} fin input file path with URLs
 * @param {object} o options \{sort: boolean, throttle: number\}
 * @returns {Promise<string>} titles of URLs
 */
async function fetchUrlTitles(fin, o) {
  var executablePath = o.devtoolsPath    || OPTIONS.devtoolsPath;
  var userDataDir    = o.devtoolsDataDir || OPTIONS.devtoolsDataDir;
  var browser = await puppeteer.launch({executablePath, userDataDir, defaultViewport: null, headless: 'new'});
  var txt   = fs.readFileTextSync(fin);
  var lines = txt.split(/\r?\n/);
  // Get URLs from the input file.
  var urls  = [];
  for (var l of lines) {
    var l = l.trim();
    var l = l.replace(/^-\s*/, '');
    var l = l.replace(/^\[.*?\]\((.*?)\)$/, '$1');
    if (l) urls.push(l);
  }
  // Make URLs unique.
  if (o.unique) urls = [...new Set(urls)];
  if (o.sort)   urls.sort();
  // Fetch titles of URLs.
  var txt = '';
  for (var url of urls) {
    // Fetch title of URL.
    console.error(`Fetching ${url} ...`);
    var page  = null;
    var title = null;
    if ((url.startsWith('http://') || url.startsWith('https://')) && !url.endsWith('.pdf')) {
      var page  = await browser.newPage();
      await page.goto(url, {waitUntil: 'domcontentloaded'});
      var title = await page.title();
    }
    var out   = title? `- [${title}](${url})` : `- ${url}`;
    if (page) await page.close();
    // Output title of URL.
    console.log(out);
    console.error();
    txt += out + '\n';
    // Relax for a while.
    await sleep(o.throttle || OPTIONS.throttle);
  }
  await browser.close();
  return txt;
}




/**
 * Fetch titles of URLs in a text file, and write to output file, if specified.
 * @param {string[]} argv command line arguments
 * @returns {Promise<void>}
 */
async function main(argv) {
  // Parse command line options.
  var o = {};
  for (var i=2; i<argv.length;)
    i = parseOption$(o, argv[i], argv, i);
  if (!o.input)  o.error = 'No input file (with URLs) specified!';
  if (o.error) { console.error(`ERROR: ${o.error}!`); showHelp(); return; }
  if (o.help)  { showHelp(); return; }
  // Fetch titles of URLs.
  var out = await fetchUrlTitles(o.input, o);
  if (o.output) fs.writeFileTextSync(o.output, out);
}


/**
 * Parse an option from the arguments array.
 * @param {object} o options object (updated)
 * @param {string} k option key
 * @param {string[]} a arguments array
 * @param {number} i index into arguments array
 * @returns {number} new index into arguments array
 */
function parseOption$(o, k, a, i) {
  if (k==='-o' || k==='--output') o.output = a[++i];
  else if (k==='-u' || k==='--unique') o.unique = true;
  else if (k==='-s' || k==='--sort')   o.sort   = true;
  else if (k==='-t' || k==='--throttle') o.throttle = parseFloat(a[++i]);
  else if (k==='-h' || k==='--help')     o.help = true;
  else if (k.startsWith('-')) o.error = `Unknown option: ${k}`;
  else o.input = k;
  return ++i;
}


/**
 * Display help message.
 */
function showHelp() {
  console.log(`Usage: script-url-title [options] <input-file>`);
  console.log(`Options:`);
  console.log(`  <input-file>                Input file with URLs`);
  console.log(`  -o, --output <output-file>  Write output to file`);
  console.log(`  -u, --unique                Make URLs unique`);
  console.log(`  -s, --sort                  Sort URLs`);
  console.log(`  -t, --throttle <ms>         Throttle requests`);
  console.log(`  -h, --help                  Show this help message`);
}
main(process.argv);
