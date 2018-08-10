public class cast_Utils {
    
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