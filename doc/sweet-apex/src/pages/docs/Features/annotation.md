---
title: "Annotation"
description: "Annotation"
layout: "guide"
icon: "code-file"
weight: 25
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature adds support for custom annotation on classes.

</article>

<article id="2">

## Prerequisite

None

</article>

<article id="3">

## Sweet Apex Example

```javascript
@MyAnnotation(name='Test')
public class AnnotationDemo {
    public @interface MyAnnotation {
        public String name();

        public Integer number() default 10;
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class AnnotationDemo {
    public class MyAnnotation {
        private String m_name;
        private Integer m_number = 10;
        public MyAnnotation name(String m_name) {
            this.m_name = m_name;
            return this;
        }
        public String name() {
            return this.m_name;
        }
        public MyAnnotation number(Integer m_number) {
            this.m_number = m_number;
            return this;
        }
        public Integer number() {
            return this.m_number;
        }
    }
}
```

</article>

<article id="5">

## Sweet Annotations

```javascript
public class SweetAnnotations implements Sweet.Annotations {
    private final Map<String, List<Object>> annotations = new Map<String, List<Object>>();

    public List<Object> getAnnotations(String name) {
        List<Object> aList = annotations.get(name);
        return aList == null ? new List<Object>() : aList;
    }

    public Object getAnnotation(String name) {
        List<Object> aList = getAnnotations(name);
        return aList.isEmpty() ? null : aList.get(0);
    }

    private void registerAnnotation(String targetName, Object annotation) {
        List<Object> aList = annotations.get(targetName);
        if(aList == null) {
            aList = new List<Object>();
        }
        aList.add(annotation);
        annotations.put(targetName, aList);
    }

    {
        registerAnnotation('AnnotationDemo', new AnnotationDemo.MyAnnotation().name('Test'));
    }
}
```

</article>

<article id="6">

## Usage

Define custom annotations.

```javascript
public @interface MyAnnotation {
    public String name();

    public Integer number() default 10;
}
```

Apply custom annotations on classes.

```javascript
@MyAnnotation(name='Test')
public class AnnotationDemo {
}
```

Retrieve annotation information from the instance of the class.

```javascript
AnnotationDemo demo = new AnnotationDemo();
AnnotationDemo.MyAnnotation myAnn = (AnnotationDemo.MyAnnotation)Sweet.getAnnotation(demo);
System.debug(myAnn.name());
```

</article>
