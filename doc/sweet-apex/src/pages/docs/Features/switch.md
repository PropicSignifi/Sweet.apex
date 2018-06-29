---
title: "Switch"
description: "Switch"
layout: "guide"
icon: "code-file"
weight: 21
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts `switch-case` structure to nested if-else.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class SwitchDemo {
    public static void test() {
        Integer i = 3;
        switch(i) {
            case 0:
                System.debug('0');
                break;
            case 1:
            case 2:
                System.debug('other');
            default:
                return;
        }
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class SwitchDemo {
    public static void test() {
        Integer i = 3;
        Object SwitchDemo_test_s = i;
        if(SwitchDemo_test_s == 0) {
            System.debug('0');
        } else {
            if(SwitchDemo_test_s == 1) {
            }
            if(SwitchDemo_test_s == 2) {
                System.debug('other');
            }
            return;
        }
    }
}
```

</article>

<article id="5">

## Usage

</article>
