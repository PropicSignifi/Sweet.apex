public class Optional {
    public static void run(String s1, @optional String s2) {
        System.debug(s1 + (s2 == null ? '' : s2));
    }

    public static Integer add(Integer a, @optional Integer b, @optional Integer c) {
        b = b == null ? 0 : b;
        c = c == null ? 0 : c;

        return a + b + c;
    }
}
