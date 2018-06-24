public class ActionDemo {
    private static Action.Registry registry = new Action.Registry();

    static {
        registry.action(new AddAction());
        registry.action(new StartAction());
        registry.action(new ConcatAction());
    }

    @AuraEnabled
    public static Object invoke(String name, Map<String, Object> args) {
        return registry.invoke(name, args);
    }

    @AuraEnabled
    public static Map<String, Action> apiDescriptorForLightning() {
        return registry.actions;
    }

    private class AddAction extends Action {
        public AddAction() {
            super('add');
            param('a', Integer.class, 'The first number');
            param('b', Integer.class, 'The second number');
            this.returnRaw();
        }

        public override Object execAction(Object arg0, Object arg1) {
            Integer a = (Integer)arg0;
            Integer b = (Integer)arg1;

            return a + b;
        }
    }

    private class StartAction extends Action {
        public StartAction() {
            super('start');
            param('id', String.class, 'id');

        }

        public override Object execAction(Object arg0) {
            String id = (String)arg0;
            System.debug('Started');
            return null;
        }
    }

    private class ConcatAction extends Action {
        public ConcatAction() {
            super('concat');
            param('s1', String.class, 's1');
            param('s2', String.class, 's2');
            param('s3', String.class, 's3');
            param('s4', String.class, 's4');
            this.returnRaw();
        }

        public override Object execActionN(List<Object> args) {
            String s1 = (String)args.get(0);
            String s2 = (String)args.get(1);
            String s3 = (String)args.get(2);
            String s4 = (String)args.get(3);

            return s1 + s2 + s3 + s4;
        }
    }
}