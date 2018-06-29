---
title: "Log"
description: "Log"
layout: "guide"
icon: "code-file"
weight: 14
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates the logger object for the class.

</article>

<article id="2">

## Prerequisite

You need to include [Log.apex](https://github.com/Click-to-Cloud/Log.apex) if you want to enable this feature.

</article>

<article id="3">

## Sweet Apex Example

```javascript
@log
public class LogDemo {
    public static void main() {
        System.debug('Logging');
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class LogDemo {
    public static final Log logger = Log.getLogger(LogDemo.class);

    public static void main() {
        System.debug('Logging');
    }
}
```

</article>

<article id="5">

## Usage

`@log` can only be applied to top level classes, as static variables can only be declared
in top level classes.

</article>
