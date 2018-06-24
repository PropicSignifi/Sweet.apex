public class Lambda {
    public static Func f = new AnonymousFunc0();

    public static void test() {
        Func nested = new AnonymousFunc1();
    }

    private class AnonymousFunc0 extends Func {
        public AnonymousFunc0() {
            super(1);
        }

        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            return a + 1;
        }
    }

    private class AnonymousFunc1 extends Func {
        public AnonymousFunc1() {
            super(0);
        }

        public override Object execN(List<Object> args) {

            return new AnonymousFunc2();
        }
    }

    private class AnonymousFunc2 extends Func {
        public AnonymousFunc2() {
            super(0);
        }

        public override Object execN(List<Object> args) {

            System.debug('Run');
            return null;
        }
    }
}