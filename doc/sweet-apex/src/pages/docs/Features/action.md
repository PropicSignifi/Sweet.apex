---
title: "Action"
description: "Action"
layout: "guide"
icon: "code-file"
weight: 2
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts a static method into an Action.

</article>

<article id="2">

## Prerequisite

You need to include [Action.apex](https://github.com/Click-to-Cloud/Action.apex) if you want to enable this feature.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class ActionDemo {
    /**
     * Some descriptions
     *
     * @param a The first number
     * @param b The second number
     * */
    @AuraEnabled
    @action
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class ActionDemo {
    private static Action.Registry registry = new Action.Registry();

    static {
        registry.action(new AddAction());
    }

    @AuraEnabled
    public static Object invoke(String name, Map<String, Object> args) {
        return registry.invoke(name, args);
    }

    @AuraEnabled
    public static Map<String, Action> apiDescriptorForLightning() {
        return registry.actions;
    }

    /**
     * Some descriptions
     *
     * @param a The first number
     * @param b The second number
     * */
    private class AddAction extends Action {
        public AddAction() {
            super('add');
            param('a', Integer.class, 'The first number');
            param('b', Integer.class, 'The second number');

        }
        public override Object execAction(Object arg0, Object arg1) {
            Integer a = (Integer)arg0;
            Integer b = (Integer)arg1;

            return a + b;
        }
    }
}
```

</article>

<article id="5">

## Usage

`@action` can only be used on public static methods with `@AuraEnabled`.

Some variations are:

| Example | Description |
| ------- | ----------- |
| @action | Convert this method to Action |
| @action(true) | Convert this method to Action and set `returnRaw(true)` |
| @action(returnRaw=true) | Convert this method to Action and set `returnRaw(true)` |

</article>
