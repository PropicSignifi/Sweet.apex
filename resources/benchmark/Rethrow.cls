public class Rethrow {
    @AuraEnabled
    public static void test() {
        try {
            System.debug('Rethrow exceptions');
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }
}