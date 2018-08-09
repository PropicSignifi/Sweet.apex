---
title: "Import Static"
description: "Import Static"
layout: "guide"
icon: "code-file"
weight: 33
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature imports static fields and methods from classes and enables them to be used without prefixing class names.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
import static Math;

public class ImportStaticDemo {
    public static void main() {
        Double d = PI;

        Integer result = abs(-1);
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ImportStaticDemo {
    public static void main() {
        Double d = Math.PI;

        Integer result = Math.abs(-1);
    }
}
```

</article>

<article id="5">

## Usage

Static importing depends on type checking. Should type checking go wrong, static importing will fail.

</article>
