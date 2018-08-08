public class ValDemo {
    public static void main() {
        final String t = 'String';
        final Integer size = t.length();
        final String str = t.toString();

        final Account acc = new Account();

        List<String> slist = { 'a' };
        final List<String> ref = slist;
    }
}