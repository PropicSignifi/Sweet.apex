---
title: "Mod"
description: "Mod"
layout: "guide"
icon: "code-file"
weight: 15
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts `%` to `Math.mod`.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class ModDemo {
    public static void test() {
        System.debug(1 % 5);
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ModDemo {
    public static void test() {
        System.debug(Math.mod(1, 5));
    }
}
```

</article>

<article id="5">

## Usage

</article>
