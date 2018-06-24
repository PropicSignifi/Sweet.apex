public class Lambda {
    public static Func f = (Integer a) -> {
        return a + 1;
    };

    public static void test() {
        Integer num = 0;
        Func nested = () -> {
            return () -> {
                System.debug('Run');
            };
        };

        Func outerF = () -> {
            return outer.num;
        };
    }

    public void run() {
        Func thisF = () -> {
            return this;
        };
    }
}
