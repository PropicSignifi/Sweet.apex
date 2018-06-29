---
title: "Optional"
description: "Optional"
layout: "guide"
icon: "code-file"
weight: 18
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates a method with optional parameters.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class OptionalDemo {
    public static Integer add(Integer a, @optional Integer b, @optional Integer c) {
        b = b == null ? 0 : b;
        c = c == null ? 0 : c;

        return a + b + c;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class OptionalDemo {
    public static Integer add(Integer a, Integer b, Integer c) {
        b = b == null ? 0 : b;
        c = c == null ? 0 : c;

        return a + b + c;
    }

    public static Integer add(Integer a, Integer b) {
        return add(a, b, null);
    }

    public static Integer add(Integer a) {
        return add(a, null);
    }
}
```

</article>

<article id="5">

## Usage

`@optional` can only be used as the rear parameters in a method.

</article>
