---
title: "File"
description: "File"
layout: "guide"
icon: "code-file"
weight: 9
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts files to static resources.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class FileDemo {
    public static void main() {
        @file(name='beans')
        String content = null;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class FileDemo {
    public static void main() {
        String content = Sweet.readFile('beans');
    }
}
```

</article>

<article id="5">

## Usage

The source directories and destination directories of the files are controlled by `fileSrcDir` and `fileDestDir` in the config.

When you need to use a file, you can create one in the file source directory. Sweet.apex will compile it to a static resource.

You need to deploy the static resource to make the code work.

</article>
