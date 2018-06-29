---
title: "Reflection"
description: "Reflection"
layout: "guide"
icon: "code-file"
weight: 19
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates reflection code for a class.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
@reflect
public class ReflectDemo {
    private static String version = '1.0';
    private String name;
    private Integer count;

    public ReflectDemo() {

    }

    public String getName() {
        return this.name;
    }

    public Integer getCount() {
        return this.count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public static void test() {
        ReflectDemo demo = new ReflectDemo();
        Sweet.Reflection reflection = Sweet.reflect(demo);
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ReflectDemo implements Sweet.Reflectable {
    private static String version = '1.0';
    private String name;
    private Integer count;
    public ReflectDemo() {

    }
    public String getName() {
        return this.name;
    }
    public Integer getCount() {
        return this.count;
    }
    public void setCount(Integer count) {
        this.count = count;
    }
    public static void test() {
        ReflectDemo demo = new ReflectDemo();
        Sweet.Reflection reflection = Sweet.reflect(demo);
    }

    public List<String> reflect_getFieldNames() {
        return new List<String>{ 'name', 'count' };
    }

    public Object reflect_getFieldValue(String name) {
        if(name == 'name') {
            return this.name;
        } else {
            if(name == 'count') {
                return this.count;
            } else {
                throw new Sweet.SweetException('Field ' + name + ' does not exist');
            }
        }
    }

    public void reflect_setFieldValue(String name, Object value) {
        if(name == 'name') {
            this.name = (String)value;
        } else {
            if(name == 'count') {
                this.count = (Integer)value;
            } else {
                throw new Sweet.SweetException('Field ' + name + ' does not exist');
            }
        }
    }

    public List<String> reflect_getMethodNames() {
        return new List<String>{ 'getName', 'getCount', 'setCount' };
    }

    public Object reflect_invokeMethod(String name, List<Object> args) {
        if(name == 'getName') {
            return this.getName();
        } else {
            if(name == 'getCount') {
                return this.getCount();
            } else {
                if(name == 'setCount') {
                    this.setCount((Integer)args.get(0));
                } else {
                    throw new Sweet.SweetException('Method ' + name + ' does not exist');
                }
            }
        }
        return null;
    }
}
```

</article>

<article id="5">

## Usage

`@reflect` can only generate reflection methods on non-static fields and methods(excluding constructors).

Here is how you can use the reflection.

```javascript
Sweet.Reflection r = Sweet.reflect(target);
Object value = r.getFieldValue('name');
```

</article>
