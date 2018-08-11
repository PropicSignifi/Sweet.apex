import static Math;

@log
public enum Demo {
    One('1'),
    Two('2'),
    Three('3');

    private String id;

    private Demo(String id) {
        this.id = id;
    }

    private static Map<String, Object> info = {
        'version': '1.0.0',
        'features': {
            'action',
            'array_creation',
        },
    };

    private static Map<String, Object> tag = json`{ "name": "JSON" }`;

    private static val GLOBAL_NAME = 'Demo';

    @inject
    private static Demo.Animal myAnimal = null;

    @beforeMethod('Demo.execute')
    public static void logMethod(Sweet.MethodInfo method, List<Object> args) {
        #debug('Executing method {0}', method.name)
    }

    @AuraEnabled
    @rethrow(AuraHandledException)
    public static Object execute(String id, Func callback) {
        System.debug(`Executing ${id}`);

        var myList = { 1, 2, 3 };
        List<Integer> intList = (List<Object> => List<Integer>)myList;

        var a = 1;
        var b = 2;
        var result = a mod b;
        result = result |> R.inc;

        result = product(1, 2, 3, 4);

        result = (Integer)Demo.F.multiply.run(result, 2);

        var cat = new Demo.Animal();

        var msg = 'Hello'.prefix('_');
        var size = msg?.length();

        Map<String, Integer> counts = { 'key': 1 };
        counts['key'] += 2;

        Integer { key } = counts;
        Integer { first, _, last } = intList;
        Double perimeter = 2 * PI * key;

        switch(result) {
            case 1:
                System.debug('correct');
                break;
            default:
                System.debug('incorrect');
        }

        return null;
    }

    @patch(String)
    public static String prefix(String s, String prefix) {
        return prefix + s;
    }

    @transaction
    public static void main() {
        String id = Demo.One.toString();
        execute(id, (String s) -> {
            String id = (String)outer.id;
            System.debug(s + id);
        });
    }

    @func
    public static Integer multiply(Integer a = 0, Integer b = 0) {
        return a * b;
    }

    @operator
    public static Integer mod(Integer a!, Integer b!) {
        return a % b;
    }

    @tag
    public static Map<String, Object> json(List<String> items, List<Object> values) {
        return (Map<String, Object>)JSON.deserializeUntyped(String.join(items, ''));
    }

    public static Integer sum(Integer a, Integer b?, Integer c?) {
        var result = a;

        if(b != null) {
            result += b;
        }

        if(c != null) {
            result += c;
        }

        return result;
    }

    public static Integer product(Integer ...nums) {
        Integer result = 1;
        for(Integer n : nums) {
            result *= n;
        }

        return result;
    }

    /**
     * @param a The first number
     * @param b The second number
     * */
    @AuraEnabled
    @action
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    @identity
    @constructor
    @reflect
    @MyAnnotation(mark='Test')
    public class Animal {
        private String name;
        private String kind;
    }

    public @interface MyAnnotation {
        public String mark();

        public Integer number() default 10;
    }
}
