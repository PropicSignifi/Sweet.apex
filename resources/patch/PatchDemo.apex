public class PatchDemo {
    @patch(String)
    public static String prefix(String s, String prefix) {
        return prefix + s;
    }

    public static void main() {
        String result = 'abc'.prefix('_');
    }
}
