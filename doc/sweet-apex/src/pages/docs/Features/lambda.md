---
title: "Lambda"
description: "Lambda"
layout: "guide"
icon: "code-file"
weight: 13
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts a lambda expression to an anonymous Func.

Check details on [R.apex](https://github.com/Click-to-Cloud/R.apex).

</article>

<article id="2">

## Prerequisite

You need to include [R.apex](https://github.com/Click-to-Cloud/R.apex) if you want to enable this feature.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class LambdaDemo {
    public static Func f = (Integer a) -> {
        return a + 1;
    };
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class LambdaDemo {
    public static Func f = new AnonymousFunc0(new Sweet.AnonymousContext(null, new Map<String, Object>{  }));

    private class AnonymousFunc0 extends Func {
        private Sweet.AnonymousContext anonymous_context;
        public AnonymousFunc0(Sweet.AnonymousContext context) {
            super(1);
            this.anonymous_context = context;
        }
        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            return a + 1;
        }
    }
}
```

</article>

<article id="5">

## Usage

Lambda expression are like `(Type1 name1, Type2 name2) -> &#123; ... &#125;`.

We convert lambda expression to anonymous functions.

Here are the things we need to pay attention to:

- Lambda expressions take `this` as reference to the enclosing object, not the functions.

- Nested lambda expressions are supported.

- You can refer to variables from enclosing block by using `outer.Xxx`, but this does NOT support nested lambda expressions.

</article>
