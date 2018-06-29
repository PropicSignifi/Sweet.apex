---
title: "Aspect"
description: "Aspect"
layout: "guide"
icon: "code-file"
weight: 5
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature applies aspects onto methods.

Aspects represent cross-cutting concerns like logging, validation and so on. Using AOP(Aspect Oriented Programming),
our code will look clean and the core business logic code is more condensed.

</article>

<article id="2">

## Prerequisite

You need to have some basic understanding of Aspect Oriented Programming.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class AspectDemo {
    @afterMethod('AspectDemo.version')
    public static Integer afterVersion(Object target, List<Object> args, Object result) {
        return (Integer)result + 1;
    }

    public static Integer version(Integer base) {
        return base + 1;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class AspectDemo {
    public static Integer afterVersion(Object target, List<Object> args, Object result) {
        return (Integer)result + 1;
    }
    public static Integer version(Integer base) {
        Integer ret = aspect_version(base);
        ret = (Integer)AspectDemo.afterVersion(AspectDemo.class, new List<Object>{ base }, ret);
        return ret;
    }
    private static Integer aspect_version(Integer base) {
        return base + 1;
    }
}
```

</article>

<article id="5">

## Usage

This feature includes two annotations, `@beforeMethod` and `@afterMethod`. They can only be applied to
public/global static methods that accept the following arguments.

- `@beforeMethod`

Method name is not important but it should be expecting `(Object, List<Object>)`.

The first argument will be the target object invoking this method, or the target class if it is a static method.

The second argument will be the list of arguments passed to the target method.

- `@afterMethod`

Method name is not important but it should be expecting `(Object, List<Object>, Object)`.

The first argument will be the target object invoking this method, or the target class if it is a static method.

The second argument will be the list of arguments passed to the target method.

The third argument will be the result of the target method.

An aspect here is any method marked with the annotation `@beforeMethod` or `@afterMethod`. This feature will scan
all the source files to find all the aspects before trying to apply them to the target methods. So you can make any method
to be an aspect and expect it to be applied to other source files.

</article>
