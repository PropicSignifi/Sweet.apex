public class TransactionDemo {
    public void init() {
        Savepoint sp = Database.setSavepoint();
        try {
            transaction_init();
        }
        catch(Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
    public static Integer sum() {
        Savepoint sp = Database.setSavepoint();
        try {
            return transaction_sum();
        }
        catch(Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
    private void transaction_init() {
        // TODO
    }
    private static Integer transaction_sum() {
        return 0;
    }
}