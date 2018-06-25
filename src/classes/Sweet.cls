public class Sweet {
    public static void assertNotNull(Object value, String message) {
        if(value == null) {
            throw new SweetException(message);
        }
    }

    public static Reflection reflect(Object o) {
        if(o instanceof Reflectable) {
            return new Reflection((Reflectable)o);
        }

        throw new SweetException('Cannot reflect on this object');
    }

    public class AnonymousContext {
        private AnonymousContext parent;
        private Map<String, Object> context;

        public AnonymousContext(AnonymousContext parent, Map<String, Object> context) {
            this.parent = parent;
            this.context = context;
        }

        public Object get(String key) {
            if(context.containsKey(key)) {
                return context.get(key);
            }
            else if(this.parent != null) {
                return this.parent.get(key);
            }
            else {
                return null;
            }
        }
    }

    public virtual class BaseEnum {
        private String name;
        private Integer ordinal;

        protected BaseEnum setName(String name) {
            this.name = name;

            return this;
        }

        protected BaseEnum setOrdinal(Integer ordinal) {
            this.ordinal = ordinal;

            return this;
        }

        public virtual override String toString() {
            return this.name;
        }

        public Integer ordinal() {
            return this.ordinal;
        }
    }

    public class Reflection {
        private Reflectable target;

        public Reflection(Reflectable target) {
            this.target = target;
        }

        public List<String> getFieldNames() {
            return this.target.reflect_getFieldNames();
        }

        public Object getFieldValue(String name) {
            return this.target.reflect_getFieldValue(name);
        }

        public void setFieldValue(String name, Object value) {
            this.target.reflect_setFieldValue(name, value);
        }

        public List<String> getMethodNames() {
            return this.target.reflect_getMethodNames();
        }

        public Object invokeMethod(String name, List<Object> args) {
            return this.target.reflect_invokeMethod(name, args);
        }
    }

    public interface Reflectable {
        List<String> reflect_getFieldNames();

        Object reflect_getFieldValue(String name);

        void reflect_setFieldValue(String name, Object value);

        List<String> reflect_getMethodNames();

        Object reflect_invokeMethod(String name, List<Object> args);
    }

    public class SweetException extends Exception {
    }
}
