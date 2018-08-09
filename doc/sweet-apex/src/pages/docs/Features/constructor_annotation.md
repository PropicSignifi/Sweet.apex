---
title: "Constructor"
description: "Constructor"
layout: "guide"
icon: "code-file"
weight: 30
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates constructors.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
@constructor
public class ConstructorDemo {
    private String name;
    private Integer age;
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ConstructorDemo {
    private String name;
    private Integer age;

    public ConstructorDemo() {
    }

    public ConstructorDemo(String name, Integer age) {
        this.name = name;
        this.age = age;
    }
}
```

</article>

<article id="5">

## Usage

`@constructor` only includes non-static fields.

Some variations are:

| Example | Description |
| ------- | ----------- |
| @constructor | Generate all non-static fields |
| @constructor(&amp;#123; 'name', 'id' &amp;#125;) | Generate the given fields |
| @constructor(fields=&amp;#123; 'name', 'id' &amp;#125;) | Generate the given fields |

</article>
