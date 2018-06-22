public class DefaultValue {
    public static Integer init() {
        return 0;
    }

    public static Integer add(
        @defaultValue(init()) Integer a,
        @defaultValue(init()) Integer b
    ) {
        return a + b;
    }
}
