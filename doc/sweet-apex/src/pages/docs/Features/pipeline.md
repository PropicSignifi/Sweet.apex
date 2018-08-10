---
title: "Pipeline"
description: "Pipeline"
layout: "guide"
icon: "code-file"
weight: 34
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature enables you to combine Func calls into pipelines.

</article>

<article id="2">

## Prerequisite

You need to include [R.apex](https://github.com/Click-to-Cloud/R.apex) if you want to enable this feature.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class PipelineDemo {
    public static void main() {
        Integer val = 1
            |> R.inc
            |> R.add.apply(1);

        val = 2 |> R.inc;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class PipelineDemo {
    public static void main() {
        Integer val = (Integer)((Func)R.add.apply(1)).run(((Func)R.inc).run(1));

        val = (Integer)((Func)R.inc).run(2);
    }
}
```

</article>

<article id="5">

## Usage

The data flows from top to bottom, left to right, running through each Func.

</article>
