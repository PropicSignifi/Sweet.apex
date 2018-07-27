---
title: "Injection"
description: "Injection"
layout: "guide"
icon: "code-file"
weight: 12
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature injects dependency. See DI(Dependency Injection) for more details.

</article>

<article id="2">

## Prerequisite

You need to configure the `beans.json` file should you want to use the named beans.

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class InjectDemo {
    @inject
    private Case c1;

    @inject('demo')
    private Case c2;
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class InjectDemo {
    private Case c1 = (Case)Sweet.getBean(Case.class);
    private Case c2 = (Case)Sweet.getBean('demo');
}
```

</article>

<article id="5">

## Usage

`@inject` works for two scenarios.

- Named Injections

To inject a named bean, you need to configure it in the `beans.json` like this:

```JSON
[
    {
        "name": "demo",
        "type": "Case"
    }
]
```

- Type Injections

To inject a typed bean, you need to bind the type first.

```javascript
Sweet.bind(Case.class, Account.class); // Bind Case.class to be created by Account.class
Sweet.bindObject(Case.class, mockCase); // Bind Case.class to a created object
```

If no bindings are found, the original type will be used to create the instance.

</article>
