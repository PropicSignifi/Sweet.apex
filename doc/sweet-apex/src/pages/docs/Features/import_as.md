---
title: "Import As"
description: "Import As"
layout: "guide"
icon: "code-file"
weight: 37
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables importing a type as an alias.

</article>

<article id="2">

## Prerequisite

None.

</article>

<article id="3">

## Sweet Apex Example

```javascript
import Query as Q;

public class ImportAsDemo {
    public static Q update(Q query) {
        return query;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ImportAsDemo {
    public static Query update(Query query) {
        return query;
    }
}
```

</article>

<article id="5">

## Usage

The alias should be a simple name.

</article>
