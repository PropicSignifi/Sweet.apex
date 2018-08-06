public class ArrayCreation {
    public List<Object> mList1 = new List<Object>{ 1, 2, 3 };

    public List<Object> mList2 = { 1, 2, 3 };

    public List<Object> mList3 = new Object []{ 1, 2, 3 };

    private Map<String, Object> mMap1 = new Map<String, Object>{ 'name' : 'value' };

    private Map<String, Object> mMap2 = { 'name' => 'value' };

    public void init() {
        List<Integer> ints = { 1, 2, 3 };
    }
}
