---
title: "Tagged String"
description: "Tagged String"
layout: "guide"
icon: "code-file"
weight: 24
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts tagged strings into method calls.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class TaggedStringDemo {
    @tag
    public static String n(List<String> items, List<Object> values) {
        return 'prefix__' + String.join(items, '');
    }

    public static void main() {
        String s = n`Name`;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class TaggedStringDemo {
    public static String n(List<String> items, List<Object> values) {
        return 'prefix__' + String.join(items, '');
    }
    public static void main() {
        String s = (String)TaggedStringDemo.n(new List<String>{ 'Name' }, new List<Object>{  });
    }
}
```

</article>

<article id="5">

## Usage

Methods with `@tag` annotation should be public/global static and accept parameters of `List<String>` and `List<Object>`.

</article>
