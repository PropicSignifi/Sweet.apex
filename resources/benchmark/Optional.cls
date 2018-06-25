public class Optional {
    public static void run(String s1, String s2) {
        System.debug(s1 + (s2 == null ? '' : s2));
    }

    public static Integer add(Integer a, Integer b, Integer c) {
        b = b == null ? 0 : b;
        c = c == null ? 0 : c;

        return a + b + c;
    }

    public static void run(String s1) {
        run(s1, null);
    }

    public static Integer add(Integer a, Integer b) {
        return add(a, b, null);
    }

    public static Integer add(Integer a) {
        return add(a, null);
    }
}