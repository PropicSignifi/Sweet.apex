/*
 * This file is used to validate plain old Apex syntax.
 * */
@isTest
private class Plain extends Func implements Queueable {
    /**
     * Public field
     * */
    public static final String id = 'Plain';
    private static Integer count;
    private Type t1 = List<String>.class;
    private Type t2 = Func.FuncException.class;
    String name {
        private set;

        get {
            return 'Hello ' + name;
        }
    }
    private static Map<String, Object> mMap = new Map<String, Object>{ 'name' => 'value' };
    private static List<Object> mList = new List<Object>{ 1, 2, 3 };
    private static List<SObject> accounts = [ SELECT Id FROM Account LIMIT 10 ];
    private static List<SObject> accounts1 = [ SELECT Id FROM Account
            LIMIT 10 ];

    static {
        count = 0;
    }
    public Plain(String name) {
        super(-1);
        this.name = name;
    }
    public Plain() {
        this(null);
    }
    public override Object execN(List<Object> args) {
        Integer i = (count > 0) ? 1 : 2;
        Integer total = 0;

        for(i = 0; i < 10 ; i++) {
            total = total + i;
        }
        total += (Integer)mList[0];

        if(total > 20) {
            for(Object obj : mList) {
                System.debug(obj);
            }
        } else {
            update accounts;
        }

        while(total > 0) {
            total -= 1;
        }

        upsert accounts Id;

        do {
            total += 1;
            if(total == 3) {
                break;
            } else {
                continue;
            }
        } while(total < 20);

        try {
            throw new DmlException();
        }
        catch(Exception e) {
            System.debug(e);
        }
        finally {
            System.debug('Finally');
        }

        return args;
    }
    public void execute(QueueableContext context) {
    }
    @isTest
    private static void simpleTest() {
        System.assert(false);

        return;
    }
    @isTest
    private static void testRunAs() {
        User admin = DummyRecordCreator.admin;
        System.runAs(admin) {
            System.debug('Run As');
        }
    }
    public abstract class CustomClass {
        public abstract void init();
    }
    public interface CustomInterface {
        void init();
    }
    public enum CustomEnum {
        One,
        Two,
        Three
    }
}