public class DestructureDemo {
    public static void main() {
        List<String> names = new List<String>{ 'Wilson', 'Adam' };
        String { p1, p2 } = names;

        Map<String, Object> infos = new Map<String, Object>{ 'a' => 1, 'b' => '2' };
        { a: Integer count, b: String id } = infos;

        Account ac = new Account(Name='test acc');
        { Name: String name } = ac;
    }
}
