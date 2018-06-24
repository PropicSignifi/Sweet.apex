public class ActionDemo {
    /**
     * @param a The first number
     * @param b The second number
     * */
    @AuraEnabled
    @action
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }

    @AuraEnabled
    @action
    public static void start(String id) {
        System.debug('Started');
    }

    @AuraEnabled
    @action
    public static String concat(String s1, String s2, String s3, String s4) {
        return s1 + s2 + s3 + s4;
    }
}
