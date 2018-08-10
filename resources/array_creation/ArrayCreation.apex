public class ArrayCreation {
    public static void run(Object o) {
    }

    public static void main() {
        Map<String, Object> m = new Map<String, Object>{ 'a': 2, };
        List<Object> l = new List<Object>{ 'a', };

        Map<String, Object> m1 = { 'a' => 2 };
        List<Object> l1 = { 'a' };

        Object m2 = { 'a' => 2 };
        Object l2 = { 'a' };

        Map<String, Object> m3 = { 'a' => { 'b' => 2 } };
        List<Object> l3 = { { 'a' } };

        run({ 'a' => 2 });
        run({ 'a' });

        Map<String, Integer> m4 = { 'a' => 2 };
        m4 = { 'a' => 3 };
    }
}
