public class FeatureOrder {
    public static Integer init() {
        return 0;
    }
    public static Integer add(Integer a, Integer b) {
        return (Integer)F.add.runN(new List<Object>{ a, b });
    }

    public static final Funcs F = new Funcs();

    public class Funcs {
        public Func add = new AddFunc();
    }

    private class AddFunc extends Func {
        public AddFunc() {
            super(-1);
        }
        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            Integer b = args.get(1) == null ? null : (Integer)args.get(1);

            a = (a == null) ? init() : a;
            b = (b == null) ? init() : b;

            Sweet.assertNotNull(a, '"a" in FeatureOrder.add(Integer, Integer) should not be null');
            Sweet.assertNotNull(b, '"b" in FeatureOrder.add(Integer, Integer) should not be null');

            return a + b;
        }
    }
}