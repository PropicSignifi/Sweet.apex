---
title: "Identity"
description: "Identity"
layout: "guide"
icon: "code-file"
weight: 11
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates `equals` and `hashCode` methods for the class.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
@identity
public class IdentityDemo {
    private String name;
    private Integer id;
    private Boolean active;
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class IdentityDemo {
    private String name;
    private Integer id;
    private Boolean active;

    public Boolean equals(Object other) {
        if(other instanceof IdentityDemo) {
            IdentityDemo target = (IdentityDemo)other;
            return this.name == target.name && this.id == target.id && this.active == target.active;
        }
        return false;
    }

    public Integer hashCode() {
        Map<String, Object> data = new Map<String, Object>();
        data.put('name', this.name);
        data.put('id', this.id);
        data.put('active', this.active);
        return Sweet.generateHashCode(data);
    }
}
```

</article>

<article id="5">

## Usage

`@identity` only includes non-static fields.

Some variations are:

| Example | Description |
| ------- | ----------- |
| @identity | Generate all non-static fields |
| @identity(&amp;#123; 'name', 'id' &amp;#125;) | Generate the given fields |
| @identity(fields=&amp;#123; 'name', 'id' &amp;#125;) | Generate the given fields |

</article>
