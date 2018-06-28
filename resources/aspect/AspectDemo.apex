public class AspectDemo {
    @afterMethod('AspectDemo.version')
    public static Integer afterVersion(Object target, List<Object> args, Object result) {
        return (Integer)result + 1;
    }

    @beforeMethod({ 'AspectDemo.run', 'Other..*' })
    public static void beforeRun(Object target, List<Object> args) {
        System.debug('Before running');
    }

    public void run() {
        System.debug('Running');
    }

    public static Integer version(Integer base) {
        return base + 1;
    }
}
