public class FeatureOrder {
    public static Integer init() {
        return 0;
    }

    @func
    public static Integer add(
        @defaultValue(init())
        @notNull
        Integer a,

        @defaultValue(init())
        @notNull
        Integer b
    ) {
        return a + b;
    }
}
