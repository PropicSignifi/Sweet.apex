public class TaggedStringDemo {
    @tag
    public static String n(List<String> items, List<Object> values) {
        return 'prefix__' + String.join(items, '');
    }

    public static void main() {
        String s = n`Name`;
    }
}
