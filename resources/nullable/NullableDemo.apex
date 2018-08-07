public class NullableDemo {
    public static void main() {
        String s1 = 'abc';
        Integer i1 = s1.length();

        String s2 = null;
        Integer i2 = s2?.length();

        Integer i3 = ('a' + 'b')?.length();
    }
}
