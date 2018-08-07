---
title: "Nullable"
description: "Nullable"
layout: "guide"
icon: "code-file"
weight: 26
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature adds support for nullable variables.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class NullableDemo {
    public static void main() {
        String s1 = 'abc';
        Integer i1 = s1.length();

        String s2 = null;
        Integer i2 = s2?.length();

        Integer i3 = ('a' + 'b')?.length();
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class NullableDemo {
    public static void main() {
        String s1 = 'abc';
        Integer i1 = s1.length();

        String s2 = null;
        Integer i2 = (s2 != null ? s2.length() : null);

        Integer i3 = (('a' + 'b') != null ? ('a' + 'b').length() : null);
    }
}
```

</article>

<article id="5">

## Usage

Use nullable variables in method invocations or field accesses.

Try not using nest nullable variables as this will increase complexity.

</article>
