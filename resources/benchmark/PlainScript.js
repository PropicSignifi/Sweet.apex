/*
 * This file is used to validate plain old Apex syntax.
 * */
class PlainScript extends Func {
    /**
     * Public field
     * */
    let id = 'Plain';
    let count;
    let t1 = List<String>.class;
    let t2 = Func.FuncException.class;
    let name {
        private set;

        get {
            return 'Hello ' + name;
        }
    }
    let mMap = { 'name': 'value' };
    let mList = [ 1, 2, 3 ];
    let accounts = [ SELECT Id FROM Account LIMIT 10 ];
    let accounts1 = [ SELECT Id FROM Account
            LIMIT 10 ];

    static {
        count = 0;
    }
    Plain(name) {
        super(-1);
        this.name = name;
    }
    Plain() {
        this(null);
    }
    function execN(args) {
        let i = (count > 0) ? 1 : 2;
        let total = 0;

        for(i = 0; i < 10 ; i++) {
            total = total + i;
        }
        total += mList[0];

        if(total > 20) {
            for(let obj of mList) {
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
        catch(e) {
            System.debug(e);
        }
        finally {
            System.debug('Finally');
        }

        return args;
    }
    function execute(context) {
    }
    function simpleTest() {
        System.assert(false);

        return;
    }
    function testRunAs() {
        let admin = DummyRecordCreator.admin;
        System.runAs(admin) {
            System.debug('Run As');
        }
    }
    class CustomClass {
        function init();
    }
    interface CustomInterface {
        function init();
    }
    public enum CustomEnum {
        One,
        Two,
        Three
    }
}