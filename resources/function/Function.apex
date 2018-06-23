public class Function {
    @func
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    @func
    public static void run() {
        System.debug('Test');
    }

    public static void test() {
        System.debug(Function.F.run.run());
    }
}
