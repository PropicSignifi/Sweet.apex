public class CastDemo {
    public static void main() {
        List<String> list1 = (List<Object> => List<String>)new List<Object>();
        List<List<Integer>> list2 = (List<List<Object>> => List<List<Integer>>)new List<List<Object>>();

        Map<String, String> map1 = (Map<Object, Object> => Map<String, String>)new Map<Object, Object>();
    }
}
