public class DefaultValue {
    public static Integer init() {
        return 0;
    }
    public static Integer add(Integer a, Integer b) {
        a = (a == null) ? init() : a;
        b = (b == null) ? init() : b;

        return a + b;
    }
}