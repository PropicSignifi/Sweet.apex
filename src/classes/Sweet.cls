public class Sweet {
    private static final Map<string, integer> HASH_CODE_VALS = new Map<string, integer>{
        '0' => 0,
        '1' => 1,
        '2' => 2,
        '3' => 3,
        '4' => 4,
        '5' => 5,
        '6' => 6,
        '7' => 7,
        '8' => 8,
        '9' => 9,
        'A' => 10,
        'B' => 11,
        'C' => 12,
        'D' => 13,
        'E' => 14,
        'F' => 15
    };

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

    public static String readFile(String filename) {
        if(!String.isBlank(filename)) {
            List<StaticResource> srList = [ SELECT Id, Body FROM StaticResource WHERE Name = :filename LIMIT 1 ];
            if(!srList.isEmpty()) {
                String body = srList[0].Body.toString();
                return body;
            }
        }

        return null;
    }

    public static Integer generateHashCode(Object obj) {
        String objJS = JSON.serialize(obj);
        Blob b = Blob.valueOf(objJS);
        Blob bHash = Crypto.generateMac('hmacSHA1', b, blob.valueOf('a key that does not matter'));
        String objHex = EncodingUtil.convertToHex(bHash);

        Long hash = Long.valueOf('2166136261');
        Long prime = Long.valueOf('16777619');

        for(String s : objHex.toUpperCase().split('')) {
            if(String.isEmpty(s))
                continue;
            hash = ((hash ^ HASH_CODE_VALS.get(s)) * prime);
        }

        return (Integer)hash;
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
