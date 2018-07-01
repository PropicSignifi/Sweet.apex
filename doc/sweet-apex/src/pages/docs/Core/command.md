---
title: "Command"
description: "Command"
layout: "guide"
icon: "flash"
weight: 4
---

###### {$page.description}

<article id="1">

## Command

The main entry of Sweet.apex is a node.js command line tool. And you run it like this:

```bash
node transpile.js <srcDir> <destDir>
```

</article>

<article id="2">

## Command Arguments

The `transpile.js` expects three optional arguments.

```bash
node transpile.js [srcDir] [destDir] [features]
```

| Argument Name | Description |
| ------------- | ----------- |
| srcDir | The source directory or the single file name, using './resources' by default |
| destDir | The destination directory, using './build' by default |
| features | The list of features enabled, separated by comma, using all features by default |

</article>

<article id="3">

## Command Options

You can specify command options.

| Option Name | Description |
| ----------- | ----------- |
| -v | Show debug information |
| --perf | Show performance information |
| -s | Silent mode, disabling all prints |
| -c | Clean mode, removing all cache |
| -i | Ignore errors, continuing even if a file fails |
| -h | Show command line help |
| -e | Empty the generated class comment |
| -j | Generate JavaScript instead of Apex classes, for development purpose only |

</article>
