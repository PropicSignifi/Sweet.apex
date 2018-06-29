---
title: "Config"
description: "Config"
layout: "guide"
icon: "flash"
weight: 5
---

###### {$page.description}

<article id="1">

## Configuration

The configuration in Sweet.apex exists in `config.json`.

You can also specify some config items through command line options, which take a higher priority than configuration.

</article>

<article id="2">

## Configuration Items

| Config Item | Description |
| apiVersion | The api version of the generated Apex classes |
| isDebugEnabled | Whether debug is enabled, same as '-v' option |
| isPerfEnabled | Whether performance logging is enabled, same as '--perf' option |
| generateDoc | Whether to generate apexdoc, 'off' turns it off, 'sync' does the synchronous generating and 'async' does the asynchronous |
| srcDir | The source directory |
| destDir | The destination directory |
| docDir | Where the apexdoc is generated |
| fileSrcDir | The source directory of the files |
| fileDestDir | The destination directory of the files, compiled to static resources |
| templateDir | The directory where the templates reside |
| silent | Whether silent mode is enabled, same as '-s' option |
| clean | Whether to clean all cache, same as '-c' option |
| ignoreErrors | Wheter to continue in case of errors, same as '-i' option |
| scanExcludePatterns | The pattern of files to be excluded in the scanning stage |
| generatedClassComment | Set the generated class comment |
| features | The list of features enabled, separated by comma |

</article>
