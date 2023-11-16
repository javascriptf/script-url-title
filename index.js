const fs     = require('fs');
const os     = require('os');
const http   = require('http');
const https  = require('https');


/** Default options. */
const OPTIONS = {
  /** Input file path (with URLs). */
  input:  null,
  /** Output file path (to write titles of URLs). */
  output: null,
  /** Make URLs unique? */
  unique: false,
  /** Sort URLs? */
  sort:   false,
  /** Throttle requests (in milliseconds). */
  throttle: 1000,
  /** Show help message? */
  help:   false,
  /** Error message. */
  error:  null,
};




/**
 * Read text from a file.
 * @param {string} pth path to the file
 * @returns {string} file content
 */
function readFile(pth) {
  var txt = fs.readFileSync(pth, 'utf8');
  return txt.replace(/\r?\n/g, '\n');
}


/**
 * Write text to a file.
 * @param {string} pth path to the file
 * @param {string} txt text to write
 */
function writeFile(pth, txt) {
  var txt = txt.replace(/\r?\n/g, os.EOL);
  fs.writeFileSync(pth, txt);
}


/**
 * Fetch the given URL and return the response body as a string.
 * @param {string} url URL to fetch
 * @returns {Promise<string>} response body
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    var fres = (res) => {
      switch (res.statusCode) {
        default:
          reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
          res.resume();
          return;
        case 301:
        case 302:
          return fetchUrl(res.headers.location);
        case 200:
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', chunk => { rawData += chunk; });
          res.on('end', () => resolve(rawData));
          return;
      }
    };
    var req = url.startsWith('http:')? http.get(url, fres) : https.get(url, fres);
    req.on('error', err => reject(err));
    req.end();
  });
}


/**
 * Get the title of a page from given HTML string.
 * @param {string} html HTML string
 * @returns {string} title of the page
 */
function htmlTitle(html) {
  let m = html.match(/<title>([^<]*)<\/title>/);
  return m? m[1] : null;
}




/**
 * Fetch titles of URLs in a text file.
 * @param {string} fin input file path with URLs
 * @param {object} o options \{sort: boolean, throttle: number\}
 * @returns {Promise<string>} titles of URLs
 */
async function fetchUrlTitles(fin, o) {
  var txt   = readFile(fin);
  var lines = txt.split(/\r?\n/);
  // Get URLs from the input file.
  var urls  = [];
  for (var l of lines) {
    var l = l.trim();
    var l = l.replace(/\s*#.*/, '');
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
    if (o.output) console.error(`Fetching ${url} ...`);
    var html  = await fetchUrl(url);
    var title = htmlTitle(html);
    var out   = title? `- [${title}](${url})` : `- ${url}`;
    console.log(out);
    if (o.output) console.error();
    txt += out + '\n';
    // Relax for a while.
    await new Promise(resolve => setTimeout(resolve, o.throttle || 1000));
  }
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
  if (o.output) writeFile(o.output, out);
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
