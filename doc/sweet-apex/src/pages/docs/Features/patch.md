---
title: "Patch"
description: "Patch"
layout: "guide"
icon: "code-file"
weight: 36
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables patching methods to an existing type.

</article>

<article id="2">

## Prerequisite

None.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class PatchDemo {
    @patch(String)
    public static String prefix(String s, String prefix) {
        return prefix + s;
    }

    public static void main() {
        String result = 'abc'.prefix('_');
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class PatchDemo {
    public static String prefix(String s, String prefix) {
        return prefix + s;
    }
    public static void main() {
        String result = PatchDemo.prefix('abc', '_');
    }
}
```

</article>

<article id="5">

## Usage

The method annotated with `@patch` is a patching method.

Patching methods should be public/global static, and they should declare the type to patch on. Besides, the first parameter
should accept the instance of the patch class.

</article>
