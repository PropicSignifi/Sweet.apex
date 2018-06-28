public class cast_Utils {
    
    public static List<String> cast_List_Object_to_List_String(Object other) {
        List<Object> target = (List<Object>)other;
        List<String> ret = new List<String>();
        for(Object i : target) {
            String r = (String)i;
            ret.add(r);
        }

        return ret;
    }

    public static List<List<Integer>> cast_List_List_Object_to_List_List_Integer(Object other) {
        List<List<Object>> target = (List<List<Object>>)other;
        List<List<Integer>> ret = new List<List<Integer>>();
        for(List<Object> i : target) {
            List<Integer> r = cast_List_Object_to_List_Integer(i);
            ret.add(r);
        }

        return ret;
    }

    public static Map<String, String> cast_Map_Object_Object_to_Map_String_String(Object other) {
        Map<Object, Object> target = (Map<Object, Object>)other;
        Map<String, String> ret = new Map<String, String>();
        for(Object key : target.keySet()) {
            Object value = target.get(key);
            String k = (String)key;
            String v = (String)value;
            ret.put(k, v);
        }

        return ret;
    }

    public static List<Integer> cast_List_Object_to_List_Integer(Object other) {
        List<Object> target = (List<Object>)other;
        List<Integer> ret = new List<Integer>();
        for(Object i : target) {
            Integer r = (Integer)i;
            ret.add(r);
        }

        return ret;
    }
}