public class NotNull {
    public static Integer add(Integer a, Integer b) {
        Sweet.assertNotNull(a, '"a" in NotNull.add(Integer, Integer) should not be null');
        Sweet.assertNotNull(b, '"b" in NotNull.add(Integer, Integer) should not be null');

        return a + b;
    }
}