public class Lambda {
    public static Func f = (Integer a) -> {
        return a + 1;
    };

    public static void test() {
        Func nested = () -> {
            return () -> {
                System.debug('Run');
            };
        };
    }
}
