---
title: "Write First Sweet Apex"
description: "Write First Sweet Apex"
buttonTitle: "Done"
parentId: "getting_started"
layout: "tutorial"
time: 90
weight: 2
---

## {$page.title}

Go to any directory(`/Users/wilson/sweet_apex/src`, for example), and write a simple Sweet Apex file.

```javascript
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(a % b);
    }
}
```

Well, this is simple. But be careful. This file won't compile in Apex, because `%` is not supported. However, we are writing Sweet Apex files, and we will see what will happen.
