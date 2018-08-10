public class ArrayCreation {
    public static void run(Object o) {
    }
    public static void main() {
        Map<String, Object> m = new Map<String, Object>{ 'a' => 2 };
        List<Object> l = new List<Object>{ 'a' };

        Map<String, Object> m1 = new Map<String, Object>{ 'a' => 2 };
        List<Object> l1 = new List<Object>{ 'a' };

        Object m2 = new Map<String, Object>{ 'a' => 2 };
        Object l2 = new List<Object>{ 'a' };

        Map<String, Object> m3 = new Map<String, Object>{ 'a' => new Map<String, Object>{ 'b' => 2 } };
        List<Object> l3 = new List<Object>{ new List<Object>{ 'a' } };

        run(new Map<String, Object>{ 'a' => 2 });
        run(new List<Object>{ 'a' });

        Map<String, Integer> m4 = new Map<String, Integer>{ 'a' => 2 };
        m4 = new Map<String, Integer>{ 'a' => 3 };
    }
}