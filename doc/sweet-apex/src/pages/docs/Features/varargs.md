---
title: "Varargs"
description: "Varargs"
layout: "guide"
icon: "code-file"
weight: 35
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables varargs parameters in methods.

</article>

<article id="2">

## Prerequisite

None.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class VarargsDemo {
    private static void run(Integer num, String ...args) {
    }

    public static void main() {
        run(10, 'a', 'b');
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class VarargsDemo {
    private static void run(Integer num, List<String> args) {
    }
    public static void main() {
        run(10, new List<String>{ 'a', 'b' });
    }
}
```

</article>

<article id="5">

## Usage

The var-args parameter should be the last parameter in the method and the method should contain at most one
var-args parameter. Besides, overloading methods with var-args may cause ambiguity.

</article>
