---
title: "Transaction"
description: "Transaction"
layout: "guide"
icon: "code-file"
weight: 31
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates transactional methods that roll back when an exception is thrown.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
public class TransactionDemo {
    @transaction
    public void init() {
        // TODO
    }

    @transaction
    public static Integer sum() {
        return 0;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class TransactionDemo {
    public void init() {
        Savepoint sp = Database.setSavepoint();
        try {
            transaction_init();
        }
        catch(Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
    public static Integer sum() {
        Savepoint sp = Database.setSavepoint();
        try {
            return transaction_sum();
        }
        catch(Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
    private void transaction_init() {
        // TODO
    }
    private static Integer transaction_sum() {
        return 0;
    }
}
```

</article>

<article id="5">

## Usage

`@transaction` will surround the original method with try-catch block so that it will roll back the transaction in case of exceptions.

</article>
