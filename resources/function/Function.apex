public class Function {
    func Integer add(Integer a, Integer b) {
        return a + b;
    }

    func void run() {
        System.debug('Test');
    }

    public static void test() {
        System.debug(Function.F.run.run());
    }
}
