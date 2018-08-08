---
title: "Var"
description: "Var"
layout: "guide"
icon: "code-file"
weight: 27
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature infers variable types according to the context.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class VarDemo {
    public static void main() {
        var t = 'String';
        var size = t.length();
        var str = t.toString();

        var acc = new Account();

        String [] slist = { 'a' };
        var ref = slist;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class VarDemo {
    public static void main() {
        String t = 'String';
        Integer size = t.length();
        String str = t.toString();

        Account acc = new Account();

        List<String> slist = { 'a' };
        List<String> ref = slist;
    }
}
```

</article>

<article id="5">

## Usage

This feature uses the typing information to infer the variable type.

Currently, classes under namespace `System` have typings imported by default.

Typing information in source directory will be scanned by default.

Configure `scanDestDir` to scan the destination directory to collect the typing information.

If you want to add any extra directory to scan, add it in `classpath`, separated by `:` if there are multiple values.

Exceptions will be thrown if it fails to infer the correct type.

</article>
