public class AspectDemo {
    public static Integer afterVersion(Object target, List<Object> args, Object result) {
        return (Integer)result + 1;
    }
    public static void beforeRun(Object target, List<Object> args) {
        System.debug('Before running');
    }
    public void run() {
        AspectDemo.beforeRun(new Sweet.MethodInfo('run', AspectDemo.class, this, new List<Type>{  }), new List<Object>{  });
        aspect_run();
    }
    public static Integer version(Integer base) {
        Integer ret = aspect_version(base);
        ret = (Integer)AspectDemo.afterVersion(new Sweet.MethodInfo('version', AspectDemo.class, null, new List<Type>{ Integer.class }), new List<Object>{ base }, ret);
        return ret;
    }
    private void aspect_run() {
        System.debug('Running');
    }
    private static Integer aspect_version(Integer base) {
        return base + 1;
    }
}