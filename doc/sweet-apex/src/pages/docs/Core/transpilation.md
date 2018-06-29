---
title: "Transpilation"
description: "Transpilation"
layout: "guide"
icon: "flash"
weight: 2
---

###### {$page.description}

<article id="1">

## Transpilation

Transpilation is the process of compiling from one kind of source files to another kind.

The actual process is much more sophisticated than this line. And it's helpful for you to have
a basic understanding of what Sweet.apex is doing behind the scene.

</article>

<article id="2">

## Command

To run transpilation, simply type:

```bash
node transpile.js <srcDir> <destDir>
```

For details on this command, please check on the commands part.

</article>

<article id="3">

## Features

Sweet.apex includes a lot of features, and they are delivered in a form of plugins. For now,
you only need to get a basic idea of the features. To check more, see the features section.

</article>

<article id="4">

## Stages

There are several significant stages when you run this command.

- Scanning

The first step of the whole process is to scan all the files in both source directory and destination
directory, to generate the typing information of all the classes.

- Setting Up

The next step is to run the setup for each feature. This will be run only once for each feature during
one process.

- Transpiling

Then the most important step is to transpile the source Sweet Apex files. Each source file is processed by
all available features before the next source file gets started.

- Finalizing

After that is the finalizing step, which runs the finalization for each feature. This will also be run only once for each feature.

- Building

In this step, Sweet.apex will start build files into static resources and copy necessary files.

- Finishing

Clean up the process and finish it.

If you want to develop your own feature, please make sure that you have a deep understanding of the stages.

</article>

<article id="5">

## Transpilation Stage

Transpilation stage is actually the core of the whole process. It is further divided into four parts.

- Normalizing

Here the content of the source file is being cleaned up, and templates are being searched and replaced.

- Parsing

Then our Sweet Apex grammar comes and parses the content into AST(Abstract Syntax Tree) for further processing.

- Rebuilding

In this part, most of the features start their jobs to rebuild the AST nodes to whatever they want.

- Compiling

Finally the AST nodes are compiled to the final string representation.

</article>
