---
title: "Map Access"
description: "Map Access"
layout: "guide"
icon: "code-file"
weight: 29
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature adds array access support to maps.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class MapAccess {
    public static void main() {
        Map<String, Integer> count = new Map<String, Integer>{ 'a' => 2 };
        Integer i = count['a'];
        ++count['a'];
        count['a']++;
        count['a'] += 2;

        List<Integer> nums = new List<Integer>{ 2 };
        Integer j = nums[0];
        ++nums[0];
        nums[0]++;
        nums[0] += 2;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class MapAccess {
    public static void main() {
        Map<String, Integer> count = new Map<String, Integer>{ 'a' => 2 };
        Integer i = count.get('a');
        count.put('a', count.get('a') + 1);
        count.put('a', count.get('a') + 1);
        count.put('a', count.get('a') + 2);
        List < Integer > nums = new List<Integer>{ 2 };
        Integer j = nums[0];
        ++nums[0];
        nums[0]++;
        nums[0] += 2;
    }
}
```

</article>

<article id="5">

## Usage

Array access for maps support assignment expressions, postfix expressions, and prefix expressions.

Postfix and prefix expressions of map access cannot be used in assignments.

</article>
