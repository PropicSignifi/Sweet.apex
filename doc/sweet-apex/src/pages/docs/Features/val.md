---
title: "Val"
description: "Val"
layout: "guide"
icon: "code-file"
weight: 28
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature infers variable types according to the context and make it final.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class ValDemo {
    public static void main() {
        val t = 'String';
        val size = t.length();
        val str = t.toString();

        val acc = new Account();

        String [] slist = { 'a' };
        val ref = slist;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ValDemo {
    public static void main() {
        final String t = 'String';
        final Integer size = t.length();
        final String str = t.toString();

        final Account acc = new Account();

        List<String> slist = { 'a' };
        final List<String> ref = slist;
    }
}
```

</article>

<article id="5">

## Usage

Refer to feature `var` for more details.

</article>
