public class ScriptDemo {
    /**
     * Some comments
     * */
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }
    public static String env() {
        /* @script
          return 'script';
         */
        return 'apex';
    }
}