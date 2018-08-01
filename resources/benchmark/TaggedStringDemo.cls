public class TaggedStringDemo {
    public static String n(List<String> items, List<Object> values) {
        return 'prefix__' + String.join(items, '');
    }
    public static void main() {
        String s = (String)TaggedStringDemo.n(new List<String>{ 'Name' }, new List<Object>{  });
    }
}