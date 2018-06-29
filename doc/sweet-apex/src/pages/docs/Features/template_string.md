---
title: "Template String"
description: "Template String"
layout: "guide"
icon: "code-file"
weight: 22
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts a template string into concatenated strings.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class TemplateStringDemo {
    public static String a = 'a';
    public static String b = 'b';
    public static String c = `${a}-${b}`;
    public static String text = `
        This is a free style text.
        You can add ${c} here.
        Try it.
        `;
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class TemplateStringDemo {
    public static String a = 'a';
    public static String b = 'b';
    public static String c = '' + a + '-' + b + '';
    public static String text = '\n        This is a free style text.\n        You can add ' + c + ' here.\n        Try it.\n        ';
}
```

</article>

<article id="5">

## Usage

</article>
