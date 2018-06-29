---
title: "Default Value"
description: "Default Value"
layout: "guide"
icon: "code-file"
weight: 7
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature sets the default value for method parameters.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class DefaultValueDemo {
    public static Integer init() {
        return 0;
    }

    public static Integer add(
        @defaultValue(init()) Integer a,
        @defaultValue(init()) Integer b
    ) {
        return a + b;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class DefaultValueDemo {
    public static Integer init() {
        return 0;
    }
    public static Integer add(Integer a, Integer b) {
        a = (a == null) ? init() : a;
        b = (b == null) ? init() : b;

        return a + b;
    }
}
```

</article>

<article id="5">

## Usage

`@defaultValue` can only be applied to method parameters.

</article>
