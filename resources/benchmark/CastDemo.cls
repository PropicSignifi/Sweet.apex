public class CastDemo {
    public static void main() {
        List<String> list1 = cast_Utils.cast_List_Object_to_List_String(new List<Object>());
        List<List<Integer>> list2 = cast_Utils.cast_List_List_Object_to_List_List_Integer(new List<List<Object>>());

        Map<String, String> map1 = cast_Utils.cast_Map_Object_Object_to_Map_String_String(new Map<Object, Object>());
    }
}