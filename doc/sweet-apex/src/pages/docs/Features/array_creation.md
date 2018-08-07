---
title: "Array Creation"
description: "Array Creation"
layout: "guide"
icon: "code-file"
weight: 4
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables simple creation of arrays/lists and maps.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class ArrayCreation {
    public static void run(Object o) {
    }

    public static void main() {
        Map<String, Object> m = new Map<String, Object>{ 'a': 2, };
        List<Object> l = new List<Object>{ 'a', };

        Map<String, Object> m1 = { 'a' => 2 };
        List<Object> l1 = { 'a' };

        Object m2 = { 'a' => 2 };
        Object l2 = { 'a' };

        Map<String, Object> m3 = { 'a' => { 'b' => 2 } };
        List<Object> l3 = { { 'a' } };

        run({ 'a' => 2 });
        run({ 'a' });
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ArrayCreation {
    public static void run(Object o) {
    }
    public static void main() {
        Map<String, Object> m = new Map<String, Object>{ 'a' => 2 };
        List<Object> l = new List<Object>{ 'a' };

        Map<String, Object> m1 = new Map<String, Object>{ 'a' => 2 };
        List<Object> l1 = new List<Object>{ 'a' };

        Object m2 = new Map<String, Object>{ 'a' => 2 };
        Object l2 = new List<Object>{ 'a' };

        Map<String, Object> m3 = new Map<String, Object>{ 'a' => new Map<String, Object>{ 'b' => 2 } };
        List<Object> l3 = new List<Object>{ new List<Object>{ 'a' } };
        run(new Map<String, Object>{ 'a' => 2 });
        run(new List<Object>{ 'a' });
    }
}
```

</article>

<article id="5">

## Usage

When enabled, this feature helps you to complete the array creation.

</article>
