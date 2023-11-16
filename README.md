Get title of a URL from its HTML.

![](https://i.imgur.com/VaudKyG.jpg)

<br>

```bash
$ node index.js urls.txt -o titles.md
# Generated URL titles saved to titles.md

$ export DEVTOOLS_PATH="/path/to/chrome-linux/chrome"
$ export DEVTOOLS_DATA_DIR="/path/to/chrome-linux/data-dir"
$ node index.js urls.txt -o titles.md --unique
# Generated URL titles saved to titles.md, with unique URLs

$ node index.js urls.txt -o titles.md --unique --sort
# Generated URL titles saved to titles.md, with unique and sorted URLs
```

<br>
<br>


## Usage

```bash
$ script-url-title [options] <input-file>

# Options:
#   <input file>                Input file with URLs.
#   -o, --output <output file>  Write output to file.
#   -u, --unique                Make URLs unique.
#   -s, --sort                  Sort URLs.
#   -t, --throttle <ms>         Throttle requests.
#   -h, --help                  Show this help message.

# Environment Variables:
#   $DEVTOOLS_PATH                   Path to Chrome DevTools.
#   $DEVTOOLS_DATA_DIR               Path to Chrome DevTools data directory.
```

<br>
<br>


## References

- [Configuration interface | Puppeteer](https://pptr.dev/api/puppeteer.configuration)
- [Puppeteer wait until page is completely loaded](https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded)

<br>
<br>


[![](https://img.youtube.com/vi/yqO7wVBTuLw/maxresdefault.jpg)](https://www.youtube.com/watch?v=yqO7wVBTuLw)<br>
[![ORG](https://img.shields.io/badge/org-javascriptf-green?logo=Org)](https://javascriptf.github.io)
[![DOI](https://zenodo.org/badge/719474773.svg)](https://zenodo.org/doi/10.5281/zenodo.10142722)
