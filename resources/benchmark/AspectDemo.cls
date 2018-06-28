public class AspectDemo {
    public static Integer afterVersion(Type targetType, Integer base, Integer result) {
        return result + 1;
    }
    public static void beforeRun(AspectDemo target) {
        System.debug('Before running');
    }
    public void run() {
        AspectDemo.beforeRun(this);
        aspect_run();
    }
    public static Integer version(Integer base) {
        Integer ret = aspect_version(base);
        ret = (Integer)AspectDemo.afterVersion(AspectDemo.class, base, ret);
        return ret;
    }
    private void aspect_run() {
        System.debug('Running');
    }
    private static Integer aspect_version(Integer base) {
        return base + 1;
    }
}