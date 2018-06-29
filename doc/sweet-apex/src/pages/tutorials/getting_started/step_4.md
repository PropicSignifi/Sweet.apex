---
title: "Transpiled Apex Class"
description: "Transpiled Apex Class"
buttonTitle: "Done"
parentId: "getting_started"
layout: "tutorial"
time: 90
weight: 4
---

## {$page.title}

Go to `/Users/wilson/sweet_apex/build` and check what has been generated. You can find a file called `HelloSweetApex.cls`, and it looks like this:

```javascript
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(Math.mod(a, b));
    }
}
```

Note that `a % b` has been translated to `Math.mod(a, b)`. This is a typical example of how Sweet Apex codes are transpiled to Apex codes.
