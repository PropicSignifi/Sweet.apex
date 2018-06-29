---
title: "Rethrow"
description: "Rethrow"
layout: "guide"
icon: "code-file"
weight: 20
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature catches any exception thrown from the method and rethrows the wrapped exception.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class Rethrow {
    @AuraEnabled
    @rethrow(AuraHandledException)
    public static void test() {
        System.debug('Rethrow exceptions');
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class Rethrow {
    @AuraEnabled
    public static void test() {
        try {
            System.debug('Rethrow exceptions');
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }
}
```

</article>

<article id="5">

## Usage

`@rethrow` can only be used on methods.

</article>
