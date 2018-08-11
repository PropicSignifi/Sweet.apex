# Sweet.apex
Sweet.apex is the next generation of Apex development, transpiling Sweet Apex(a feature-rich Apex-like code) to Apex classes.

## Why Sweet.apex?
Have you ever dreamed of using custom annotations in Apex? Have you ever wondered if you could eliminate some Apex boilerplate codes? Sweet.apex is here to make your dreams come true, by providing some of the most amazing features right at your disposal.

## Showtime
Before we move on, take a look at what Sweet.apex can do.

### Not Null Validation
With `@notNull`, we can specify the parameter value is not null. Otherwise, assertion exceptions will be thrown.

```java
public class NotNullDemo {
    public static Integer increment(@notNull Integer i) {
        return i + 1;
    }
}
```

### Equals and HashCode Generation
With `@identity`, `equals` and `hashCode` are automatically generated for our Apex class.

```java
@identity
public class IdentityDemo {
    private String name;
    private Integer id;
    private Boolean active;
}
```

### Template String
With template strings, we no longer need to concatenate strings.

```java
public class TemplateStringDemo {
    public static void run() {
        String name = 'Sweet.apex';
        Integer count = 0;
        String result = `Greeting ${name} for ${count} time(s)`;
    }
}
```

### Rethrow Exceptions
With `@rethrow`, we can catch any exception thrown from this method and rethrow it in a wrapped exception, particularly useful in Salesforce Lightning server controllers.

```java
public class RethrowDemo {
    @AuraEnabled
    @rethrow(AuraHandledException)
    public static String getMessage() {
        // Custom code
        throw new DmlException('For Demo Purpose');
        // Custom code
        return null;
    }
}
```

### Collection Casting
Casting between collections in Apex is hard, but Sweet.apex makes it easy.

```java
public class CastingDemo {
    public static void main() {
        Set<Object> set1 = new Set<Object>{ 'a', 'b' };
        Set<String> set2 = (Set<Object> => Set<String>)set1;
    }
}
```

### Custom Operators
Want to define custom operators? Go ahead.

```java
public class OperatorDemo {
    @operator
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    public static void main() {
        Integer a = 1;
        Integer b = 2;
        System.debug(a add b);
    }
}
```

## Take a Breath
When you read here, you might already have one question in mind. Is this real Apex code?

Yes and no.

Technically speaking, they are Sweet Apex codes, cousins of Apex codes, yet with more powers. In some way, they are equivalent to Apex codes, and we will see shortly.

Well, the code snippets above are just starters. We have much more fascinating main courses afterwards, but we are not going to show them here, as this is intended for us to get started. If you want to check it out, visit our documentation site for details.

## Inspirations
Before we reveal the secret of Sweet.apex, we would like to introduce one important Salesforce technique, SFDX. This is a developer-friendly command line tool that helps us do lots of things and creates many possibilities. Without DX, it would be nearly impossible to deploy our Apex code directly from locally to our Orgs. Yes, SFDX paves the way for building a brand-new development process, and let's take a closer look at this.

The time when we used to edit Apex files in the Salesforce console has long gone and now we can work locally on these files before deploying them using SFDX. Deploying Apex files has never been easier. Take that advantage to its best and keep on.

The Apex classes are the only acceptable source codes for Salesforce, but not for us. We can make any files as our source files, as long as they can be transformed into Apex classes in some way(Deploying Apex classes is so easy that we can simply ignore its impact). And this is where we got the inspirations.

This innovating source file can be of any kind, with any features, only if it can be converted to Apex classes. To make things easier, we adopt similar grammar with Salesforce Apex in this source file and name it the Sweet Apex file.

Sweet Apex files are bridged to Apex classes by one technique, **transpilation**, which is a process to compile from one kind of source file to another kind. Simply put, we **transpile** Sweet Apex codes into Apex classes, then deploying them by SFDX.

## Getting Started

### Big Picture
Knowing what transpilation is, you still need to grasp the big picture of how we are developing Apex codes now. We are not working directly on Apex codes. Instead, we are writing Sweet Apex codes, and then run a transpilation process to turn them into Apex codes before we deploy them. Keep this in mind and get your hands wet with the real Sweet Apex.

### Installation
Sweet.apex is a JavaScript project based on node.js. Make sure you have node.js and npm installed before you go on.

Clone the project from the github repo, go to the root of the project and run the command.

```bash
npm install
```

Wait until the installation is finished.

### Write First Sweet Apex
Go to any directory(`/Users/wilson/sweet_apex/src`, for example), and write a simple Sweet Apex file.

```java
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(a % b);
    }
}
```

Well, this is simple. But be careful. This file won't compile in Apex, because `%` is not supported. However, we are writing Sweet Apex files, and we will see what will happen.

### Transpile It
Let's say you want to build your Sweet Apex files into a directory called `/Users/wilson/sweet_apex/build`. Run the following command in the root of the project.

```bash
node transpile.js /Users/wilson/sweet_apex/src /Users/wilson/sweet_apex/build
```

Wait until it says it's completed.

### Transpiled Apex Class
Go to `/Users/wilson/sweet_apex/build` and check what has been generated. You can find a file called `HelloSweetApex.cls`, and it looks like this:

```java
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(Math.mod(a, b));
    }
}
```

Note that `a % b` has been translated to `Math.mod(a, b)`. This is a typical example of how Sweet Apex codes are transpiled to Apex codes.

### Deploy and Check
The next thing is definitely running your DX tools to deploy the code to your Org and check if it actually works.

## Features
Currently, Sweet.apex supports the following features:

- [action](https://click-to-cloud.github.io/sweet-apex/docs/Features/action.html)

Convert a method to an Action. For more details on Action, please check [Action.apex](https://github.com/Click-to-Cloud/Action.apex)

- [apexdoc](https://click-to-cloud.github.io/sweet-apex/docs/Features/apexdoc.html)

Generate simple JSON files representing Sweet Apex class structures and comments, which can be further used to create pretty documentation sites.

- [array creation](https://click-to-cloud.github.io/sweet-apex/docs/Features/array_creation.html)

Simplify how you create lists and maps.

- [aspect](https://click-to-cloud.github.io/sweet-apex/docs/Features/aspect.html)

Adopt aspects before and after your method invocations. Check AOP(Aspect Oriented Programming) for details.

- [cast](https://click-to-cloud.github.io/sweet-apex/docs/Features/cast.html)

Cast between collections of different lists, sets and maps.

- [default value](https://click-to-cloud.github.io/sweet-apex/docs/Features/default_value.html)

Specify the default value of method parameters.

- [enum](https://click-to-cloud.github.io/sweet-apex/docs/Features/enum.html)

Create enums that have custom methods.

- [file](https://click-to-cloud.github.io/sweet-apex/docs/Features/file.html)

Build files to static resources.

- [function](https://click-to-cloud.github.io/sweet-apex/docs/Features/function.html)

Convert methods to functions. Check [R.apex](https://github.com/Click-to-Cloud/R.apex) for more details on Funcs.

- [identity](https://click-to-cloud.github.io/sweet-apex/docs/Features/identity.html)

Generate `equals` and `hashCode` methods.

- [inject](https://click-to-cloud.github.io/sweet-apex/docs/Features/inject.html)

Inject beans to variables. Check DI(Dependency Injection).

- [lambda](https://click-to-cloud.github.io/sweet-apex/docs/Features/lambda.html)

Convert lambda expressions to anonymous functions.

- [log](https://click-to-cloud.github.io/sweet-apex/docs/Features/log.html)

Create logger object for the class. Check [Log.apex](https://github.com/Click-to-Cloud/Log.apex) for details.

- [mod](https://click-to-cloud.github.io/sweet-apex/docs/Features/mod.html)

Support modulo operator `%`.

- [not null](https://click-to-cloud.github.io/sweet-apex/docs/Features/not_null.html)

Assert method parameters are not null.

- [operator](https://click-to-cloud.github.io/sweet-apex/docs/Features/operator.html)

Define custom operators from static methods.

- [optional](https://click-to-cloud.github.io/sweet-apex/docs/Features/optional.html)

Create methods that support optional parameters.

- [reflect](https://click-to-cloud.github.io/sweet-apex/docs/Features/reflect.html)

Add reflection behavior to the class.

- [rethrow](https://click-to-cloud.github.io/sweet-apex/docs/Features/rethrow.html)

Catch any exception thrown from the method and rethrow it with a wrapped one.

- [switch](https://click-to-cloud.github.io/sweet-apex/docs/Features/switch.html)

Support `switch-case` syntax.

- [template](https://click-to-cloud.github.io/sweet-apex/docs/Features/template.html)

Support custom code template.

- [template string](https://click-to-cloud.github.io/sweet-apex/docs/Features/template_string.html)

Avoid concatenating strings.

- [script](https://click-to-cloud.github.io/sweet-apex/docs/Features/script.html)

Generate JavaScript equivalent functions from Apex methods.

- [tagged_string](https://click-to-cloud.github.io/sweet-apex/docs/Features/tagged_string.html)

Add custom tags to prefix strings.

- [annotation](https://click-to-cloud.github.io/sweet-apex/docs/Features/annotation.html)

Add support for defining custom annotations on classes.

- [nullable](https://click-to-cloud.github.io/sweet-apex/docs/Features/nullable.html)

Specify a nullable variable to avoid null de-reference.

- [var](https://click-to-cloud.github.io/sweet-apex/docs/Features/var.html)

Infer the variable type according to the context.

- [val](https://click-to-cloud.github.io/sweet-apex/docs/Features/val.html)

Infer the variable type according to the context and make it final.

- [map_access](https://click-to-cloud.github.io/sweet-apex/docs/Features/map_access.html)

Add array access support to maps.

- [constructor](https://click-to-cloud.github.io/sweet-apex/docs/Features/constructor_annotation.html)

Help generate constructors.

- [transaction](https://click-to-cloud.github.io/sweet-apex/docs/Features/transaction.html)

Generate transactional methods that roll back when an exception is thrown.

- [destructure](https://click-to-cloud.github.io/sweet-apex/docs/Features/destructure.html)

Destructure the list/map/sobject.

- [import_static](https://click-to-cloud.github.io/sweet-apex/docs/Features/import_static.html)

Import static fields and methods from classes.

- [pipeline](https://click-to-cloud.github.io/sweet-apex/docs/Features/pipeline.html)

Combine Func calls into pipelines.

- [varargs](https://click-to-cloud.github.io/sweet-apex/docs/Features/varargs.html)

Support var-args parameter in methods.

- [patch](https://click-to-cloud.github.io/sweet-apex/docs/Features/patch.html)

Support patching methods to a type.

## Feature Request
If you have any feature request, you can submit it in the issues. Or you can submit a PR to implement your own feature.
