---
title: "Operator"
description: "Operator"
layout: "guide"
icon: "code-file"
weight: 17
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts a static method to an operator.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class OperatorDemo {
    @operator
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    public static void main() {
        Object a = 1;
        Object b = 2;
        System.debug(a add b);
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class OperatorDemo {
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }
    public static void main() {
        Object a = 1;
        Object b = 2;
        System.debug((Integer)OperatorDemo.add((Integer)a, (Integer)b));
    }
}
```

</article>

<article id="5">

## Usage

`@operator` can only be used on public/global static methods with two parameters and one return value.

Some variations are:

| Example | Description |
| ------- | ----------- |
| @operator | Convert the method to an operator |
| @operator('name') | Convert the method to an operator with the given name |
| @operator(name='name') | Convert the method to an operator with the given name |

</article>
