---
title: "Cast"
description: "Cast"
layout: "guide"
icon: "code-file"
weight: 6
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature casts between different collections of lists, sets and maps.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class CastDemo {
    public static void main() {
        List<String> list1 = (List<Object> => List<String>)new List<Object>();

        Map<String, String> map1 = (Map<Object, Object> => Map<String, String>)new Map<Object, Object>();
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class CastDemo {
    public static void main() {
        List<String> list1 = cast_Utils.cast_List_Object_to_List_String(new List<Object>());

        Map<String, String> map1 = cast_Utils.cast_Map_Object_Object_to_Map_String_String(new Map<Object, Object>());
    }
}

public class cast_Utils {
    
    public static List<String> cast_List_Object_to_List_String(Object other) {
        List<Object> target = (List<Object>)other;
        List<String> ret = new List<String>();
        for(Object i : target) {
            String r = (String)i;
            ret.add(r);
        }

        return ret;
    }

    public static Map<String, String> cast_Map_Object_Object_to_Map_String_String(Object other) {
        Map<Object, Object> target = (Map<Object, Object>)other;
        Map<String, String> ret = new Map<String, String>();
        for(Object key : target.keySet()) {
            Object value = target.get(key);
            String k = (String)key;
            String v = (String)value;
            ret.put(k, v);
        }

        return ret;
    }
}
```

</article>

<article id="5">

## Usage

An extra `cast_Utils.cls` will be generated to contain all the casting methods should it be used by other files.

Nested casting like `(List<List<Object>> => List<List<String>>)` is also supported.

</article>
