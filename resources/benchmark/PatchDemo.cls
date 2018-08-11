public class PatchDemo {
    public static String prefix(String s, String prefix) {
        return prefix + s;
    }
    public static void main() {
        String result = PatchDemo.prefix('abc', '_');
    }
}