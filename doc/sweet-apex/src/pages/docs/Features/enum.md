---
title: "Enum"
description: "Enum"
layout: "guide"
icon: "code-file"
weight: 8
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates a full-fledged enum class.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public enum EnumDemo {
    One('1'),
    Two('2'),
    Three('3');

    private String id;

    private EnumDemo(String id) {
        this.id = id;
    }

    public String getId() {
        return this.id;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class EnumDemo extends Sweet.BaseEnum {
    public static final EnumDemo One = (EnumDemo)new EnumDemo('1').setName('One').setOrdinal(0);
    public static final EnumDemo Two = (EnumDemo)new EnumDemo('2').setName('Two').setOrdinal(1);
    public static final EnumDemo Three = (EnumDemo)new EnumDemo('3').setName('Three').setOrdinal(2);

    private static final Map<String, EnumDemo> instances = new Map<String, EnumDemo>{ 'One' => One, 'Two' => Two, 'Three' => Three };

    public static List<EnumDemo> values() {
        return instances.values();
    }

    public static EnumDemo valueOf(String name) {
        return instances.get(name);
    }

    private String id;
    private EnumDemo(String id) {
        this.id = id;
    }
    public String getId() {
        return this.id;
    }
}
```

</article>

<article id="5">

## Usage

Generated enums are all subclasses of `Sweet.BaseEnum`, and they share the same API.

| Method Name | Description |
| ----------- | ----------- |
| toString() | Get the name of the enum |
| ordinal() | Get the ordinal of the enum |
| static BaseEnum valueOf(String) | Get the enum by name |
| static List&lt;BaseEnum&gt; values() | Get all enum values |

</article>
