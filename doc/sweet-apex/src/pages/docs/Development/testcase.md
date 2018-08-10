---
title: "Test Case"
description: "Test Case"
layout: "guide"
icon: "cloud"
weight: 3
---

###### {$page.description}

<article id="1">

## Test Cases

Test cases are written with jasmine framework. You need to put your test case in `spec` directory.

</article>

<article id="2">

## Run Test Cases

Run the command to start the test cases.

```bash
jasmine
```

</article>

<article id="3">

## Generate Test Data

Make sure that you generate the test data with only the target feature enabled

```bash
node transpile.js resource/ build/ mod -c -e
```

</article>

<article id="4">

## Run Integration Test

Integration test cases are listed under `integration` directory.

Run the below code to start the integration test.

```bash
./run_integration_test.sh
```

</article>
