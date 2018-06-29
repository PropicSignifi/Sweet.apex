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
public class ArrayCreationDemo {
    public List<Object> mList2 = { 1, 2, 3 };

    private Map<String, Object> mMap2 = { 'name' => 'value' };
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ArrayCreationDemo {
    public List<Object> mList2 = new List<Object>{ 1, 2, 3 };
    private Map<String, Object> mMap2 = new Map<String, Object>{ 'name' => 'value' };
}
```

</article>

<article id="5">

## Usage

When enabled, this feature helps you to complete the array creation.

</article>
