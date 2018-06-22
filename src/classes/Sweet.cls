public class Sweet {
    public static void assertNotNull(Object value, String message) {
        if(value == null) {
            throw new SweetException(message);
        }
    }

    public class SweetException extends Exception {
    }
}
