---
title: "Not Null"
description: "Not Null"
layout: "guide"
icon: "code-file"
weight: 16
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature guards that method parameters cannot be null.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class NotNullDemo {
    public static Integer add(
        @notNull Integer a,
        Integer b!
    ) {
        return a + b;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class NotNullDemo {
    public static Integer add(Integer a, Integer b) {
        Sweet.assertNotNull(a, '"a" in NotNullDemo.add(Integer, Integer) should not be null');
        Sweet.assertNotNull(b, '"b" in NotNullDemo.add(Integer, Integer) should not be null');

        return a + b;
    }
}
```

</article>

<article id="5">

## Usage

`@notNull` can only be used on method parameters.

Or you can append `!` after the parameter variable.

</article>
