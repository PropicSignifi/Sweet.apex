@identity
@reflect
@log
public class FeatureOrder {
    private String name;

    @inject('demo')
    private Case currentCase;

    @file('beans.json')
    private static String content = null;

    @beforeMethod('FeatureOrder.trigger')
    public static void logBeforeMethod(Sweet.MethodInfo method, List<Object> args) {
        #debug(`Before method ${method.name}`)
    }

    @afterMethod('FeatureOrder.trigger')
    public static void logAfterMethod(Sweet.MethodInfo method, List<Object> args, Object ret) {
        #debug('After method', method.name)
    }

    public List<String> getMethodNames() {
        Sweet.Reflection r = Sweet.reflect(this);
        return r.getMethodNames();
    }

    @AuraEnabled
    @rethrow(AuraHandledException)
    public static Integer mod(Integer a, Integer b) {
        return a % b;
    }

    /**
     * Trigger the action
     *
     * @param name The name of the action
     * */
    @AuraEnabled
    @action
    public static void trigger(String name) {
        run((String n) -> {
            System.debug(n);
        }, name);
    }

    public static List<String> toList(Object a, @optional Object b) {
        List<Object> ret = { a };
        if(b != null) {
            ret.add(b);
        }
        return (List<Object> => List<String>)ret;
    }

    public static Integer init() {
        return 0;
    }

    public static String getContent() {
        return content;
    }

    private static void run(Func callback, String name) {
        callback.run(name);
    }

    @operator
    public static Integer plus(Integer a, Integer b) {
        return a + b;
    }

    @script
    @func
    public static Integer add(
        @defaultValue(init())
        @notNull
        Integer a,

        @defaultValue(init())
        @notNull
        Integer b
    ) {
        /* @script
           return a + b;
         */
        return a plus b;
    }
}
