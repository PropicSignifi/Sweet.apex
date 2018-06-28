public class AspectDemo {
    @afterMethod('AspectDemo.version')
    public static Integer afterVersion(Type targetType, Integer base, Integer result) {
        return result + 1;
    }

    @beforeMethod('AspectDemo.run')
    public static void beforeRun(AspectDemo target) {
        System.debug('Before running');
    }

    public void run() {
        System.debug('Running');
    }

    public static Integer version(Integer base) {
        return base + 1;
    }
}
