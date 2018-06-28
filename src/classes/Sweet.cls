/**
 * MIT License
 *
 * Copyright (c) 2018 Click to Cloud Pty Ltd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/
public class Sweet {
    // Values used for hash code generation
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

    // Bean infos
    private static List<BeanInfo> beanInfos = null;

    // Bound types
    private static Map<Type, Type> boundTypes = new Map<Type, Type>();

    // Cache for the named beans
    private static Map<String, Object> namedBeanCache = new Map<String, Object>();

    // Cache for the typed beans
    private static Map<Type, Object> typedBeanCache = new Map<Type, Object>();

    /**
     * Bind the target type to the implementor type
     *
     * @param target
     * @param implementor
     * */
    public static void bind(Type target, Type implementor) {
        if(target != null && implementor != null) {
            Sweet.boundTypes.put(target, implementor);
        }
    }

    /**
     * Unbind the target type
     *
     * @param target
     * */
    public static void unbind(Type target) {
        if(target != null) {
            Sweet.boundTypes.remove(target);
        }
    }

    /**
     * Set the bean info list
     *
     * @param infos The bean info list
     * */
    public static void setBeanInfos(List<BeanInfo> infos) {
        if(infos != null) {
            Sweet.beanInfos = infos;
        }
    }

    /**
     * Get the bean with the name
     *
     * @param name The name of the bean
     * @return Object
     * */
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

    /**
     * Get the bean by the target type
     *
     * @param targetType The target type
     * @return Object
     * */
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

    /**
     * Assert the object is not null
     *
     * @param value The target object
     * @param message The assertion message
     * */
    public static void assertNotNull(Object value, String message) {
        if(value == null) {
            throw new SweetException(message);
        }
    }

    /**
     * Reflect on the object
     *
     * @param o The target object
     * @return Reflection
     * */
    public static Reflection reflect(Object o) {
        if(o instanceof Reflectable) {
            return new Reflection((Reflectable)o);
        }

        throw new SweetException('Cannot reflect on this object');
    }

    /**
     * Read the content of the file(static resource)
     *
     * @param filename The name of the file(static resource)
     * @return String
     * */
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

    /**
     * Generate the hash code
     *
     * @param obj The object to generate the hash code
     * @return Integer
     * */
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

    /**
     * The bean info
     * */
    public class BeanInfo {
        public String name;
        public String type;
    }

    /**
     * The anonymous context to be used by the Func
     * */
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

    /**
     * The base class for the Enum
     * */
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

        /**
         * Get the ordinal of the enum constant
         *
         * @return Integer
         * */
        public Integer ordinal() {
            return this.ordinal;
        }
    }

    /**
     * The reflection infor
     * */
    public class Reflection {
        private Reflectable target;

        /**
         * Wrap the reflectable object
         * */
        public Reflection(Reflectable target) {
            this.target = target;
        }

        /**
         * Get all the field names
         *
         * @return List<String>
         * */
        public List<String> getFieldNames() {
            return this.target.reflect_getFieldNames();
        }

        /**
         * Get the field value
         *
         * @param name The name of the field
         * @return Object
         * */
        public Object getFieldValue(String name) {
            return this.target.reflect_getFieldValue(name);
        }

        /**
         * Set the field value
         *
         * @param name The name of the field
         * @param value The value of the field
         * */
        public void setFieldValue(String name, Object value) {
            this.target.reflect_setFieldValue(name, value);
        }

        /**
         * Get the method names
         *
         * @return List<String>
         * */
        public List<String> getMethodNames() {
            return this.target.reflect_getMethodNames();
        }

        /**
         * Invoke the method
         *
         * @param name The name of the method
         * @param args The arguments of the method
         * @return Object
         * */
        public Object invokeMethod(String name, List<Object> args) {
            return this.target.reflect_invokeMethod(name, args);
        }
    }

    /**
     * The reflectable interface, to mark an apex class to be reflectable
     * */
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
