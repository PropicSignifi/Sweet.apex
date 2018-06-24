public class Rethrow {
    @AuraEnabled
    @rethrow(AuraHandledException)
    public static void test() {
        System.debug('Rethrow exceptions');
    }
}
