// This is a generated file. Please do not modify it.
public class Demo extends Sweet.BaseEnum {
    public static final Demo One = (Demo)new Demo('1').setName('One').setOrdinal(0);
    public static final Demo Two = (Demo)new Demo('2').setName('Two').setOrdinal(1);
    public static final Demo Three = (Demo)new Demo('3').setName('Three').setOrdinal(2);

    private static final Map<String, Demo> instances = new Map<String, Demo>{ 'One' => One, 'Two' => Two, 'Three' => Three };

    public static List<Demo> values() {
        return instances.values();
    }

    public static Demo valueOf(String name) {
        return instances.get(name);
    }

    public static final Log logger = Log.getLogger(Demo.class);

    private String id;
    private Demo(String id) {
        this.id = id;
    }
    private static Map<String, Object> info = new Map<String, Object>{ 'version' => '1.0.0', 'features' => new List<Object>{ 'action', 'array_creation' } };
    private static Map<String, Object> tag = (Map<String, Object>)Demo.json(new List<String>{ '{ "name": "JSON" }' }, new List<Object>{  });
    private static final String GLOBAL_NAME = 'Demo';
    private static Demo.Animal myAnimal = (Demo.Animal)Sweet.getBean(Demo.Animal.class);
    public static void logMethod(Sweet.MethodInfo method, List<Object> args) {

        if(logger.isDebugEnabled()) {
            logger.debug('Executing method {0}', method.name);
        }
    }
    @AuraEnabled
    public static Object execute(String id, Func callback) {
        Demo.logMethod(new Sweet.MethodInfo('execute', Demo.class, null, new List<Type>{ String.class, Func.class }), new List<Object>{ id, callback });
        Object ret = aspect_execute(id, callback);
        return ret;
    }
    public static void main() {
        Savepoint sp = Database.setSavepoint();
        try {
            transaction_main();
        }
        catch(Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
    public static Integer multiply(Integer a, Integer b) {
        return (Integer)F.multiply.runN(new List<Object>{ a, b });
    }
    public static Integer mod(Integer a, Integer b) {
        Sweet.assertNotNull(a, '"a" in Demo.mod(Integer, Integer) should not be null');
        Sweet.assertNotNull(b, '"b" in Demo.mod(Integer, Integer) should not be null');

        return Math.mod(a, b);
    }
    public static Map<String, Object> json(List<String> items, List<Object> values) {
        return (Map<String, Object>)JSON.deserializeUntyped(String.join(items, ''));
    }
    public static Integer sum(Integer a, Integer b, Integer c) {
        Integer result = a;

        if(b != null) {
            result += b;
        }
        if(c != null) {
            result += c;
        }
        return result;
    }
    public static Integer product(List<Integer> nums) {
        Integer result = 1;
        for(Integer n : nums) {
            result *= n;
        }

        return result;
    }

    public class Animal implements Sweet.Reflectable {
        private String name;
        private String kind;

        public Boolean equals(Object other) {
            if(other instanceof Animal) {
                Animal target = (Animal)other;
                return this.name == target.name && this.kind == target.kind;
            }
            return false;
        }

        public Integer hashCode() {
            Map<String, Object> data = new Map<String, Object>();
            data.put('name', this.name);
            data.put('kind', this.kind);
            return Sweet.generateHashCode(data);
        }

        public Animal() {
        }

        public Animal(String name, String kind) {
            this.name = name;
            this.kind = kind;
        }

        public List<String> reflect_getFieldNames() {
            return new List<String>{ 'name', 'kind' };
        }

        public Object reflect_getFieldValue(String name) {
            if(name == 'name') {
                return this.name;
            } else {
                if(name == 'kind') {
                    return this.kind;
                } else {
                    throw new Sweet.SweetException('Field ' + name + ' does not exist');
                }
            }
        }

        public void reflect_setFieldValue(String name, Object value) {
            if(name == 'name') {
                this.name = (String)value;
            } else {
                if(name == 'kind') {
                    this.kind = (String)value;
                } else {
                    throw new Sweet.SweetException('Field ' + name + ' does not exist');
                }
            }
        }

        public List<String> reflect_getMethodNames() {
            return new List<String>{ 'equals', 'hashCode' };
        }

        public Object reflect_invokeMethod(String name, List<Object> args) {
            if(name == 'equals') {
                return this.equals((Object)args.get(0));
            } else {
                if(name == 'hashCode') {
                    return this.hashCode();
                } else {
                    throw new Sweet.SweetException('Method ' + name + ' does not exist');
                }
            }
            return null;
        }
    }
    public class MyAnnotation {
        private String m_mark;
        private Integer m_number = 10;
        public MyAnnotation mark(String m_mark) {
            this.m_mark = m_mark;
            return this;
        }
        public String mark() {
            return this.m_mark;
        }
        public MyAnnotation number(Integer m_number) {
            this.m_number = m_number;
            return this;
        }
        public Integer number() {
            return this.m_number;
        }
    }

    private class AnonymousFunc0 extends Func {
        private Sweet.AnonymousContext anonymous_context;
        public AnonymousFunc0(Sweet.AnonymousContext context) {
            super(-1);

            this.anonymous_context = context;
        }
        public override Object execN(List<Object> args) {
            String s = args.get(0) == null ? null : (String)args.get(0);
            String id = (String)anonymous_context.get('id');
            System.debug(s + id);
            return null;
        }
    }

    public static Integer sum(Integer a, Integer b) {
        return sum(a, b, null);
    }

    public static Integer sum(Integer a) {
        return sum(a, null);
    }
    private static Object aspect_execute(String id, Func callback) {
        try {
            System.debug('Executing ' + id + '');

            List<Object> myList = new List<Object>{ 1, 2, 3 };
            List<Integer> intList = cast_Utils.cast_List_Object_to_List_Integer(myList);

            Integer a = 1;
            Integer b = 2;
            Integer result = (Integer)Demo.mod((Integer)a, (Integer)b);
            result = (Integer)((Func)R.inc).run(result);

            result = product(new List<Integer>{ 1, 2, 3, 4 });

            result = (Integer)Demo.F.multiply.run(result, 2);

            Demo.Animal cat = new Demo.Animal();

            String msg = 'Hello';
            Integer size = (msg != null ? msg.length() : null);

            Map<String, Integer> counts = new Map<String, Integer>{ 'key' => 1 };
            counts.put('key', counts.get('key') + 2);

            Map<String, Object> destructure_22 = (Map<String, Object>)counts;
            Integer key = (Integer)destructure_22.get('key');
            List<Object> destructure_24 = (List<Object>)intList;
            Integer first = (Integer)destructure_24.get(0);
            Integer last = (Integer)destructure_24.get(destructure_24.size() - 1);
            Double perimeter = 2 * Math.PI * key;

            Object var_29_s = result;
            if(var_29_s == 1) {
                System.debug('correct');
            } else {
                System.debug('incorrect');
            }

            return null;
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static void transaction_main() {
        String id = Demo.One.toString();
        execute(id, new AnonymousFunc0(new Sweet.AnonymousContext(null, new Map<String, Object>{ 'id' => id })));
    }

    public static final Funcs F = new Funcs();

    public class Funcs {
        public Func multiply = new MultiplyFunc();
    }

    private class MultiplyFunc extends Func {
        public MultiplyFunc() {
            super(-1);
        }
        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            Integer b = args.get(1) == null ? null : (Integer)args.get(1);

            a = (a == null) ? 0 : a;
            b = (b == null) ? 0 : b;

            return a * b;
        }
    }
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