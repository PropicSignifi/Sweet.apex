---
title: "Function"
description: "Function"
layout: "guide"
icon: "code-file"
weight: 10
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts a static method to a Func.

For more details on Funcs, please check [R.apex](https://github.com/Click-to-Cloud/R.apex).

</article>

<article id="2">

## Prerequisite

You need to include [R.apex](https://github.com/Click-to-Cloud/R.apex) if you want to enable this feature.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class FunctionDemo {
    /**
     * A sample add function
     * */
    @func
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    public static void test() {
        System.debug(FuctionDemo.F.add.run(1, 2));
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class FunctionDemo {
    /**
     * A sample add function
     * */
    public static Integer add(Integer a, Integer b) {
        return (Integer)F.add.runN(new List<Object>{ a, b });
    }
    public static void test() {
        System.debug(FuctionDemo.F.add.run(1, 2));
    }

    public static final Funcs F = new Funcs();

    public class Funcs {
        public Func add = new AddFunc();
    }

    private class AddFunc extends Func {
        public AddFunc() {
            super(2);
        }
        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            Integer b = args.get(1) == null ? null : (Integer)args.get(1);

            return a + b;
        }
    }
}
```

</article>

<article id="5">

## Usage

`@func` works only with static methods.

To use the generated Funcs, you will have to refer to `ClassName.F.funcName`.

</article>
