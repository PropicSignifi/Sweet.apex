---
title: "Destructure"
description: "Destructure"
layout: "guide"
icon: "code-file"
weight: 32
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables destructuring from list/map/sobject.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class DestructureDemo {
    public static void main() {
        List<String> names = new List<String>{ 'Wilson', 'Adam' };
        String { p1, p2 } = names;

        Map<String, Object> infos = new Map<String, Object>{ 'a' => 1, 'b' => '2' };
        { a: Integer count, b: String id } = infos;

        Account ac = new Account(Name='test acc');
        { Name: String name } = ac;

        List<Integer> numbers = new List<Integer>{ 1, 2, 3, 4, 5 };
        Integer { first, _ } = numbers;
        Integer { _, last } = numbers;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class DestructureDemo {
    public static void main() {
        List<String> names = new List<String>{ 'Wilson', 'Adam' };
        List<Object> destructure_1 = (List<Object>)names;
        String p1 = (String)destructure_1.get(0);
        String p2 = (String)destructure_1.get(1);

        Map<String, Object> infos = new Map<String, Object>{ 'a' => 1, 'b' => '2' };
        Map<String, Object> destructure_6 = (Map<String, Object>)infos;
        Integer count = (Integer)destructure_6.get('a');
        String id = (String)destructure_6.get('b');

        Account ac = new Account(Name = 'test acc');
        SObject destructure_11 = (SObject)ac;
        String name = (String)destructure_11.get('Name');

        List<Integer> numbers = new List<Integer>{ 1, 2, 3, 4, 5 };
        List<Object> destructure_15 = (List<Object>)numbers;
        Integer first = (Integer)destructure_15.get(0);
        List<Object> destructure_17 = (List<Object>)numbers;
        Integer last = (Integer)destructure_17.get(destructure_17.size() - 1);
    }
}
```

</article>

<article id="5">

## Usage

Destructuring is built on the base of type inference. Should the type inference go wrong, the generated
destructuring code might fail.

You can insert one `_` as a placeholder when destructuring a list.

</article>
