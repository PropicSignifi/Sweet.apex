public class Lambda {
    public static Func f = new AnonymousFunc0(new Sweet.AnonymousContext(null, new Map<String, Object>{  }));

    public static void test() {
        Integer num = 0;
        Func nested = new AnonymousFunc1(new Sweet.AnonymousContext(null, new Map<String, Object>{  }));

        Func outerF = new AnonymousFunc3(new Sweet.AnonymousContext(null, new Map<String, Object>{ 'num' => num }));
    }

    public void run() {
        Func thisF = new AnonymousFunc4(new Sweet.AnonymousContext(null, new Map<String, Object>{ 'this' => this }));
    }

    private class AnonymousFunc0 extends Func {
        private Sweet.AnonymousContext anonymous_context;

        public AnonymousFunc0(Sweet.AnonymousContext context) {
            super(1);
            this.anonymous_context = context;
        }

        public override Object execN(List<Object> args) {
            Integer a = args.get(0) == null ? null : (Integer)args.get(0);
            return a + 1;
        }
    }

    private class AnonymousFunc1 extends Func {
        private Sweet.AnonymousContext anonymous_context;

        public AnonymousFunc1(Sweet.AnonymousContext context) {
            super(0);
            this.anonymous_context = context;
        }

        public override Object execN(List<Object> args) {

            return new AnonymousFunc2(new Sweet.AnonymousContext(anonymous_context, new Map<String, Object>{  }));
        }
    }

    private class AnonymousFunc2 extends Func {
        private Sweet.AnonymousContext anonymous_context;

        public AnonymousFunc2(Sweet.AnonymousContext context) {
            super(0);
            this.anonymous_context = context;
        }

        public override Object execN(List<Object> args) {

            System.debug('Run');
            return null;
        }
    }

    private class AnonymousFunc3 extends Func {
        private Sweet.AnonymousContext anonymous_context;

        public AnonymousFunc3(Sweet.AnonymousContext context) {
            super(0);
            this.anonymous_context = context;
        }

        public override Object execN(List<Object> args) {

            return anonymous_context.get('num');
        }
    }

    private class AnonymousFunc4 extends Func {
        private Sweet.AnonymousContext anonymous_context;

        public AnonymousFunc4(Sweet.AnonymousContext context) {
            super(0);
            this.anonymous_context = context;
        }

        public override Object execN(List<Object> args) {

            return anonymous_context.get('this');
        }
    }
}