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

    private static List<BeanInfo> beanInfos = null;
    private static Map<Type, Type> boundTypes = new Map<Type, Type>();

    private static Map<String, Object> namedBeanCache = new Map<String, Object>();
    private static Map<Type, Object> typedBeanCache = new Map<Type, Object>();

    public static void bind(Type target, Type implementor) {
        if(target != null && implementor != null) {
            Sweet.boundTypes.put(target, implementor);
        }
    }

    public static void unbind(Type target) {
        if(target != null) {
            Sweet.boundTypes.remove(target);
        }
    }

    public static void setBeanInfos(List<BeanInfo> infos) {
        if(infos != null) {
            Sweet.beanInfos = infos;
        }
    }

    public static Object getBean(String name) {
        if(Sweet.beanInfos == null) {
            Sweet.loadBeanInfos();
        }

        if(Sweet.namedBeanCache.containsKey(name)) {
            return Sweet.namedBeanCache.get(name);
        }

        for(BeanInfo info : Sweet.beanInfos) {
            if(info.name == name) {
                Type beanType = Type.forName(info.type);
                return beanType.newInstance();
            }
        }

        return null;
    }

    public static Object getBean(Type targetType) {
        if(targetType != null) {
            if(Sweet.typedBeanCache.containsKey(targetType)) {
                return Sweet.typedBeanCache.get(targetType);
            }

            Type implementorType = Sweet.boundTypes.get(targetType);
            if(implementorType == null) {
                implementorType = targetType;
            }

            return implementorType.newInstance();
        }

        return null;
    }

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

    private static void loadBeanInfos() {
        try {
            String beansJSON = readFile('beans');
            List<BeanInfo> infos = (List<BeanInfo>)JSON.deserialize(beansJSON, List<BeanInfo>.class);
            Sweet.setBeanInfos(infos);
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Warn, 'Failed to load bean infos: ' + e.getMessage());
        }
    }

    public class BeanInfo {
        public String name;
        public String type;
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
